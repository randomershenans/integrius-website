# Integrius Client Portal — Setup & Deployment Guide

> This guide is for Integrius staff setting up and operating the client portal. It covers environment configuration, database migration, first-run seeding, local development, production deployment, and the day-to-day workflow for issuing licenses.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Environment Variables](#environment-variables)
3. [Database Setup & Migration](#database-setup--migration)
4. [First-Run Setup (Seed Initial Admin)](#first-run-setup-seed-initial-admin)
5. [Running the Portal Locally](#running-the-portal-locally)
6. [Production Deployment Checklist](#production-deployment-checklist)
7. [Issuing a License for a New Client](#issuing-a-license-for-a-new-client)
8. [Routine Operations](#routine-operations)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The client portal is a Next.js 14 application that shares the same codebase as the Integrius marketing website. It lives under separate URL paths:

| Path prefix | Audience |
|-------------|----------|
| `/portal/admin/*` | Integrius staff |
| `/portal/client/*` | Client users |
| `/api/portal/admin/*` | Admin API routes |
| `/api/portal/client/*` | Client API routes |

The portal adds the following to the existing schema:

- `portal_organizations` — client organizations
- `portal_users` — client-facing user accounts
- `portal_licenses` — issued license records
- `portal_invitations` — pending team invitations
- `portal_invoices` — billing records

All table names are prefixed with `portal_` to avoid collision with the existing `cms_` tables.

**Auth pattern:** Two separate `HttpOnly` cookie-based JWT sessions mirror the existing CMS admin pattern in `src/lib/auth.ts` and `src/lib/api-auth.ts`. New helpers `src/lib/portal-auth.ts` and `src/lib/portal-api-auth.ts` follow the same structure.

**License signing:** License JWTs use RS256 (asymmetric). The portal holds the private key; downstream Integrius products hold the public key. This enables offline validation without any network callback.

---

## Environment Variables

Add the following variables to your `.env` file (local development) and to your hosting provider's environment (production).

### Required — Portal Auth

```bash
# Secret for signing admin portal session JWTs (HS256)
# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
PORTAL_ADMIN_JWT_SECRET=<64-byte hex string>

# Secret for signing client portal session JWTs (HS256)
# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
PORTAL_CLIENT_JWT_SECRET=<64-byte hex string>
```

### Required — License Signing (RSA)

```bash
# RSA private key for signing license JWTs (RS256) — keep this secret
# The public half is distributed to downstream Integrius products
# See "Generating the License Signing Keypair" below
PORTAL_LICENSE_SIGNING_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA...
-----END RSA PRIVATE KEY-----"

# RSA public key — safe to embed in downstream products
# Set here for reference; distribute via the product release process
PORTAL_LICENSE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhk...
-----END PUBLIC KEY-----"
```

### Required — First Admin User

```bash
# Used by the seed script to create the initial portal admin account
PORTAL_ADMIN_EMAIL=ross@integrius.io
PORTAL_ADMIN_PASSWORD=<strong-random-password>
```

### Required — Email (Invitations)

```bash
# Resend API key — used to send client invitation emails
# Get from: https://resend.com/api-keys
RESEND_API_KEY=re_...

# From address for invitation emails
PORTAL_EMAIL_FROM=portal@integrius.io
```

### Already Present (Shared)

```bash
# PostgreSQL connection string — already used by the CMS
DATABASE_URL=postgresql://user:password@host:5432/integrius_cms
```

The portal migrations extend the same database. No second database is needed.

---

### Generating the License Signing Keypair

Run this once. Store the private key securely (e.g. as a secret in your hosting provider). Distribute the public key via the product release process.

```bash
# Generate 2048-bit RSA keypair
openssl genrsa -out license_private.pem 2048
openssl rsa -in license_private.pem -pubout -out license_public.pem

# Print for copying into environment variables
echo "Private key:"
cat license_private.pem

echo "Public key:"
cat license_public.pem

# Delete local copies after storing securely
rm license_private.pem license_public.pem
```

When formatting a PEM key in a `.env` file, wrap the entire value in double quotes and preserve the literal newlines:

```bash
PORTAL_LICENSE_SIGNING_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA...
-----END RSA PRIVATE KEY-----"
```

---

## Database Setup & Migration

### Local development (first time)

```bash
# 1. Install dependencies (if you haven't already)
npm install

# 2. Apply all pending Prisma migrations
npm run db:migrate

# 3. Verify the new portal tables exist
npm run db:studio
# Open http://localhost:5556 — you should see portal_* tables
```

### Adding the portal schema (migration file)

The portal requires a new Prisma migration. Create `prisma/migrations/<timestamp>_add_portal_tables/migration.sql` with the following content, then run `npm run db:migrate`:

```sql
-- portal_organizations
CREATE TABLE portal_organizations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  domain           TEXT NOT NULL UNIQUE,
  status           TEXT NOT NULL DEFAULT 'active', -- active | suspended | churned
  plan_note        TEXT,
  billing_email    TEXT,
  billing_name     TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON portal_organizations (status);
CREATE INDEX ON portal_organizations (domain);

-- portal_users (client-facing accounts)
CREATE TABLE portal_users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES portal_organizations(id) ON DELETE CASCADE,
  email            TEXT NOT NULL UNIQUE,
  password_hash    TEXT NOT NULL,
  role             TEXT NOT NULL DEFAULT 'member', -- owner | admin | member
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at    TIMESTAMPTZ
);
CREATE INDEX ON portal_users (organization_id);
CREATE INDEX ON portal_users (email);

-- portal_licenses
CREATE TABLE portal_licenses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES portal_organizations(id) ON DELETE CASCADE,
  product             TEXT NOT NULL, -- core | optic | search | sdk
  tier                TEXT NOT NULL, -- starter | growth | enterprise | platform
  status              TEXT NOT NULL DEFAULT 'active', -- active | revoked | expired
  data_source_limit   INTEGER,       -- NULL = unlimited
  seat_limit          INTEGER,       -- NULL = unlimited
  starts_at           TIMESTAMPTZ NOT NULL,
  expires_at          TIMESTAMPTZ NOT NULL,
  price_gbp_monthly   NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes               TEXT,
  license_jwt         TEXT NOT NULL, -- signed RS256 JWT
  revoked_at          TIMESTAMPTZ,
  revoked_reason      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON portal_licenses (organization_id);
CREATE INDEX ON portal_licenses (product, status);
CREATE INDEX ON portal_licenses (expires_at);

-- portal_invitations
CREATE TABLE portal_invitations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES portal_organizations(id) ON DELETE CASCADE,
  email            TEXT NOT NULL,
  role             TEXT NOT NULL DEFAULT 'member',
  token            TEXT NOT NULL UNIQUE, -- random URL-safe token in invitation link
  expires_at       TIMESTAMPTZ NOT NULL,
  accepted_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON portal_invitations (token);
CREATE INDEX ON portal_invitations (organization_id);

-- portal_invoices
CREATE TABLE portal_invoices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES portal_organizations(id) ON DELETE CASCADE,
  number           TEXT NOT NULL UNIQUE, -- e.g. INV-2026-001
  status           TEXT NOT NULL DEFAULT 'unpaid', -- unpaid | paid | overdue | void
  amount_gbp       NUMERIC(10,2) NOT NULL,
  period_start     TIMESTAMPTZ NOT NULL,
  period_end       TIMESTAMPTZ NOT NULL,
  issued_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_at           TIMESTAMPTZ NOT NULL,
  paid_at          TIMESTAMPTZ,
  pdf_url          TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON portal_invoices (organization_id);
CREATE INDEX ON portal_invoices (status);
```

After adding the SQL file, update `prisma/schema.prisma` with the matching Prisma models and run:

```bash
npx prisma generate   # regenerate the client
npm run db:migrate    # apply to the database
```

### Production migration

```bash
# On the production server (or in your CI/CD pipeline after deploy):
npm run db:migrate
```

`prisma migrate deploy` is idempotent — it only applies migrations that have not yet been applied. It is safe to run on every deployment.

---

## First-Run Setup (Seed Initial Admin)

The portal admin user is created by a seed script. Run this once on a fresh environment.

```bash
# Ensure env vars are set
export PORTAL_ADMIN_EMAIL=ross@integrius.io
export PORTAL_ADMIN_PASSWORD=<strong-random-password>

# Run the portal seed (separate from the CMS seed)
npm run db:seed-portal
```

The seed script (`prisma/seed-portal.ts`) will:

1. Check whether a portal admin with `PORTAL_ADMIN_EMAIL` already exists.
2. If not, hash the password with bcrypt (cost factor 12) and insert the record into `portal_admin_users`.
3. Print confirmation.

If you need to reset the admin password, delete the record from `portal_admin_users` and re-run the seed, or update the `password_hash` directly via Prisma Studio.

### Verify the admin login

```bash
curl -s -X POST \
  -c /tmp/portal-cookies.txt \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$PORTAL_ADMIN_EMAIL\",\"password\":\"$PORTAL_ADMIN_PASSWORD\"}" \
  http://localhost:3002/api/portal/admin/login
# Expected: {"ok":true}

curl -s -b /tmp/portal-cookies.txt http://localhost:3002/api/portal/admin/me
# Expected: {"email":"ross@integrius.io"}
```

---

## Running the Portal Locally

```bash
# 1. Copy the example env file
cp .env.example .env
# Edit .env — fill in the portal-specific variables listed above

# 2. Apply migrations and generate Prisma client
npm run db:migrate
npx prisma generate

# 3. Seed the admin user
npm run db:seed-portal

# 4. Start the dev server
npm run dev
# App runs at http://localhost:3002
```

**Admin portal:** `http://localhost:3002/portal/admin`
**Client portal:** `http://localhost:3002/portal/client`
**API base:** `http://localhost:3002/api/portal/`

### Recommended local test flow

1. Log in as admin at `/portal/admin`.
2. Create a test organization (`POST /api/portal/admin/organizations`).
3. Issue a license for that organization (`POST /api/portal/admin/organizations/[id]/licenses`).
4. Copy the `license_jwt` from the response.
5. Create a client user via the invitation flow or directly via Prisma Studio.
6. Log in as the client user at `/portal/client`.
7. Verify the license key is visible on the client license dashboard.

### Prisma Studio (database browser)

```bash
npm run db:studio
# Open http://localhost:5556
```

Useful for inspecting `portal_licenses`, editing test data, and verifying migrations during development.

---

## Production Deployment Checklist

Complete every item before going live. Check off in order.

### Infrastructure

- [ ] PostgreSQL database provisioned and `DATABASE_URL` configured
- [ ] Database accessible from the application server
- [ ] TLS/HTTPS enforced at the load balancer or CDN layer

### Environment Variables

- [ ] `DATABASE_URL` set and verified
- [ ] `PORTAL_ADMIN_JWT_SECRET` set — 64-byte hex, generated with `crypto.randomBytes(64)`
- [ ] `PORTAL_CLIENT_JWT_SECRET` set — 64-byte hex, different from the admin secret
- [ ] `PORTAL_LICENSE_SIGNING_KEY` set — RSA private key (PEM format)
- [ ] `PORTAL_LICENSE_PUBLIC_KEY` set — RSA public key (PEM format)
- [ ] `PORTAL_ADMIN_EMAIL` set — initial admin account email
- [ ] `PORTAL_ADMIN_PASSWORD` set — strong random password
- [ ] `RESEND_API_KEY` set — for invitation emails
- [ ] `PORTAL_EMAIL_FROM` set — verified sender domain in Resend
- [ ] `NODE_ENV=production` set — enables `Secure` flag on cookies

### Database

- [ ] `npm run db:migrate` run successfully in production
- [ ] Portal tables present: `portal_organizations`, `portal_users`, `portal_licenses`, `portal_invitations`, `portal_invoices`
- [ ] `npm run db:seed-portal` run to create initial admin user

### Security

- [ ] Admin portal path (`/portal/admin`) restricted to Integrius IP range at CDN/network level (optional but recommended)
- [ ] Rate limiting applied to `POST /api/portal/client/login` and `POST /api/portal/admin/login` (e.g. 10 requests/minute per IP)
- [ ] `PORTAL_ADMIN_JWT_SECRET` and `PORTAL_CLIENT_JWT_SECRET` are different values
- [ ] `PORTAL_LICENSE_SIGNING_KEY` (private) is stored as an encrypted secret, not in `.env` files committed to version control

### Verification

- [ ] Admin login works: `POST /api/portal/admin/login`
- [ ] `GET /api/portal/admin/me` returns admin email
- [ ] `GET /api/portal/admin/dashboard/metrics` returns metrics object
- [ ] Client login and `GET /api/portal/client/me` work end-to-end with a test account
- [ ] License JWT validates correctly with the corresponding public key

### Monitoring

- [ ] Error tracking (e.g. Sentry) configured and receiving events
- [ ] Database backup schedule confirmed
- [ ] License expiry alerts configured (notify Integrius staff when licenses expire within 30 days)

---

## Issuing a License for a New Client

This is the standard workflow from sales close to the client receiving their license key. Estimated time: 10–15 minutes.

### Step 1: Create the organization

Navigate to the admin portal → **Organizations** → **New Organization**, or use the API:

```bash
curl -s -X POST \
  -b /tmp/portal-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "domain": "acme.com",
    "billing_email": "finance@acme.com",
    "billing_name": "Acme Corporation Ltd",
    "plan_note": "Enterprise — closed by Ross, March 2026"
  }' \
  https://portal.integrius.io/api/portal/admin/organizations
```

Note the `id` from the response — you will need it for subsequent steps.

### Step 2: Issue the license

```bash
curl -s -X POST \
  -b /tmp/portal-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "product": "core",
    "tier": "enterprise",
    "starts_at": "2026-04-01T00:00:00Z",
    "expires_at": "2027-04-01T00:00:00Z",
    "price_gbp_monthly": 1500,
    "data_source_limit": 100,
    "seat_limit": 50,
    "notes": "12-month contract — PO ref ACM-2026-041"
  }' \
  https://portal.integrius.io/api/portal/admin/organizations/<org-id>/licenses
```

Copy the `license_jwt` from the response and keep it available for Step 5.

### Step 3: Create the client's owner account

Use Prisma Studio or an admin utility script to create the client's primary user account. Set their `role` to `owner` and hash their temporary password with bcrypt.

Alternatively, use the invitation flow: call `POST /api/portal/client/team` after creating the user, or implement an admin-side "invite owner" endpoint.

### Step 4: Send the client their login credentials

Email the client:

- Portal URL: `https://portal.integrius.io/portal/client`
- Their email address
- A temporary password (they should change this on first login)
- A link to the client onboarding guide

### Step 5: Confirm the client can see their license

Ask the client to log in and navigate to **Licenses**. They should see:

- Product: Integrius Core
- Tier: Enterprise
- Status: Active
- Expiry: 1 April 2027
- A license key (the `license_jwt`) they can copy

### Step 6: Client activates their installation

The client copies the license key from the portal and sets it as an environment variable in their Integrius Core / Optic deployment:

```bash
# In the client's Integrius Core deployment
INTEGRIUS_LICENSE_KEY=eyJhbGciOiJSUzI1NiJ9...
```

Integrius Core reads and validates this JWT at startup. If valid, the product starts normally.

---

## Routine Operations

### Renewing a license

Issue a new license with updated `starts_at` and `expires_at`. You do not need to revoke the old one if the new license starts immediately after. The client copies the new `license_key` from their portal dashboard.

### Upgrading a client's tier

Use `PUT /api/portal/admin/organizations/[id]/licenses/[licenseId]` to update the `tier` and any limit fields. The license JWT is re-signed automatically. Notify the client to copy the updated license key from their dashboard.

### Suspending an organization

`PUT /api/portal/admin/organizations/[id]` with `{"status":"suspended"}`. This prevents the client from logging in to the portal. It does not immediately stop their installed software — revoke the license separately if needed.

### Revoking a license

```bash
curl -s -X POST \
  -b /tmp/portal-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"reason":"Non-payment — invoice INV-2026-001 overdue 60 days"}' \
  https://portal.integrius.io/api/portal/admin/organizations/<org-id>/licenses/<lic-id>/revoke
```

See [Offline License Validation — revocation timing](./API-REFERENCE.md#what-happens-on-revocation) for how quickly this takes effect.

---

## Troubleshooting

### "prisma generate" fails after adding new models

Run `npx prisma generate` after every change to `schema.prisma`. If using TypeScript, restart your IDE's TypeScript server to pick up the new types.

### License JWT validation fails in the downstream product

1. Confirm `PORTAL_LICENSE_PUBLIC_KEY` in the downstream product matches the public key derived from `PORTAL_LICENSE_SIGNING_KEY` in the portal.
2. Check the `exp` claim — is the license expired?
3. Check the `product` claim — does it match the product being activated?
4. Verify the JWT was not truncated when copying from the portal.

```bash
# Decode and inspect a JWT (without verifying signature)
node -e "const [,p]=process.argv[1].split('.');console.log(JSON.parse(Buffer.from(p,'base64url')))" -- eyJhbGci...
```

### Client cannot log in

1. Check `portal_users.password_hash` is set (not null).
2. Check the organization's `status` is `active` (not `suspended` or `churned`).
3. Check `portal_client_token` cookie is being set — inspect browser dev tools → Application → Cookies.

### Invitation email not received

1. Verify `RESEND_API_KEY` is valid and the sending domain is verified in Resend.
2. Check the `portal_invitations` table — is the invitation record present and not expired?
3. Check Resend's logs at `https://resend.com/emails` for delivery errors.

### Database migration fails in production

1. Confirm `DATABASE_URL` points to the correct database.
2. Check the Postgres user has `CREATE TABLE` privileges.
3. Inspect `prisma/migrations` — the migration may already be partially applied. Connect to the database and check the `_prisma_migrations` table.
