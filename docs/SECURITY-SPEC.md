# Integrius Client Portal — Security Specification

**Version:** 1.0
**Date:** 2026-03-24
**Status:** Approved for Implementation
**Audience:** Lead Developer, DevOps

---

## 0. Scope and Existing Baseline

This spec covers the **client portal** layer that sits on top of the existing Integrius marketing/CMS application. The current codebase (`src/lib/auth.ts`, `src/lib/api-auth.ts`) implements a single-user CMS admin system using:

- `jose` for JWT signing (HS256, 12-hour TTL)
- `bcryptjs` for password hashing
- HttpOnly cookies (`cms_admin_token`)
- A single `cms_admin_users` table in PostgreSQL (Prisma)
- Security headers set in `next.config.mjs` (HSTS, X-Frame-Options, CSP-adjacent headers)
- No rate limiting, no CSRF token, no refresh tokens, no MFA

The client portal must be built **alongside** this CMS system, not replacing it. All new tables will use the `portal_` prefix to maintain the existing convention of namespace isolation.

---

## 1. Threat Model — STRIDE Analysis

### 1.1 System Components

```
[Browser Client]
     |
     | HTTPS
     v
[Next.js 14 App — integri.us]
     |                    |
     | Prisma ORM         | JWT / HMAC license tokens
     v                    v
[PostgreSQL DB]    [Downstream Products]
                   (Core, Optic, Search, SDK)
```

### 1.2 Trust Boundaries

| Boundary | Description |
|---|---|
| TB-1 | Public internet → Next.js API routes |
| TB-2 | Next.js server → PostgreSQL |
| TB-3 | Next.js server → Downstream product (license validation) |
| TB-4 | Org Admin → Org Member (within same tenant) |
| TB-5 | Integrius Staff → Client data |

### 1.3 STRIDE Threat Analysis

#### Spoofing

| ID | Threat | Asset | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| S-01 | Attacker forges a JWT token by guessing the signing secret | Admin/client session | Low if secret is strong | Critical | 256-bit random secrets; separate secret per token class |
| S-02 | Attacker replays a stolen access token before expiry | Any authenticated session | Medium | High | Short TTL (15 min access tokens); token rotation on refresh |
| S-03 | Attacker impersonates another client org by manipulating `org_id` in request body | Client data | High without controls | Critical | Row-level security — `org_id` taken from JWT, never from request body |
| S-04 | Attacker uses a revoked license key | Product access | Medium | High | License tokens carry `jti`; products check revocation list on first use per boot |
| S-05 | Attacker registers an email belonging to another user | Account takeover | Medium | Critical | Email verification required before account activation |

#### Tampering

| ID | Threat | Asset | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| T-01 | Client modifies their own JWT payload to elevate role | RBAC | Low (signature required) | Critical | Always verify JWT signature server-side; never decode without verification |
| T-02 | SQL injection via Prisma input | Database | Low (Prisma parameterises) | Critical | Never use `$queryRaw` with untrusted input; validate all inputs with Zod |
| T-03 | Attacker modifies a license token to extend expiry or change product scope | License entitlements | Low (HMAC-signed) | High | License tokens are HMAC-signed; tamper-evident by design |
| T-04 | CSRF — attacker forces authenticated user to perform state-changing requests | Any POST/PUT/DELETE | Medium | High | `SameSite=Strict` cookies; CSRF token for admin routes |
| T-05 | Path traversal via article `id` or `slug` parameters | DB records | Low (UUIDs) | Medium | Validate all IDs as UUIDs; Prisma WHERE clauses prevent cross-record access |

#### Repudiation

| ID | Threat | Asset | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| R-01 | Admin denies making a destructive change (delete article, revoke license) | Audit trail | Medium | Medium | Immutable audit log for all write operations; include actor identity |
| R-02 | Client denies activating a license key | License audit | Medium | Medium | Log IP, user agent, timestamp on every activation event |
| R-03 | Staff denies accessing client billing data | PII audit | Low | High | Log every read of billing or PII fields with staff identity |

#### Information Disclosure

| ID | Threat | Asset | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| I-01 | Client A queries an API endpoint and receives Client B's data | Multi-tenant isolation | High without controls | Critical | Every DB query scoped by `org_id` from JWT; see Section 4 |
| I-02 | License key exposed in server logs or error responses | License entitlements | Medium | High | Never log raw license keys; mask in error messages |
| I-03 | Billing info (card last 4, billing address) exposed in API responses | PII / financial | Medium | High | Encrypt at rest; return only masked values in API responses |
| I-04 | JWT payload decoded client-side exposes internal IDs or role structure | Session data | Medium | Low-Medium | Minimise JWT claims; avoid embedding sensitive business logic in tokens |
| I-05 | Error messages reveal internal DB structure or stack traces | Infrastructure | High (typical dev behaviour) | Medium | Generic error messages in production; log details server-side only |
| I-06 | `CMS_JWT_SECRET` defaults to `dev-secret-change-in-production` in production | Auth bypass | Low (deployment error) | Critical | Startup check: throw if secret equals default value |

#### Denial of Service

| ID | Threat | Asset | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| D-01 | Brute-force login attempts against portal accounts | Account access | High | High | Rate limit: 5 attempts per 15 min per IP; account lockout after 10 fails |
| D-02 | License validation spam from a compromised product install | Portal API | Medium | Medium | Rate limit license validation endpoint per license key |
| D-03 | Large payload submission to contact or article APIs | Server stability | Medium | Low | Enforce `Content-Length` limits; validate payload size in middleware |
| D-04 | Cron endpoint flooded without secret | Cron execution | Low (secret required) | Medium | `CRON_SECRET` validation already present; add IP allowlist for cron caller |

#### Elevation of Privilege

| ID | Threat | Asset | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| E-01 | Org Member promotes themselves to Org Admin | Admin functions | Medium | High | Role changes only permitted by Org Admin or Integrius staff; role stored in DB, not client-controlled |
| E-02 | Billing Manager accesses article CMS admin panel | CMS access | Medium | Medium | Separate cookie namespaces and JWT secrets for CMS vs portal; no cross-system session sharing |
| E-03 | Support staff reads billing data they should not see | Staff RBAC | Medium | High | RBAC checks at route level; billing data gated to `billing_manager` and `admin` roles only |
| E-04 | Compromised Org Admin revokes licenses for other orgs | License management | Low (org-scoped) | High | License operations scoped to `org_id` from JWT; Integrius staff required for cross-org actions |

---

## 2. Authentication Design

### 2.1 Token Architecture — Two Separate JWT Systems

The current system uses a single `CMS_JWT_SECRET`. The portal requires a completely separate token system. **The two systems must never share secrets or cookies.**

```
CMS Admin System          Client Portal System
─────────────────         ───────────────────────────────
Secret: CMS_JWT_SECRET    Secrets: PORTAL_ACCESS_SECRET
                                   PORTAL_REFRESH_SECRET
Cookie: cms_admin_token   Cookies: portal_access_token (15 min)
                                   portal_refresh_token (30 days)
Algorithm: HS256           Algorithm: HS256 (access), HS256 (refresh)
TTL: 12h                   Access TTL: 15 min
                           Refresh TTL: 30 days
```

**Rationale for separation:** A compromise of one secret cannot be used to forge tokens for the other system. The CMS admin session should not grant any portal access and vice versa.

### 2.2 Access Token Payload

```typescript
// Portal access token — kept minimal
interface PortalAccessClaims {
  sub: string;           // portal_users.id (UUID)
  email: string;
  org_id: string;        // portal_organisations.id (UUID) — null for staff
  role: PortalRole;      // see RBAC section
  jti: string;           // UUID — for revocation
  iat: number;
  exp: number;           // iat + 15 minutes
}

// Integrius staff access token
interface StaffAccessClaims {
  sub: string;           // portal_staff.id (UUID)
  email: string;
  staff_role: StaffRole;
  jti: string;
  iat: number;
  exp: number;           // iat + 8 hours
}
```

**Important constraints:**
- `org_id` is set at login from the database. It is never read from the request body, query string, or any client-supplied input.
- The `role` field is the DB value at time of login. Role changes take effect at next login or refresh.
- Tokens are signed, not encrypted. Do not put anything in the payload that should not be readable.

### 2.3 Refresh Token Strategy

Clients need sessions longer than 12 hours. A rolling refresh token approach is used.

```
Login
  → Issue: access_token (15 min HttpOnly cookie)
          refresh_token (30 day HttpOnly cookie, Secure, SameSite=Strict)
          Store: refresh token hash in DB (portal_refresh_tokens table)

Access token expires
  → Client calls POST /api/portal/auth/refresh
  → Server verifies refresh token signature
  → Server checks token hash exists in DB and is not revoked
  → Server issues new access token + rotated refresh token
  → Old refresh token hash deleted from DB (rotation prevents replay)

Logout
  → Delete both cookies
  → Delete refresh token from DB (immediate invalidation)
```

**Refresh token table schema (informational — for the Lead Dev's migration):**

```sql
CREATE TABLE portal_refresh_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL UNIQUE,  -- SHA-256 of the raw token
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at   TIMESTAMPTZ,
  user_agent   TEXT,
  ip_address   INET
);
CREATE INDEX ON portal_refresh_tokens(user_id);
CREATE INDEX ON portal_refresh_tokens(token_hash);
```

**Rotation rule:** When a refresh token is used, the old record is deleted and a new one inserted atomically. If the same refresh token is presented twice (replay attack), both the old and new tokens must be immediately revoked and the user must re-authenticate.

### 2.4 TOTP-Based MFA

MFA is recommended for all portal accounts and mandatory for Integrius staff.

**Implementation approach:**
- Use the `otplib` npm package (maintained, RFC 6238 compliant)
- Store TOTP secret encrypted at rest in `portal_users.totp_secret_enc` using AES-256-GCM with `PORTAL_ENCRYPTION_KEY`
- On MFA setup: generate secret, show QR code, require user to verify one TOTP code before saving
- On login: after password validation, if `totp_enabled = true`, return a short-lived `mfa_pending` token (5 min, separate cookie) and require TOTP completion before issuing full access token
- Recovery codes: generate 8 single-use codes on MFA setup, store bcrypt hashes

```typescript
// MFA login flow
// Step 1: POST /api/portal/auth/login
//   Success → set mfa_pending_token cookie (5 min, scoped to /api/portal/auth/mfa)
//   No MFA  → set access_token + refresh_token cookies directly

// Step 2: POST /api/portal/auth/mfa  (only if totp_enabled)
//   Verify TOTP code against decrypted secret
//   On success: delete mfa_pending_token, set access_token + refresh_token
//   On failure: increment mfa_fail_count; lockout after 5 failures
```

**Staff requirement:** `staff_role` accounts must have `totp_enabled = true`. Attempting to log in as staff without MFA set up must return an error directing the user to configure MFA.

### 2.5 Brute-Force Protection

**Login endpoint (`POST /api/portal/auth/login`):**

| Threshold | Action |
|---|---|
| 5 failed attempts from same IP in 15 min | Return 429 with `Retry-After` header; continue accepting requests but introduce 2-second artificial delay |
| 10 failed attempts against same email in 1 hour | Lock account; send unlock email |
| 50 failed attempts from same IP in 1 hour | Block IP for 24 hours |

**Implementation:** Use an in-memory store (Upstash Redis preferred for production) keyed by `ip:endpoint` and `email:login`. If Redis is not available, fall back to a PostgreSQL-backed rate limit table with a cleanup job. Do not use the database as the primary rate limit store in high-traffic scenarios.

**Account lockout table (informational):**

```sql
-- Add to portal_users:
locked_until     TIMESTAMPTZ,
failed_login_count INT NOT NULL DEFAULT 0,
last_failed_login  TIMESTAMPTZ
```

**Unlock flow:** Email contains a time-limited signed unlock link. Do not allow self-service unlock via the UI without email confirmation — this defeats the lockout.

---

## 3. Authorization Design

### 3.1 Role Definitions

**Integrius Staff Roles (`staff_role` in `portal_staff` table):**

| Role | Display Name | Description |
|---|---|---|
| `admin` | Integrius Admin | Full access to all orgs, licenses, billing, and CMS |
| `billing_manager` | Billing Manager | Access to billing and license management across all orgs; no CMS |
| `support` | Support Agent | Read-only access to org details, licenses, and user lists; no billing data |

**Client Organisation Roles (`role` in `portal_org_members` table):**

| Role | Display Name | Description |
|---|---|---|
| `org_admin` | Organisation Admin | Full access within their org: manage users, view all licenses, view billing |
| `member` | Team Member | View licenses assigned to them; view own profile; no user management |

### 3.2 RBAC Permission Matrix

| Action | Integrius Admin | Billing Manager | Support | Org Admin | Member |
|---|---|---|---|---|---|
| **Organisation Management** |||||
| List all organisations | Y | Y | Y | — | — |
| Create organisation | Y | — | — | — | — |
| Edit organisation details | Y | — | — | Own org | — |
| Delete organisation | Y | — | — | — | — |
| **User Management** |||||
| List users in any org | Y | — | Y | Own org | — |
| Invite user to org | Y | — | — | Own org | — |
| Remove user from org | Y | — | — | Own org | — |
| Change user role within org | Y | — | — | Own org (cannot self-promote) | — |
| Disable/enable a user | Y | — | — | — | — |
| **License Management** |||||
| Issue new license key | Y | Y | — | — | — |
| View license keys (any org) | Y | Y | Y | — | — |
| View own org's license keys | Y | Y | Y | Y | Y (own only) |
| Revoke license key | Y | Y | — | — | — |
| Extend license expiry | Y | Y | — | — | — |
| **Billing** |||||
| View billing info (any org) | Y | Y | — | — | — |
| View own org billing | Y | Y | — | Y | — |
| Update payment method | Y | Y | — | Y | — |
| **CMS (existing admin panel)** |||||
| Access CMS | Y (admin only) | — | — | — | — |

**Implementation rule:** Every API route handler must enforce RBAC independently. Middleware at the route group level is a first layer of defence, not the only layer. Never rely solely on Next.js middleware for authorisation.

### 3.3 Row-Level Security — Org Isolation

This is the most critical security control in a multi-tenant system. Every database query for client data must include an `org_id` filter derived from the authenticated JWT.

**The golden rule:** `org_id` is ALWAYS taken from the verified JWT payload (`session.org_id`). It is NEVER taken from request bodies, query parameters, or URL path segments for data-scoping purposes.

**Enforced pattern for every portal API route:**

```typescript
// Example: GET /api/portal/licenses
export async function GET(req: NextRequest) {
  const session = await requirePortalSession(req);
  if (session instanceof NextResponse) return session;

  // org_id comes from the JWT — never from req.query or req.body
  const licenses = await prisma.portal_licenses.findMany({
    where: {
      org_id: session.org_id,   // REQUIRED on every query
      // ...additional filters
    },
  });

  return NextResponse.json({ licenses });
}
```

**Staff override pattern (when a staff member queries on behalf of an org):**

```typescript
// Staff must explicitly provide the target org_id in the path,
// and it must be validated against actual org existence
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await requireStaffSession(req, 'support'); // minimum role
  if (session instanceof NextResponse) return session;

  const { orgId } = await params;

  // Validate the org exists — prevents enumeration
  const org = await prisma.portal_organisations.findUnique({
    where: { id: orgId },
    select: { id: true },
  });
  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const licenses = await prisma.portal_licenses.findMany({
    where: { org_id: orgId },
  });

  return NextResponse.json({ licenses });
}
```

**Database-level enforcement (defence in depth):** Where the PostgreSQL user permits, add `CHECK` constraints or Row Level Security policies in PostgreSQL itself:

```sql
-- Enable RLS on sensitive tables
ALTER TABLE portal_licenses ENABLE ROW LEVEL SECURITY;

-- Policy: application user can only see rows matching current org context
-- (Requires setting app.current_org_id at query time via SET LOCAL)
CREATE POLICY portal_licenses_org_isolation ON portal_licenses
  USING (org_id = current_setting('app.current_org_id')::uuid);
```

This provides defence-in-depth even if a bug causes the application-level `org_id` filter to be omitted.

### 3.4 Next.js Middleware Route Protection

Create `src/middleware.ts` at the project root to enforce authentication before any request reaches a route handler:

```typescript
// Pattern — not implementation code
// src/middleware.ts
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Portal client routes: require portal_access_token cookie
  if (pathname.startsWith('/portal')) {
    const token = request.cookies.get('portal_access_token');
    if (!token) {
      return NextResponse.redirect(new URL('/portal/login', request.url));
    }
    // Full JWT verification happens in requirePortalSession() within the route handler
    // Middleware only gates the route — it does NOT replace route-level auth
  }

  // Portal API routes: 401 instead of redirect
  if (pathname.startsWith('/api/portal')) {
    const token = request.cookies.get('portal_access_token');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }
  }

  // CMS admin routes: existing behaviour preserved
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) {
    const token = request.cookies.get('cms_admin_token');
    if (!token) {
      return pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
        : NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
}

export const config = {
  matcher: ['/portal/:path*', '/api/portal/:path*', '/admin/:path*', '/api/admin/:path*'],
};
```

**Critical note:** The middleware presence check is a UX gate (avoids a round-trip for clearly unauthenticated requests). The route handler's call to `requirePortalSession()` is the authoritative security check because it verifies the JWT signature and checks expiry.

---

## 4. License Key Security

### 4.1 License Key Format and Generation

License keys are the mechanism through which clients activate and run Integrius products (Core, Optic, Search, SDK). Keys must be:
- Cryptographically unpredictable (cannot be guessed or enumerated)
- Human-distinguishable by product type
- Verifiable offline (at least initially) by downstream products

**Key format:**

```
INTG-{PRODUCT}-{BASE32_RANDOM}-{CHECKSUM}

Examples:
INTG-CORE-ABCDEFGHIJKLMNOP-X4K2
INTG-OPTIC-QRSTUVWXYZ234567-Y8P1
INTG-SRCH-ABCDEFGHIJ234567-Z2M9
INTG-SDK-QRSTUVWXYZ234567-A1N3
```

**Generation algorithm:**

```typescript
import { randomBytes, createHmac } from 'node:crypto';

const PRODUCT_CODES: Record<string, string> = {
  core:   'CORE',
  optic:  'OPTIC',
  search: 'SRCH',
  sdk:    'SDK',
};

function generateLicenseKey(product: keyof typeof PRODUCT_CODES): string {
  const productCode = PRODUCT_CODES[product];
  // 16 bytes = 128 bits of entropy, base32-encoded = 26 characters (padded)
  const randomPart = randomBytes(10)
    .toString('base64url')
    .replace(/[^A-Z2-7]/gi, '')  // keep base32 alphabet only
    .toUpperCase()
    .slice(0, 16)
    .padEnd(16, 'A');

  const body = `INTG-${productCode}-${randomPart}`;
  // 4-character Luhn-like checksum using HMAC-SHA256
  const checksum = createHmac('sha256', process.env.LICENSE_KEY_HMAC_SECRET!)
    .update(body)
    .digest('hex')
    .slice(0, 4)
    .toUpperCase();

  return `${body}-${checksum}`;
}
```

**Storage:** Store a SHA-256 hash of the raw key in `portal_licenses.key_hash`. Never store the plaintext key after the initial display to the org admin. The org admin sees the key once and must copy it. This mirrors how API keys work in products like Stripe and GitHub.

```sql
portal_licenses:
  key_hash      TEXT NOT NULL UNIQUE,  -- SHA-256(raw_key) stored, raw key discarded
  key_prefix    TEXT NOT NULL,         -- first 12 chars (e.g. "INTG-CORE-AB") for UI display
```

### 4.2 Offline Validation via JWT-Signed License Tokens

Downstream products must not call the portal on every request to validate a license — this creates an availability dependency and adds latency. Instead, the portal issues a signed **License Token** that the product can validate locally.

**Architecture:**

```
Client activates license in portal
  → Portal validates license key hash
  → Portal issues a License Token (signed JWT)
  → License Token returned to client
  → Client installs License Token in the product's config
  → Product validates License Token signature on startup (no network call)
  → Product re-validates against portal periodically (e.g., every 24h) for revocation
```

**License Token structure (signed with `LICENSE_TOKEN_SECRET`):**

```typescript
interface LicenseTokenClaims {
  jti: string;              // portal_licenses.id — for revocation lookup
  sub: string;              // org_id — who this license belongs to
  product: string;          // "core" | "optic" | "search" | "sdk"
  tier: string;             // "starter" | "platform" | "enterprise"
  data_source_limit: number; // max data sources permitted
  product_count_limit: number;
  features: string[];       // feature flags enabled for this license
  issued_at: number;        // Unix timestamp
  expires_at: number;       // Unix timestamp (license expiry — can be years out)
  portal_url: string;       // "https://integri.us" — for revocation check URL
}
```

**Signing:** Use RS256 (asymmetric) rather than HS256 for license tokens. This means:
- The portal holds the **private key** and signs the License Token
- Downstream products hold only the **public key** and can verify but cannot forge
- The public key can be distributed with the product binary or fetched from a well-known endpoint (`GET /api/portal/license/public-key`)

**Required new env vars:**
```
LICENSE_TOKEN_PRIVATE_KEY=<RSA private key, PEM format, 2048-bit minimum>
LICENSE_TOKEN_PUBLIC_KEY=<RSA public key, PEM format>
```

**Why asymmetric:** If the `HS256` `LICENSE_TOKEN_SECRET` were ever embedded in a distributed product binary, it could be used to forge tokens. With `RS256`, the private key never leaves the portal server.

### 4.3 License Validation Flow in Downstream Products

```
Product startup:
1. Read LICENSE_TOKEN from config/env
2. Verify JWT signature using embedded public key
3. Check exp > now (license not expired)
4. Check product field matches this product
5. Apply feature flags from features[] array
6. Schedule periodic online re-validation (every 24h)

Periodic online re-validation (every 24h):
POST https://integri.us/api/portal/license/validate
Body: { license_token: "..." }
Response 200: { valid: true, expires_at: "..." }
Response 401: { valid: false, reason: "revoked" }  → product must disable

On revocation response: product logs warning, disables features, notifies admin
```

### 4.4 License Revocation Strategy

Revocation must propagate within 24 hours (matching the re-validation interval).

**Revocation mechanisms:**

1. **Database flag:** `portal_licenses.revoked_at` is set. The `/api/portal/license/validate` endpoint checks this and returns `{ valid: false }`.

2. **Revocation list cache:** Maintain a Redis-backed or in-memory cache of revoked JTIs. Products that call the validation endpoint get a fast response without a DB query on every poll.

3. **Immediate invalidation for high-severity cases:** If a license must be revoked immediately (e.g., fraudulent use), set `revoked_at` and optionally update `expires_at` to the past. The next validation poll will catch this within 24 hours. For truly immediate revocation, contact the client to restart their product instance (which triggers startup validation).

**Revocation audit:** Every revocation event must be written to `portal_audit_log` with the acting staff member's ID, reason, and timestamp.

---

## 5. Data Protection

### 5.1 Fields Requiring Encryption at Rest

Application-layer encryption (AES-256-GCM) using `PORTAL_ENCRYPTION_KEY` is required for these fields in addition to the database's at-rest encryption:

| Table | Field | Reason |
|---|---|---|
| `portal_users` | `totp_secret_enc` | TOTP secret — plaintext exposure enables account takeover |
| `portal_billing` | `billing_address_enc` | PII — street address, postcode |
| `portal_billing` | `vat_number_enc` | Business identifier — PII in some jurisdictions |
| `portal_billing` | `payment_method_last4` | Stored only for display; actual card data never stored (handled by Stripe) |

**Fields that must NOT be stored:**
- Full card numbers (PAN) — never store, use Stripe tokenisation only
- CVV/CVC — prohibited under PCI-DSS
- Raw TOTP secrets (only store encrypted form)
- Raw license keys after issuance (only store hash)

**Encryption utility (approach):**

```typescript
// Use Node.js built-in crypto — no extra dependency
import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.PORTAL_ENCRYPTION_KEY!, 'hex'); // 32 bytes = 64 hex chars

export function encrypt(plaintext: string): string {
  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Store as iv:tag:ciphertext (all base64)
  return [iv.toString('base64'), tag.toString('base64'), encrypted.toString('base64')].join(':');
}

export function decrypt(stored: string): string {
  const [ivB64, tagB64, ctB64] = stored.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ct = Buffer.from(ctB64, 'base64');
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}
```

**Key rotation:** When `PORTAL_ENCRYPTION_KEY` is rotated, a migration script must re-encrypt all affected rows. Maintain a `key_version` column to identify which key version was used for each row.

### 5.2 PII Handling — GDPR Considerations

The client portal stores PII for EU-based clients. Required controls:

**Data minimisation:**
- Collect only fields necessary for the service
- `name`, `email`, `company` are required
- `phone` is optional and must be clearly marked as such

**Data subject rights:**
- `GET /api/portal/account/export` — returns a JSON export of all data held for the authenticated user (SAR response within 30 days)
- `DELETE /api/portal/account` — soft-delete: set `deleted_at`, anonymise PII fields within 30 days by a scheduled job. Preserve anonymised billing records for accounting purposes (7-year legal requirement)

**Retention:**
- Active user data: retained for the duration of the relationship + 1 year
- Audit logs: retained for 3 years (minimum) for security incident investigation
- Billing records: retained for 7 years (legal/tax requirement)

**Consent:** Record the date and version of Privacy Policy and Terms of Service accepted at registration. Store in `portal_users.privacy_policy_version` and `portal_users.tos_version`.

**Data processing:**
- Document that Prisma/PostgreSQL (hosted on your chosen cloud provider) is a data processor
- Ensure your database provider has a Data Processing Agreement (DPA) in place
- Do not send PII to third-party services (e.g., logging services) without explicit consent

**Sub-processors to document:** Resend (email), Stripe (billing), any logging/monitoring service.

---

## 6. API Security

### 6.1 CORS Policy

The CMS marketing site currently has no explicit CORS configuration (Next.js same-origin defaults apply). The portal API must add explicit CORS headers.

**Policy:**

```typescript
// Allowed origins (set in env, not hardcoded)
const ALLOWED_ORIGINS = (process.env.PORTAL_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Example env value:
// PORTAL_ALLOWED_ORIGINS=https://portal.integri.us,https://integri.us

function corsHeaders(origin: string | null): HeadersInit {
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return {}; // No CORS headers = same-origin only
  }
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true', // required for cookies
    'Access-Control-Max-Age': '86400',
  };
}
```

**License validation endpoint CORS:** The `/api/portal/license/validate` endpoint is called by server-side processes (Integrius Core, etc.) and does not need browser CORS. Do not add `Access-Control-Allow-Origin: *` to it.

**Never use `Access-Control-Allow-Origin: *` on any endpoint that processes authentication or returns user data.**

### 6.2 Rate Limiting Per Client

Rate limiting must be enforced at the API layer, keyed by authenticated identity where possible (not just IP, which can be shared by NAT-ed users).

| Endpoint Group | Limit | Key |
|---|---|---|
| `POST /api/portal/auth/login` | 5 req / 15 min | IP address |
| `POST /api/portal/auth/refresh` | 10 req / min | user_id (from refresh token) |
| `POST /api/portal/auth/mfa` | 5 req / 15 min | pending_session_id |
| `GET /api/portal/licenses/*` | 100 req / min | org_id |
| `POST /api/portal/license/validate` | 60 req / min | license key hash |
| `POST /api/portal/auth/forgot-password` | 3 req / hour | email + IP |
| `POST /api/contact` (existing) | 5 req / hour | IP address |
| All other portal API routes | 200 req / min | org_id or IP |

**Implementation:** Use the `@upstash/ratelimit` package with Upstash Redis for stateless rate limiting compatible with serverless deployments. If Redis is unavailable (e.g., local dev), fail open (allow the request) but log a warning.

**Response format when rate limited:**

```json
HTTP 429 Too Many Requests
Retry-After: 60
{
  "error": "Rate limit exceeded",
  "retry_after": 60
}
```

### 6.3 Input Validation Patterns

All request body and query parameter parsing must use `zod` schemas. The current codebase uses raw `as` type casts (e.g., `await req.json() as { email: string; password: string }` in the login route), which provide no runtime validation.

**Required pattern for all new portal routes:**

```typescript
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  totp_code: z.string().length(6).regex(/^\d+$/).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  // Use parsed.data — type-safe and validated
}
```

**Specific validation rules:**

| Field | Rule |
|---|---|
| Email | RFC 5321 format, max 254 chars, lowercase-normalised before storage |
| Password | Min 12 chars, max 128 chars (bcrypt truncates at 72 — validate before hashing) |
| UUIDs | Validated as UUIDs before use in DB queries (prevents path traversal via IDs) |
| License key format | Regex: `^INTG-[A-Z]+-[A-Z2-7]{16}-[A-F0-9]{4}$` |
| Slug fields | Alphanumeric + hyphens only: `/^[a-z0-9-]+$/` |
| Free text (names, descriptions) | Max length enforced; strip null bytes |

---

## 7. Audit Logging Requirements

### 7.1 Events That Must Be Logged

All audit events must be written to a `portal_audit_log` table that is append-only (no UPDATE or DELETE permitted via the application user's DB role).

**Authentication events:**

| Event | Data to log |
|---|---|
| `auth.login.success` | user_id, email, ip, user_agent, timestamp |
| `auth.login.failure` | email (attempted), ip, user_agent, reason, timestamp |
| `auth.logout` | user_id, ip, timestamp |
| `auth.mfa.success` | user_id, ip, timestamp |
| `auth.mfa.failure` | user_id, ip, fail_count, timestamp |
| `auth.token.refresh` | user_id, ip, timestamp |
| `auth.password.changed` | user_id, ip, timestamp (no old/new passwords) |
| `auth.password.reset_requested` | email, ip, timestamp |
| `auth.account.locked` | user_id, email, fail_count, locked_until, timestamp |

**License events:**

| Event | Data to log |
|---|---|
| `license.issued` | license_id, org_id, product, tier, issued_by (staff_id), timestamp |
| `license.activated` | license_id, org_id, activated_by (user_id), ip, product_version, timestamp |
| `license.revoked` | license_id, org_id, revoked_by (staff_id), reason, timestamp |
| `license.expiry_extended` | license_id, old_expiry, new_expiry, extended_by (staff_id), timestamp |
| `license.validated` | license_id, validation_result, calling_ip, timestamp |

**Organisation and user management events:**

| Event | Data to log |
|---|---|
| `org.created` | org_id, org_name, created_by (staff_id), timestamp |
| `org.user.invited` | org_id, invited_email, invited_by (user_id), role, timestamp |
| `org.user.removed` | org_id, removed_user_id, removed_by (user_id), timestamp |
| `org.user.role_changed` | org_id, target_user_id, old_role, new_role, changed_by, timestamp |

**Staff actions on client data:**

| Event | Data to log |
|---|---|
| `staff.org.viewed` | staff_id, org_id, timestamp |
| `staff.billing.viewed` | staff_id, org_id, timestamp |
| `staff.license.issued` | (same as license.issued) |
| `staff.license.revoked` | (same as license.revoked) |

### 7.2 Audit Log Schema

```sql
CREATE TABLE portal_audit_log (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  TEXT        NOT NULL,    -- e.g. "auth.login.success"
  actor_id    UUID,                    -- user_id or staff_id; null for unauthenticated events
  actor_type  TEXT,                    -- "user" | "staff" | "system"
  org_id      UUID,                    -- if event is org-scoped
  target_id   UUID,                    -- e.g. license_id, target_user_id
  target_type TEXT,                    -- "license" | "user" | "org"
  ip_address  INET,
  user_agent  TEXT,
  metadata    JSONB,                   -- event-specific data
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The application DB user must NOT have UPDATE or DELETE on this table
-- Grant only: INSERT, SELECT
REVOKE UPDATE, DELETE ON portal_audit_log FROM portal_app_user;
```

### 7.3 Log Integrity and Retention

- Audit logs must not be modifiable by the application. Use a separate DB role with INSERT-only permissions.
- Ship audit logs to a separate, immutable store (e.g., S3 with Object Lock, or a dedicated logging service) daily via a cron job.
- Retention: minimum 3 years for security investigation; 7 years for compliance.
- Sensitive values (passwords, TOTP codes, raw license keys) must never appear in audit log metadata.

---

## 8. Session Security

### 8.1 Cookie Configuration

The existing CMS cookies use `SameSite=lax`. The portal must use `SameSite=strict` for the access token cookie to prevent CSRF via cross-site navigation. The refresh token must also use `strict`.

**Portal cookie settings:**

```typescript
// Access token cookie
{
  name: 'portal_access_token',
  httpOnly: true,
  secure: true,            // always true — portal requires HTTPS
  sameSite: 'strict',      // upgrade from CMS's 'lax'
  path: '/api/portal',     // scoped to portal API only — not sent to /api/admin
  maxAge: 15 * 60,         // 15 minutes
}

// Refresh token cookie
{
  name: 'portal_refresh_token',
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/api/portal/auth/refresh',  // scoped to the single refresh endpoint
  maxAge: 30 * 24 * 60 * 60,         // 30 days
}
```

**Note on the existing CMS cookie:** The current `setAdminCookie()` in `src/lib/auth.ts` uses `secure: process.env.NODE_ENV === 'production'`. The portal must always set `secure: true` regardless of environment (use HTTP in dev by connecting to the staging portal, not localhost). If localhost testing is required, document that secure cookies can be tested via `chrome://flags/#unsafely-treat-insecure-origin-as-secure`.

**Logout must:**
1. Delete both `portal_access_token` and `portal_refresh_token` cookies (set `maxAge: 0`)
2. Delete the refresh token hash from `portal_refresh_tokens` in the DB
3. Return 200 regardless of whether the tokens were valid (idempotent logout)

### 8.2 CSRF Protection

`SameSite=strict` on the access token cookie provides strong CSRF protection for the portal. However, implement an additional CSRF token for sensitive operations (password change, MFA setup, user removal, license revocation) as defence in depth.

**Double-submit cookie pattern:**

```typescript
// On page load: issue a CSRF token as a non-HttpOnly cookie
// so JavaScript can read it and include in X-CSRF-Token header
{
  name: 'portal_csrf',
  httpOnly: false,         // readable by JS
  secure: true,
  sameSite: 'strict',
  path: '/portal',
  maxAge: 60 * 60,         // 1 hour
}

// On state-changing requests:
// Client sends: X-CSRF-Token: <value from cookie>
// Server checks: request.headers.get('X-CSRF-Token') === cookie value
// Cross-origin requests cannot read the cookie, so they cannot set the header
```

### 8.3 Token Rotation

- Access tokens: not rotated (they expire in 15 min)
- Refresh tokens: rotated on every use (delete old, insert new)
- If a refresh token is presented after it has already been rotated (possible replay attack), immediately revoke the entire refresh token family for that user and force re-login. Log as `auth.token.replay_detected`.

---

## 9. Secrets Management

### 9.1 New Environment Variables Required

The following environment variables must be added to production secrets management (Netlify environment variables, or equivalent):

| Variable | Purpose | Format | Generation |
|---|---|---|---|
| `PORTAL_ACCESS_SECRET` | Sign portal access JWTs | 64-char hex string | `openssl rand -hex 32` |
| `PORTAL_REFRESH_SECRET` | Sign portal refresh JWTs | 64-char hex string | `openssl rand -hex 32` |
| `LICENSE_TOKEN_PRIVATE_KEY` | Sign license tokens (RS256) | RSA 2048-bit PEM | `openssl genrsa 2048` |
| `LICENSE_TOKEN_PUBLIC_KEY` | Verify license tokens in products | RSA public PEM | Derived from private key |
| `LICENSE_KEY_HMAC_SECRET` | Compute license key checksums | 64-char hex string | `openssl rand -hex 32` |
| `PORTAL_ENCRYPTION_KEY` | AES-256-GCM for PII fields | 64-char hex string (32 bytes) | `openssl rand -hex 32` |
| `PORTAL_ALLOWED_ORIGINS` | CORS allowlist | Comma-separated URLs | Manual |

**Existing variables that must NOT be changed:**

| Variable | Current use | Note |
|---|---|---|
| `CMS_JWT_SECRET` | CMS admin sessions | Keep as-is; portal uses separate secrets |
| `CRON_SECRET` | Cron job authentication | Keep as-is |
| `DATABASE_URL` | Prisma connection | Shared — portal tables in same DB |
| `RESEND_API_KEY` | Email sending | Will be used for portal email too |

### 9.2 Secret Hygiene Rules

1. **Startup validation:** On application boot, check that `PORTAL_ACCESS_SECRET` and `PORTAL_REFRESH_SECRET` are set, are at least 64 characters long, and are not equal to any default placeholder. Throw a hard error if not:

```typescript
function assertSecretStrength(name: string, value: string | undefined) {
  if (!value) throw new Error(`${name} is not set`);
  if (value.length < 64) throw new Error(`${name} is too short (minimum 64 chars)`);
  if (['dev-secret', 'change-me', 'secret'].some(w => value.toLowerCase().includes(w))) {
    throw new Error(`${name} appears to be a placeholder value`);
  }
}
```

2. **Existing CMS secret weakness:** The current `src/lib/auth.ts` line 5 falls back to `'dev-secret-change-in-production'` if `CMS_JWT_SECRET` is not set. This fallback must be removed — throw instead. Add the same startup validation.

3. **Secret rotation procedure:** Document how to rotate each secret without downtime:
   - Access token rotations: change secret → all existing access tokens invalid → users re-authenticate at next request via refresh token
   - Refresh token rotations: requires a grace period (support old + new secret simultaneously for 30 days, then drop old)
   - License token private key rotation: issue new license tokens to all active clients; old tokens valid until their `exp`; products pick up new public key from the well-known endpoint

4. **Never log secrets:** Ensure application logging does not include environment variable values. Structured logging libraries (Pino, Winston) should have a redact configuration for known secret field names.

5. **`.env` files:** Never commit `.env` or `.env.local` to the repository. Ensure `.gitignore` includes:
   ```
   .env
   .env.local
   .env.production.local
   ```

---

## 10. Vulnerability Checklist — OWASP Top 10 Applied

### A01: Broken Access Control

**Risk in this codebase:** The current `requireAdmin()` middleware is a binary check (admin or not). The portal introduces five roles across two user types. Without explicit checks, role confusion can occur.

- [ ] Every portal API route calls a role-checking function that verifies the minimum required role from the JWT
- [ ] `org_id` from JWT is used for all DB queries — never from client input
- [ ] Staff endpoints verify that the requesting `staff_role` has permission for the specific action
- [ ] No "admin-only" routes rely solely on URL path obscurity
- [ ] URL path IDs (article IDs, license IDs) are validated as belonging to the requester's org before returning data

**Specific risk from current code:** The `DELETE /api/admin/articles/[id]` route fetches the article by ID without verifying it belongs to any particular admin (single admin, so currently OK). When multi-admin CMS roles are added, this pattern must be updated.

### A02: Cryptographic Failures

- [ ] All secrets are minimum 256 bits (32 bytes / 64 hex chars)
- [ ] JWT algorithm is explicitly set in `setProtectedHeader` (never let the library accept `alg: none`)
- [ ] License tokens use RS256 (asymmetric) — private key never distributed
- [ ] PII fields use AES-256-GCM (authenticated encryption — prevents tampering)
- [ ] Passwords hashed with bcrypt, work factor ≥ 12 (current code uses `bcryptjs` — verify the work factor in the seed script)
- [ ] TOTP secrets encrypted before storage
- [ ] Raw license keys never stored — only SHA-256 hashes
- [ ] HTTPS enforced for all portal endpoints (HSTS already in `next.config.mjs`)
- [ ] `CMS_JWT_SECRET` fallback to plaintext default removed

### A03: Injection

- [ ] All DB queries use Prisma ORM (parameterised by default)
- [ ] No raw SQL with template literals containing user input (`$queryRaw` is forbidden without parameterisation)
- [ ] HTML in contact form emails escaped (current `route.ts` uses `message.replace(/\n/g, '<br>')` — this allows HTML injection into the email; sanitise or escape before inserting into HTML template)
- [ ] `zod` validation on all request bodies before processing
- [ ] License key format validated by regex before database lookup

**Immediate fix needed:** `/api/contact/route.ts` line 26 inserts `message` directly into an HTML template without escaping HTML entities. A malicious user could send `<script>` tags that execute in the email client. Replace with a plain-text email or use a library like `he` to encode HTML entities.

### A04: Insecure Design

- [ ] Multi-tenant isolation design reviewed (org_id from JWT, never client-supplied)
- [ ] Refresh token rotation with replay detection
- [ ] License tokens asymmetrically signed so products cannot forge
- [ ] MFA required for staff accounts
- [ ] Account lockout after brute-force threshold
- [ ] Rate limiting per client identity (not just IP)
- [ ] Revocation mechanism for both session tokens and license tokens

### A05: Security Misconfiguration

- [ ] Default secret fallback (`'dev-secret-change-in-production'`) removed from `src/lib/auth.ts`
- [ ] Error responses in production return generic messages only (no stack traces)
- [ ] Prisma client logging set to `['error']` only in production (already done in `src/lib/prisma.ts`)
- [ ] `poweredByHeader: false` already set in `next.config.mjs` — retain this
- [ ] Content Security Policy header added (currently not set — only `X-XSS-Protection` and `X-Frame-Options`)
- [ ] CORS configured with explicit allowlist — no wildcard
- [ ] Cron endpoint protected by `CRON_SECRET` (already present); add IP allowlist as additional control

**Missing CSP header:** The current `next.config.mjs` does not set a `Content-Security-Policy` header. Add a strict CSP. Minimum viable policy:

```javascript
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'nonce-{NONCE}'",  // use Next.js nonce for inline scripts
    "style-src 'self' 'unsafe-inline'",   // relax if using CSS-in-JS
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",             // replaces X-Frame-Options
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
}
```

### A06: Vulnerable and Outdated Components

- [ ] Run `npm audit` before each production deployment; block deployments with critical vulnerabilities
- [ ] Pin major versions in `package.json`; review minor updates monthly
- [ ] `next` at `^14.2.29` — monitor for security advisories (Next.js has had auth-related CVEs)
- [ ] `jose` at `^5.9.6` — actively maintained; monitor advisories
- [ ] `bcryptjs` at `^2.4.3` — note: `bcryptjs` is a JS port; consider `@node-rs/bcrypt` for native performance (though not a security issue)
- [ ] Dependabot or Renovate configured for automated dependency updates

### A07: Identification and Authentication Failures

- [ ] Password minimum 12 characters enforced at API level (not just UI)
- [ ] Password maximum 128 characters enforced before bcrypt (bcrypt silently truncates at 72 bytes)
- [ ] Passwords checked against common password lists (e.g., `zxcvbn` score ≥ 3)
- [ ] Account lockout after 10 failed attempts
- [ ] MFA required for staff; optional (but strongly recommended) for clients
- [ ] Refresh token rotation with replay detection
- [ ] "Forgot password" uses time-limited, single-use, signed tokens (not predictable tokens)
- [ ] Session invalidated on password change
- [ ] Login response does not differentiate between "email not found" and "wrong password" (both return "Invalid credentials")

### A08: Software and Data Integrity Failures

- [ ] CI/CD pipeline (GitHub Actions or Netlify) verifies code comes from the repository — no arbitrary code execution
- [ ] `npm ci` used in CI (not `npm install`) to ensure lockfile integrity
- [ ] `package-lock.json` committed and verified in CI
- [ ] Netlify background function for AI generation (`generate-background`) authenticated via a shared secret or signed payload — not open to the internet
- [ ] License tokens include `jti` so individual tokens can be invalidated

### A09: Security Logging and Monitoring Failures

- [ ] All events in Section 7.1 are logged to `portal_audit_log`
- [ ] Failed authentication attempts generate alerts after threshold (5 failures from same IP in 10 min → alert)
- [ ] License key usage anomalies detected (e.g., same license key activating from 10 different IPs)
- [ ] Audit log table is INSERT-only for the application DB role
- [ ] Logs shipped to external store (S3 or logging service) daily
- [ ] Alert on: account lockout, license revocation, staff access to billing data

### A10: Server-Side Request Forgery (SSRF)

**Relevant risk:** The existing `src/app/api/admin/generate/route.ts` makes an outbound HTTP call to a Netlify background function URL derived from `process.env.URL`. If `URL` were ever user-influenced, this could become SSRF.

- [ ] `process.env.URL` (used in generate route) is set only via infrastructure config, not by users
- [ ] Any URL constructed from user input must be validated against an explicit allowlist
- [ ] The LinkedIn API calls in `src/lib/linkedin.ts` call a fixed external endpoint — not a risk, but validate responses
- [ ] If the portal ever makes server-side HTTP calls based on client-provided webhook URLs, implement strict allowlist validation (HTTPS only, block private IP ranges: `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`, `127.x.x.x`)

---

## 11. Implementation Priority

The Lead Dev should address items in this order:

**Phase 1 — Immediate fixes (before portal development begins):**
1. Remove `'dev-secret-change-in-production'` fallback from `src/lib/auth.ts`
2. Fix HTML injection in `/api/contact/route.ts` (escape message content)
3. Add `Content-Security-Policy` header to `next.config.mjs`
4. Add startup secret strength validation

**Phase 2 — Portal foundation:**
1. Database schema for portal tables (organisations, users, staff, refresh tokens, audit log, licenses)
2. `src/lib/portal-auth.ts` — separate from `src/lib/auth.ts`; implement access + refresh token issuance and verification using `PORTAL_ACCESS_SECRET` and `PORTAL_REFRESH_SECRET`
3. `src/lib/portal-api-auth.ts` — `requirePortalSession(req, minRole)` and `requireStaffSession(req, minStaffRole)`
4. Rate limiting middleware (Upstash or PostgreSQL-backed)
5. `src/middleware.ts` — route gating for `/portal/*` and `/api/portal/*`
6. Zod validation schemas for all new request types

**Phase 3 — Portal features:**
1. Auth routes (login, refresh, logout, MFA, forgot password)
2. Organisation and user management routes
3. License issuance, activation, and revocation
4. Audit logging on all write operations
5. License token generation and signing
6. `/api/portal/license/validate` endpoint for downstream products

**Phase 4 — Hardening:**
1. TOTP MFA implementation
2. Encryption utilities for PII fields
3. GDPR data export and deletion endpoints
4. PostgreSQL Row Level Security policies
5. Refresh token replay detection
6. Rate limit alerting

---

## Appendix A — New Env Vars Quick Reference

```bash
# Portal JWT secrets
PORTAL_ACCESS_SECRET=       # 64-char hex: openssl rand -hex 32
PORTAL_REFRESH_SECRET=      # 64-char hex: openssl rand -hex 32

# License token signing (RSA)
LICENSE_TOKEN_PRIVATE_KEY=  # RSA 2048-bit PEM: openssl genrsa 2048
LICENSE_TOKEN_PUBLIC_KEY=   # RSA public PEM: openssl rsa -pubout

# License key checksum
LICENSE_KEY_HMAC_SECRET=    # 64-char hex: openssl rand -hex 32

# PII encryption
PORTAL_ENCRYPTION_KEY=      # 64-char hex: openssl rand -hex 32

# CORS
PORTAL_ALLOWED_ORIGINS=https://portal.integri.us,https://integri.us
```

## Appendix B — Files Modified or Created by This Spec

| File | Action | Reason |
|---|---|---|
| `src/lib/auth.ts` | Modify | Remove default secret fallback; add startup validation |
| `src/lib/portal-auth.ts` | Create | Portal JWT issuance and verification |
| `src/lib/portal-api-auth.ts` | Create | `requirePortalSession`, `requireStaffSession` |
| `src/lib/encrypt.ts` | Create | AES-256-GCM encrypt/decrypt for PII fields |
| `src/lib/license.ts` | Create | License key generation and License Token signing |
| `src/middleware.ts` | Create | Next.js route gating for portal paths |
| `src/app/api/portal/**` | Create | All portal API routes |
| `next.config.mjs` | Modify | Add CSP header |
| `src/app/api/contact/route.ts` | Modify | Escape HTML in email body |
| `prisma/schema.prisma` | Modify | Add portal_* tables |
| `prisma/migrations/` | Create | Migration for portal schema |
