# Integrius Client Portal — API Reference

> **Status:** Planned / Pre-implementation
> **Base URL (production):** `https://portal.integrius.io`
> **Base URL (local dev):** `http://localhost:3002`
> All endpoints return `application/json`.

---

## Table of Contents

1. [Authentication Overview](#authentication-overview)
2. [Admin Portal Endpoints](#admin-portal-endpoints)
   - [Organizations](#organizations)
   - [Licenses](#licenses)
   - [Dashboard](#dashboard)
3. [Client Portal Endpoints](#client-portal-endpoints)
   - [Auth](#client-auth)
   - [Profile](#client-profile)
   - [Licenses](#client-licenses)
   - [Invoices](#client-invoices)
   - [Team](#client-team)
4. [Offline License Validation](#offline-license-validation)
5. [Error Reference](#error-reference)

---

## Authentication Overview

The portal uses two separate JWT sessions, both stored as `HttpOnly` cookies. Neither token is transmitted in headers by client-side JavaScript — the browser attaches the cookie automatically on same-origin requests.

### Admin JWT (`portal_admin_token`)

| Property | Value |
|----------|-------|
| Cookie name | `portal_admin_token` |
| Algorithm | HS256 |
| TTL | 12 hours |
| Secret env var | `PORTAL_ADMIN_JWT_SECRET` |
| Payload fields | `adminId: string`, `email: string` |

Issued by `POST /api/portal/admin/login`. Required for every `/api/portal/admin/*` route.

### Client JWT (`portal_client_token`)

| Property | Value |
|----------|-------|
| Cookie name | `portal_client_token` |
| Algorithm | HS256 |
| TTL | 7 days |
| Secret env var | `PORTAL_CLIENT_JWT_SECRET` |
| Payload fields | `clientUserId: string`, `organizationId: string`, `email: string`, `role: "owner" \| "admin" \| "member"` |

Issued by `POST /api/portal/client/login`. Required for every `/api/portal/client/*` route.

### License JWTs (downstream product validation)

A third JWT type is embedded in license keys distributed to clients. See [Offline License Validation](#offline-license-validation).

---

## Admin Portal Endpoints

All admin endpoints require the `portal_admin_token` cookie. A missing or expired token returns `401`. Requests that would violate business rules (e.g. modifying a revoked license) return `409`.

---

### Organizations

#### `GET /api/portal/admin/organizations`

Returns all organizations, ordered by creation date descending.

**Authentication:** Admin JWT

**Query parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Filters by organization name or domain (case-insensitive, partial match) |
| `status` | `active \| suspended \| churned` | No | Filters by organization status |

**Response — 200 OK**

```json
{
  "organizations": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Acme Corp",
      "domain": "acme.com",
      "status": "active",
      "plan_note": "Enterprise deal — direct sales",
      "created_at": "2025-11-01T10:00:00Z",
      "license_count": 3,
      "mrr_gbp": 4500
    }
  ]
}
```

**Example curl**

```bash
curl -s \
  --cookie "portal_admin_token=<token>" \
  "https://portal.integrius.io/api/portal/admin/organizations?status=active"
```

---

#### `POST /api/portal/admin/organizations`

Creates a new client organization.

**Authentication:** Admin JWT

**Request body**

```json
{
  "name": "Acme Corp",
  "domain": "acme.com",
  "plan_note": "Enterprise deal — direct sales",
  "billing_email": "finance@acme.com",
  "billing_name": "Acme Corp Ltd"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | Yes | Display name of the organization |
| `domain` | string | Yes | Primary email domain; used to scope invitations |
| `plan_note` | string | No | Internal note (not shown to clients) |
| `billing_email` | string | No | Defaults to first owner's email if omitted |
| `billing_name` | string | No | Legal entity name for invoicing |

**Response — 201 Created**

```json
{
  "organization": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Acme Corp",
    "domain": "acme.com",
    "status": "active",
    "plan_note": "Enterprise deal — direct sales",
    "billing_email": "finance@acme.com",
    "billing_name": "Acme Corp Ltd",
    "created_at": "2026-03-24T12:00:00Z"
  }
}
```

**Status codes**

| Code | Meaning |
|------|---------|
| 201 | Organization created |
| 400 | Missing required field (`name` or `domain`) |
| 409 | An organization with that domain already exists |

**Example curl**

```bash
curl -s -X POST \
  --cookie "portal_admin_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme Corp","domain":"acme.com","billing_email":"finance@acme.com"}' \
  "https://portal.integrius.io/api/portal/admin/organizations"
```

---

#### `GET /api/portal/admin/organizations/[id]`

Returns full details for a single organization, including its licenses and client users.

**Authentication:** Admin JWT

**Path parameters:** `id` — UUID of the organization

**Response — 200 OK**

```json
{
  "organization": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Acme Corp",
    "domain": "acme.com",
    "status": "active",
    "plan_note": "Enterprise deal — direct sales",
    "billing_email": "finance@acme.com",
    "billing_name": "Acme Corp Ltd",
    "created_at": "2025-11-01T10:00:00Z",
    "users": [
      {
        "id": "u-uuid",
        "email": "alice@acme.com",
        "role": "owner",
        "created_at": "2025-11-01T10:05:00Z",
        "last_login_at": "2026-03-20T09:00:00Z"
      }
    ],
    "licenses": [
      {
        "id": "lic-uuid",
        "product": "core",
        "tier": "enterprise",
        "status": "active",
        "starts_at": "2025-11-01T00:00:00Z",
        "expires_at": "2026-11-01T00:00:00Z"
      }
    ]
  }
}
```

**Status codes**

| Code | Meaning |
|------|---------|
| 200 | Success |
| 404 | No organization with that ID |

---

#### `PUT /api/portal/admin/organizations/[id]`

Updates organization metadata. Only the fields present in the request body are modified.

**Authentication:** Admin JWT

**Request body** (all fields optional)

```json
{
  "name": "Acme Corporation",
  "domain": "acme.com",
  "status": "suspended",
  "plan_note": "Payment overdue — suspended 2026-03-01",
  "billing_email": "newfinance@acme.com",
  "billing_name": "Acme Corporation Ltd"
}
```

**Response — 200 OK**

```json
{
  "organization": { "...": "updated fields" }
}
```

**Status codes**

| Code | Meaning |
|------|---------|
| 200 | Updated |
| 400 | Invalid `status` value |
| 404 | Organization not found |
| 409 | New `domain` already taken by another organization |

---

#### `DELETE /api/portal/admin/organizations/[id]`

Soft-deletes an organization. Sets `status` to `churned` and revokes all active licenses. Client users can no longer log in. Data is retained for audit purposes.

**Authentication:** Admin JWT

**Response — 200 OK**

```json
{
  "ok": true,
  "revoked_licenses": 2
}
```

**Status codes**

| Code | Meaning |
|------|---------|
| 200 | Organization churned, licenses revoked |
| 404 | Not found |
| 409 | Organization is already churned |

**Example curl**

```bash
curl -s -X DELETE \
  --cookie "portal_admin_token=<token>" \
  "https://portal.integrius.io/api/portal/admin/organizations/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

---

### Licenses

#### `GET /api/portal/admin/organizations/[id]/licenses`

Returns all licenses for an organization.

**Authentication:** Admin JWT

**Response — 200 OK**

```json
{
  "licenses": [
    {
      "id": "lic-uuid",
      "organization_id": "org-uuid",
      "product": "core",
      "tier": "enterprise",
      "status": "active",
      "seat_limit": null,
      "data_source_limit": 100,
      "starts_at": "2025-11-01T00:00:00Z",
      "expires_at": "2026-11-01T00:00:00Z",
      "price_gbp_monthly": 1500,
      "notes": "Annual deal, billed quarterly",
      "license_jwt": "eyJhbGciOiJSUzI1NiJ9...",
      "created_at": "2025-11-01T09:00:00Z",
      "revoked_at": null
    }
  ]
}
```

The `license_jwt` field is the signed token the client installs into their Integrius Core/Optic deployment.

---

#### `POST /api/portal/admin/organizations/[id]/licenses`

Issues a new license for an organization.

**Authentication:** Admin JWT

**Request body**

```json
{
  "product": "core",
  "tier": "enterprise",
  "starts_at": "2026-04-01T00:00:00Z",
  "expires_at": "2027-04-01T00:00:00Z",
  "price_gbp_monthly": 1500,
  "data_source_limit": 100,
  "seat_limit": null,
  "notes": "Annual renewal — Q2 2026"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `product` | `core \| optic \| search \| sdk` | Yes | Which Integrius product this license covers |
| `tier` | `starter \| growth \| enterprise \| platform` | Yes | License tier |
| `starts_at` | ISO 8601 | Yes | License validity start |
| `expires_at` | ISO 8601 | Yes | License validity end |
| `price_gbp_monthly` | number | Yes | MRR in GBP for revenue tracking |
| `data_source_limit` | integer \| null | No | Max connected data sources; `null` means unlimited |
| `seat_limit` | integer \| null | No | Max team member seats; `null` means unlimited |
| `notes` | string | No | Internal note |

**Tier defaults**

| Tier | Data sources | Seats |
|------|-------------|-------|
| Starter | 5 | 3 |
| Growth | 25 | 15 |
| Enterprise | 100 | 50 |
| Platform | Unlimited | Unlimited |

The API enforces these defaults if `data_source_limit` / `seat_limit` are omitted. They can be overridden for custom deals.

**Response — 201 Created**

```json
{
  "license": {
    "id": "lic-uuid",
    "product": "core",
    "tier": "enterprise",
    "status": "active",
    "license_jwt": "eyJhbGciOiJSUzI1NiJ9...",
    "starts_at": "2026-04-01T00:00:00Z",
    "expires_at": "2027-04-01T00:00:00Z"
  }
}
```

**Status codes**

| Code | Meaning |
|------|---------|
| 201 | License created and JWT signed |
| 400 | Missing or invalid field |
| 404 | Organization not found |
| 409 | An active license for that product already exists; revoke it first |

**Example curl**

```bash
curl -s -X POST \
  --cookie "portal_admin_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "product": "core",
    "tier": "enterprise",
    "starts_at": "2026-04-01T00:00:00Z",
    "expires_at": "2027-04-01T00:00:00Z",
    "price_gbp_monthly": 1500,
    "data_source_limit": 100
  }' \
  "https://portal.integrius.io/api/portal/admin/organizations/org-uuid/licenses"
```

---

#### `PUT /api/portal/admin/organizations/[id]/licenses/[licenseId]`

Updates a license record. Re-signs the license JWT if `tier`, `expires_at`, `data_source_limit`, or `seat_limit` change.

**Authentication:** Admin JWT

**Request body** (all fields optional)

```json
{
  "tier": "platform",
  "expires_at": "2028-04-01T00:00:00Z",
  "data_source_limit": null,
  "seat_limit": null,
  "price_gbp_monthly": 3500,
  "notes": "Upgraded to Platform tier March 2026"
}
```

**Response — 200 OK**

```json
{
  "license": {
    "id": "lic-uuid",
    "tier": "platform",
    "expires_at": "2028-04-01T00:00:00Z",
    "license_jwt": "eyJhbGciOiJSUzI1NiJ9...<new token>",
    "updated_at": "2026-03-24T12:00:00Z"
  }
}
```

**Important:** When a license JWT is re-signed, the client must retrieve and redeploy the new JWT. The old JWT remains cryptographically valid until it was set to expire, so there is a window where both tokens validate. If you need to invalidate the old token immediately, use the revoke endpoint.

**Status codes**

| Code | Meaning |
|------|---------|
| 200 | Updated |
| 400 | Invalid field value |
| 404 | License or organization not found |
| 409 | Cannot update a revoked license |

---

#### `POST /api/portal/admin/organizations/[id]/licenses/[licenseId]/revoke`

Revokes a license. The client's deployed license JWT will fail validation the next time the downstream product checks it. This action cannot be undone — issue a new license if needed.

**Authentication:** Admin JWT

**Request body**

```json
{
  "reason": "Non-payment — invoice 2026-001 overdue 60 days"
}
```

| Field | Type | Required |
|-------|------|----------|
| `reason` | string | Yes | Audit trail reason stored in `revoked_reason` |

**Response — 200 OK**

```json
{
  "ok": true,
  "license_id": "lic-uuid",
  "revoked_at": "2026-03-24T12:00:00Z"
}
```

**Status codes**

| Code | Meaning |
|------|---------|
| 200 | Revoked |
| 400 | Missing reason |
| 404 | License or organization not found |
| 409 | License is already revoked |

**Example curl**

```bash
curl -s -X POST \
  --cookie "portal_admin_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Non-payment — invoice overdue"}' \
  "https://portal.integrius.io/api/portal/admin/organizations/org-uuid/licenses/lic-uuid/revoke"
```

---

### Dashboard

#### `GET /api/portal/admin/dashboard/metrics`

Returns aggregate revenue and licensing metrics for the admin dashboard.

**Authentication:** Admin JWT

**Response — 200 OK**

```json
{
  "metrics": {
    "mrr_gbp": 48500,
    "arr_gbp": 582000,
    "active_organizations": 34,
    "active_licenses": 41,
    "licenses_expiring_30d": 3,
    "licenses_expiring_60d": 7,
    "by_product": {
      "core":   { "active": 34, "mrr_gbp": 36000 },
      "optic":  { "active": 12, "mrr_gbp": 8500 },
      "search": { "active": 6,  "mrr_gbp": 3000 },
      "sdk":    { "active": 2,  "mrr_gbp": 1000 }
    },
    "by_tier": {
      "starter":    { "count": 8,  "mrr_gbp": 2400 },
      "growth":     { "count": 14, "mrr_gbp": 11200 },
      "enterprise": { "count": 16, "mrr_gbp": 28800 },
      "platform":   { "count": 3,  "mrr_gbp": 6100 }
    },
    "new_mrr_mtd_gbp": 4500,
    "churn_mrr_mtd_gbp": 0,
    "generated_at": "2026-03-24T12:00:00Z"
  }
}
```

**Example curl**

```bash
curl -s \
  --cookie "portal_admin_token=<token>" \
  "https://portal.integrius.io/api/portal/admin/dashboard/metrics"
```

---

## Client Portal Endpoints

All client endpoints require the `portal_client_token` cookie unless noted. A missing or expired token returns `401`.

---

### Client Auth

#### `POST /api/portal/client/login`

Authenticates a client user and issues the session cookie.

**Authentication:** None

**Request body**

```json
{
  "email": "alice@acme.com",
  "password": "correct-horse-battery-staple"
}
```

**Response — 200 OK**

Sets `portal_client_token` cookie (`HttpOnly`, `Secure` in production, `SameSite=Lax`, 7-day `Max-Age`).

```json
{
  "ok": true,
  "user": {
    "id": "u-uuid",
    "email": "alice@acme.com",
    "role": "owner",
    "organization_id": "org-uuid",
    "organization_name": "Acme Corp"
  }
}
```

**Status codes**

| Code | Meaning |
|------|---------|
| 200 | Authenticated; cookie set |
| 400 | Missing email or password |
| 401 | Invalid credentials (message is intentionally vague) |
| 403 | Organization is suspended or churned |

**Example curl**

```bash
curl -s -X POST \
  -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@acme.com","password":"..."}' \
  "https://portal.integrius.io/api/portal/client/login"
```

---

#### `POST /api/portal/client/logout`

Clears the client session cookie.

**Authentication:** None (always succeeds)

**Response — 200 OK**

```json
{ "ok": true }
```

---

### Client Profile

#### `GET /api/portal/client/me`

Returns the authenticated client user's profile and organization summary.

**Authentication:** Client JWT

**Response — 200 OK**

```json
{
  "user": {
    "id": "u-uuid",
    "email": "alice@acme.com",
    "role": "owner",
    "created_at": "2025-11-01T10:05:00Z",
    "last_login_at": "2026-03-20T09:00:00Z"
  },
  "organization": {
    "id": "org-uuid",
    "name": "Acme Corp",
    "domain": "acme.com",
    "status": "active",
    "billing_email": "finance@acme.com"
  }
}
```

**Example curl**

```bash
curl -s \
  -b cookies.txt \
  "https://portal.integrius.io/api/portal/client/me"
```

---

### Client Licenses

#### `GET /api/portal/client/licenses`

Returns all licenses for the authenticated user's organization. Includes the license JWT needed to activate installed Integrius products.

**Authentication:** Client JWT

**Response — 200 OK**

```json
{
  "licenses": [
    {
      "id": "lic-uuid",
      "product": "core",
      "product_label": "Integrius Core",
      "tier": "enterprise",
      "tier_label": "Enterprise",
      "status": "active",
      "data_source_limit": 100,
      "seat_limit": 50,
      "starts_at": "2025-11-01T00:00:00Z",
      "expires_at": "2026-11-01T00:00:00Z",
      "days_remaining": 222,
      "license_key": "eyJhbGciOiJSUzI1NiJ9..."
    }
  ]
}
```

`license_key` is the signed JWT the client copies into their Integrius deployment. It is identical to the `license_jwt` field visible to admins.

**Status codes**

| Code | Meaning |
|------|---------|
| 200 | Success (returns empty array if no licenses) |
| 401 | Not authenticated |

---

### Client Invoices

#### `GET /api/portal/client/invoices`

Returns the invoice history for the authenticated user's organization.

**Authentication:** Client JWT

**Query parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | integer | No | Default 25, max 100 |
| `offset` | integer | No | Pagination offset, default 0 |

**Response — 200 OK**

```json
{
  "invoices": [
    {
      "id": "inv-uuid",
      "number": "INV-2026-001",
      "status": "paid",
      "amount_gbp": 4500,
      "period_start": "2026-01-01T00:00:00Z",
      "period_end": "2026-03-31T23:59:59Z",
      "issued_at": "2026-01-01T09:00:00Z",
      "due_at": "2026-01-31T00:00:00Z",
      "paid_at": "2026-01-15T14:22:00Z",
      "pdf_url": "https://portal.integrius.io/invoices/inv-uuid.pdf"
    }
  ],
  "total": 6,
  "limit": 25,
  "offset": 0
}
```

**Status codes**

| Code | Meaning |
|------|---------|
| 200 | Success |
| 401 | Not authenticated |

---

### Client Team

#### `GET /api/portal/client/team`

Returns all users within the authenticated user's organization.

**Authentication:** Client JWT

**Response — 200 OK**

```json
{
  "team": [
    {
      "id": "u-uuid",
      "email": "alice@acme.com",
      "role": "owner",
      "created_at": "2025-11-01T10:05:00Z",
      "last_login_at": "2026-03-20T09:00:00Z"
    },
    {
      "id": "u-uuid-2",
      "email": "bob@acme.com",
      "role": "member",
      "created_at": "2026-01-15T11:00:00Z",
      "last_login_at": "2026-03-22T08:45:00Z"
    }
  ]
}
```

---

#### `POST /api/portal/client/team`

Invites a new team member to the organization. An invitation email is sent; the invitee must set a password via the link in the email before they can log in.

**Authentication:** Client JWT — `owner` or `admin` role required. `member` role returns `403`.

**Request body**

```json
{
  "email": "carol@acme.com",
  "role": "member"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | Yes | Must match the organization's domain unless the inviting user is `owner` |
| `role` | `admin \| member` | Yes | `owner` cannot be assigned via this endpoint |

**Response — 201 Created**

```json
{
  "ok": true,
  "invited_email": "carol@acme.com",
  "role": "member",
  "invitation_expires_at": "2026-03-31T12:00:00Z"
}
```

**Status codes**

| Code | Meaning |
|------|---------|
| 201 | Invitation sent |
| 400 | Missing `email` or `role`; invalid role value |
| 403 | Authenticated user does not have `owner` or `admin` role |
| 409 | A user with that email already exists in this organization |

**Example curl**

```bash
curl -s -X POST \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@acme.com","role":"member"}' \
  "https://portal.integrius.io/api/portal/client/team"
```

---

## Offline License Validation

Integrius Core, Optic, Search, and SDK validate license keys **locally without calling back to the portal**. This supports air-gapped and self-hosted deployments. The mechanism is asymmetric JWT signing:

- The portal holds an **RSA private key** (`PORTAL_LICENSE_SIGNING_KEY`) and signs license JWTs with RS256.
- Each Integrius product ships with the corresponding **RSA public key** baked in (or configurable via `INTEGRIUS_LICENSE_PUBLIC_KEY`).
- At startup and periodically thereafter, the product verifies the license JWT's signature against the public key.

### License JWT payload

```json
{
  "iss": "https://portal.integrius.io",
  "sub": "org-uuid",
  "jti": "lic-uuid",
  "iat": 1743465600,
  "exp": 1775001600,
  "product": "core",
  "tier": "enterprise",
  "organization": "Acme Corp",
  "data_source_limit": 100,
  "seat_limit": 50,
  "revoked": false
}
```

| Claim | Purpose |
|-------|---------|
| `iss` | Issuer — must equal `https://portal.integrius.io` |
| `sub` | Organization UUID |
| `jti` | License UUID (use to cross-reference portal records) |
| `exp` | Unix timestamp; product refuses to start after this date |
| `product` | Must match the product being activated |
| `tier` | Used to enforce feature gates within the product |
| `data_source_limit` | `null` means unlimited |
| `seat_limit` | `null` means unlimited |
| `revoked` | Always `false` in a valid JWT; a revoked license is not re-signed with `revoked: true` — instead the token is withheld from the portal |

### Validation pseudocode (reference)

```typescript
import { jwtVerify, importSPKI } from 'jose';

const PUBLIC_KEY_PEM = process.env.INTEGRIUS_LICENSE_PUBLIC_KEY;

export async function validateLicenseJwt(token: string, expectedProduct: string) {
  const key = await importSPKI(PUBLIC_KEY_PEM, 'RS256');

  const { payload } = await jwtVerify(token, key, {
    issuer: 'https://portal.integrius.io',
  });

  if (payload.product !== expectedProduct) {
    throw new Error(`License is for product "${payload.product}", not "${expectedProduct}"`);
  }

  if (payload.exp && Date.now() / 1000 > payload.exp) {
    throw new Error('License has expired');
  }

  return payload;
}
```

### What happens on revocation

Because validation is offline, revocation does not take effect immediately. The flow is:

1. Admin calls `POST /api/portal/admin/organizations/[id]/licenses/[licenseId]/revoke`.
2. The portal removes the license JWT from the client-facing API (`GET /api/portal/client/licenses` no longer returns it).
3. The downstream product continues to operate until its **next startup** or its **periodic re-validation interval** (product-configurable; default 24 hours).
4. On the next check, the product cannot locate a valid license file/env var and enters a read-only or locked state per its shutdown policy.

For immediate revocation in an air-gapped deployment, Integrius staff must coordinate with the client's IT team to remove the license file from the deployment environment directly.

---

## Error Reference

All error responses share a consistent envelope:

```json
{
  "error": "Human-readable message"
}
```

| HTTP Status | Meaning |
|-------------|---------|
| 400 | Bad request — missing or invalid field. The `error` message names the field. |
| 401 | Unauthenticated — no valid session cookie present |
| 403 | Forbidden — authenticated but insufficient role |
| 404 | Resource not found |
| 409 | Conflict — e.g. domain already exists, license already revoked |
| 500 | Internal server error — check server logs |
