# Integrius Client Portal — Technical Architecture

**Status:** Design document for Lead Developer implementation
**Author:** Tech Lead
**Date:** 2026-03-24
**Stack baseline:** Next.js 14.2, React 18, TypeScript, PostgreSQL, Prisma 5, jose JWT, bcryptjs, Tailwind CSS, Resend

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prisma Schema Additions](#2-prisma-schema-additions)
3. [Route Structure](#3-route-structure)
4. [API Design](#4-api-design)
5. [License Key Format and Validation](#5-license-key-format-and-validation)
6. [Revenue Metrics Calculation](#6-revenue-metrics-calculation)
7. [File Structure](#7-file-structure)
8. [Migration Strategy](#8-migration-strategy)
9. [Environment Variables](#9-environment-variables)
10. [Third-Party Integrations](#10-third-party-integrations)
11. [Implementation Phases](#11-implementation-phases)

---

## 1. Overview

The client portal is a self-contained section of the Integrius marketing site that provides:

- **Admin side** (`/portal/admin/*`): Operated by Integrius staff. Manages organizations, issues licenses, tracks revenue metrics, and reviews audit logs.
- **Client side** (`/portal/client/*`): Operated by paying customers. Allows each organization's users to view their licenses, manage team members, and view billing history.

### Architectural principles

- **Same database, separate table prefix.** All new tables use the `portal_` prefix, keeping them cleanly separated from the existing `cms_` tables. Both sets of tables live in the same PostgreSQL instance and the same Prisma schema file.
- **Two independent auth contexts.** The existing CMS admin uses the `cms_admin_token` cookie and `CMS_JWT_SECRET`. The portal admin uses `portal_admin_token` and `PORTAL_ADMIN_JWT_SECRET`. Client users use `portal_client_token` and `PORTAL_CLIENT_JWT_SECRET`. The three are fully independent.
- **No new npm packages required for Phase 1.** `jose`, `bcryptjs`, `resend`, and `prisma` are already in `package.json`. Stripe is introduced in Phase 2.
- **RESTful JSON API.** All portal pages are client components that fetch from `/api/portal/*` endpoints. This keeps the page components thin and the business logic testable.

---

## 2. Prisma Schema Additions

Append the following to the bottom of `prisma/schema.prisma`. The existing CMS models are unchanged.

```prisma
// ─────────────────────────────────────────────────────────────────────────────
// INTEGRIUS CLIENT PORTAL
//
// All tables are prefixed portal_ to avoid collision with cms_ tables.
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums ────────────────────────────────────────────────────────────────────

enum PortalAdminRole {
  SUPER_ADMIN   // Can do everything including create other admins
  ACCOUNT_ADMIN // Can manage clients and licenses but not other admins
  VIEWER        // Read-only access to all portal data
}

enum LicenseTier {
  STARTER     // Entry-level, single product
  PLATFORM    // Multi-product, up to 100 products
  ENTERPRISE  // Unlimited products, SLA, custom data sources
}

enum LicenseStatus {
  ACTIVE
  SUSPENDED   // Temporarily disabled by admin
  REVOKED     // Permanently cancelled
  EXPIRED     // Past expiry date
}

enum ProductType {
  CORE        // Integrius Core (the data integration layer)
  OPTIC       // Integrius Optic (conversational interface)
  SEARCH      // Integrius Search
  SDK         // Integrius SDK
}

enum ClientUserRole {
  OWNER       // Created the account; cannot be removed
  ADMIN       // Can manage team members and view all license data
  MEMBER      // Can view licenses and usage; cannot manage team
}

enum ClientUserStatus {
  ACTIVE
  INVITED     // Email sent, not yet accepted
  SUSPENDED
}

enum AuditAction {
  // License actions
  LICENSE_CREATED
  LICENSE_UPDATED
  LICENSE_SUSPENDED
  LICENSE_REVOKED
  LICENSE_RENEWED
  // Org actions
  ORG_CREATED
  ORG_UPDATED
  // Client user actions
  CLIENT_USER_INVITED
  CLIENT_USER_REMOVED
  CLIENT_USER_ROLE_CHANGED
  // Invoice actions
  INVOICE_CREATED
  INVOICE_PAID
  INVOICE_VOIDED
  // Admin actions
  PORTAL_ADMIN_LOGIN
  PORTAL_ADMIN_LOGOUT
  CLIENT_LOGIN
  CLIENT_LOGOUT
}

enum InvoiceStatus {
  DRAFT
  OPEN        // Sent to client, awaiting payment
  PAID
  VOID
  UNCOLLECTIBLE
}

// ── Models ───────────────────────────────────────────────────────────────────

// Portal admin users — SEPARATE from cms_admin_users
// An Integrius employee logs in here to manage clients.
model portal_admin_users {
  id            String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email         String          @unique
  password_hash String
  full_name     String
  role          PortalAdminRole @default(ACCOUNT_ADMIN)
  is_active     Boolean         @default(true)
  created_at    DateTime        @default(now()) @db.Timestamptz(6)
  last_login_at DateTime?       @db.Timestamptz(6)

  audit_logs    portal_audit_logs[]

  @@index([email])
  @@index([role])
}

// Organizations — one per paying customer (e.g. "Acme Corp")
model portal_organizations {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name           String                         // "Acme Corp"
  slug           String   @unique               // "acme-corp" — used in URLs
  domain         String?                        // "acme.com" — for SSO later
  billing_email  String                         // Where invoices are sent
  billing_name   String?                        // "Acme Corp Finance Dept"

  // Salesforce / CRM reference (optional — for manual linking)
  crm_id         String?

  // Address fields (required for compliant invoicing)
  address_line1  String?
  address_line2  String?
  city           String?
  state          String?
  postal_code    String?
  country        String?  @default("US")

  notes          String?  @db.Text              // Internal notes visible only to portal admins

  is_active      Boolean  @default(true)
  created_at     DateTime @default(now()) @db.Timestamptz(6)
  updated_at     DateTime @default(now()) @db.Timestamptz(6)

  client_users   portal_client_users[]
  licenses       portal_licenses[]
  invoices       portal_invoices[]
  audit_logs     portal_audit_logs[]

  @@index([slug])
  @@index([billing_email])
  @@index([is_active])
}

// Client users — employees of a customer organization who log in to the client portal
model portal_client_users {
  id              String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organization_id String           @db.Uuid
  email           String           @unique
  password_hash   String?                       // null until invite accepted
  full_name       String
  role            ClientUserRole   @default(MEMBER)
  status          ClientUserStatus @default(INVITED)

  // Invitation tracking
  invite_token    String?          @unique       // short-lived token sent via email
  invite_expires  DateTime?        @db.Timestamptz(6)
  invite_accepted_at DateTime?     @db.Timestamptz(6)

  // Password reset
  reset_token     String?          @unique
  reset_expires   DateTime?        @db.Timestamptz(6)

  created_at      DateTime         @default(now()) @db.Timestamptz(6)
  last_login_at   DateTime?        @db.Timestamptz(6)

  organization    portal_organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  @@index([organization_id])
  @@index([email])
  @@index([status])
  @@index([invite_token])
}

// Licenses — one license record per product per org (one org may hold multiple licenses)
model portal_licenses {
  id              String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organization_id String        @db.Uuid
  license_key     String        @unique       // See Section 5 for format
  tier            LicenseTier
  status          LicenseStatus @default(ACTIVE)

  // Validity window
  starts_at       DateTime      @db.Timestamptz(6)
  expires_at      DateTime?     @db.Timestamptz(6)   // null = perpetual (rare)
  trial_ends_at   DateTime?     @db.Timestamptz(6)   // set if this is a trial license

  // Commercial terms
  mrr_cents       Int           @default(0)    // Monthly Recurring Revenue in cents (USD)
  currency        String        @default("USD")
  billing_cycle   String        @default("monthly")  // "monthly" | "annual"

  // Limits encoded in the license (enforced by downstream products via JWT)
  max_products    Int?                          // null = unlimited
  max_users       Int?                          // null = unlimited
  max_data_sources Int?                         // null = unlimited

  // Notes visible to the client in their portal
  display_name    String?                       // "Production License" or "Staging License"
  notes           String?  @db.Text            // Internal only

  // Soft-delete / audit
  revoked_at      DateTime? @db.Timestamptz(6)
  revoked_reason  String?

  created_at      DateTime  @default(now()) @db.Timestamptz(6)
  updated_at      DateTime  @default(now()) @db.Timestamptz(6)

  organization    portal_organizations   @relation(fields: [organization_id], references: [id], onDelete: Cascade)
  products        portal_license_products[]
  usage_events    portal_usage_events[]
  audit_logs      portal_audit_logs[]

  @@index([organization_id])
  @@index([status])
  @@index([expires_at])
  @@index([license_key])
}

// LicenseProducts — which Integrius products are included on a license
// A single license can cover multiple products.
model portal_license_products {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  license_id      String      @db.Uuid
  product         ProductType
  enabled         Boolean     @default(true)
  added_at        DateTime    @default(now()) @db.Timestamptz(6)

  license         portal_licenses @relation(fields: [license_id], references: [id], onDelete: Cascade)

  @@unique([license_id, product])
  @@index([license_id])
}

// UsageEvents — telemetry pings sent by deployed Integrius products
// Downstream products POST to /api/portal/usage with their signed JWT.
// These drive the usage dashboard visible to the client.
model portal_usage_events {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  license_id      String      @db.Uuid
  product         ProductType
  event_type      String                   // e.g. "heartbeat" | "query" | "sync_run"
  user_count      Int?                     // active users at time of ping
  data_source_count Int?                   // data sources connected at time of ping
  product_count   Int?                     // products actively in use
  metadata        Json?                    // arbitrary key-value pairs from the product
  recorded_at     DateTime    @default(now()) @db.Timestamptz(6)

  license         portal_licenses @relation(fields: [license_id], references: [id], onDelete: Cascade)

  @@index([license_id, recorded_at])
  @@index([product, recorded_at])
}

// Invoices — billing records per organization
// Phase 1: manually created by portal admins.
// Phase 2: auto-created from Stripe webhook events.
model portal_invoices {
  id              String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organization_id String        @db.Uuid
  invoice_number  String        @unique   // e.g. "INV-2026-001"
  status          InvoiceStatus @default(DRAFT)

  // Stripe reference (populated in Phase 2)
  stripe_invoice_id   String?  @unique
  stripe_payment_url  String?

  amount_cents    Int                      // Total in cents
  currency        String   @default("USD")
  description     String?  @db.Text

  period_start    DateTime @db.Timestamptz(6)
  period_end      DateTime @db.Timestamptz(6)

  due_date        DateTime? @db.Timestamptz(6)
  paid_at         DateTime? @db.Timestamptz(6)
  voided_at       DateTime? @db.Timestamptz(6)

  created_at      DateTime  @default(now()) @db.Timestamptz(6)
  updated_at      DateTime  @default(now()) @db.Timestamptz(6)

  organization    portal_organizations @relation(fields: [organization_id], references: [id], onDelete: Cascade)

  @@index([organization_id])
  @@index([status])
  @@index([due_date])
}

// AuditLog — immutable record of every significant action in the portal
// Written by API routes after successful mutations; never updated or deleted.
model portal_audit_logs {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  action          AuditAction
  actor_type      String                   // "portal_admin" | "client_user"
  actor_id        String      @db.Uuid     // ID from portal_admin_users or portal_client_users
  actor_email     String                   // Denormalized for readability after deletion

  // Optional targets (null if the action doesn't target a specific record)
  organization_id String?     @db.Uuid
  license_id      String?     @db.Uuid

  // Snapshot of what changed (JSON diff)
  before          Json?
  after           Json?

  ip_address      String?
  user_agent      String?

  created_at      DateTime    @default(now()) @db.Timestamptz(6)

  // Relations for convenience queries (no cascade delete — logs are permanent)
  organization    portal_organizations? @relation(fields: [organization_id], references: [id])
  license         portal_licenses?      @relation(fields: [license_id], references: [id])
  admin           portal_admin_users?   @relation(fields: [actor_id], references: [id])

  @@index([actor_id])
  @@index([organization_id])
  @@index([license_id])
  @@index([action, created_at])
  @@index([created_at])
}
```

---

## 3. Route Structure

### 3.1 Admin routes (`/portal/admin/*`)

Access: Authenticated `portal_admin_users` only. Verified server-side by `portal_admin_token` cookie.

| Route | Component | Purpose |
|---|---|---|
| `/portal/admin/login` | Page | Portal admin login form |
| `/portal/admin` | Page (redirect to `/portal/admin/dashboard`) | Root redirect |
| `/portal/admin/dashboard` | Page | MRR/ARR/churn summary, recent activity |
| `/portal/admin/organizations` | Page | List all organizations (search, filter, paginate) |
| `/portal/admin/organizations/new` | Page | Create new organization |
| `/portal/admin/organizations/[orgId]` | Page | Organization detail (licenses, users, invoices) |
| `/portal/admin/organizations/[orgId]/edit` | Page | Edit organization details |
| `/portal/admin/licenses` | Page | All licenses across all orgs (searchable) |
| `/portal/admin/licenses/new` | Page | Issue a new license (select org, tier, products) |
| `/portal/admin/licenses/[licenseId]` | Page | License detail (key, status, usage, audit trail) |
| `/portal/admin/licenses/[licenseId]/edit` | Page | Edit license terms |
| `/portal/admin/invoices` | Page | All invoices across all orgs |
| `/portal/admin/invoices/new` | Page | Create invoice for an organization |
| `/portal/admin/invoices/[invoiceId]` | Page | Invoice detail |
| `/portal/admin/audit` | Page | Global audit log (filterable by action, actor, org) |
| `/portal/admin/settings` | Page | Portal admin account settings, create admin users |

### 3.2 Client routes (`/portal/client/*`)

Access: Authenticated `portal_client_users` only. Role-gated within the layout.

| Route | Component | Minimum role | Purpose |
|---|---|---|---|
| `/portal/client/login` | Page | — | Client login form |
| `/portal/client/invite/[token]` | Page | — | Accept invite, set password |
| `/portal/client/forgot-password` | Page | — | Request password reset |
| `/portal/client/reset-password/[token]` | Page | — | Set new password |
| `/portal/client` | Redirect | MEMBER | → `/portal/client/licenses` |
| `/portal/client/licenses` | Page | MEMBER | All licenses for this organization |
| `/portal/client/licenses/[licenseId]` | Page | MEMBER | License detail, key display, usage chart |
| `/portal/client/team` | Page | ADMIN | Manage team members, invite new users |
| `/portal/client/billing` | Page | ADMIN | Invoice history, download PDFs |
| `/portal/client/settings` | Page | ADMIN | Organization profile, billing contact |

### 3.3 API routes

All under `/api/portal/`. Full details in Section 4.

```
/api/portal/admin/login          POST
/api/portal/admin/logout         POST
/api/portal/admin/me             GET

/api/portal/admin/organizations           GET, POST
/api/portal/admin/organizations/[orgId]   GET, PUT, DELETE
/api/portal/admin/organizations/[orgId]/licenses  GET

/api/portal/admin/licenses                GET, POST
/api/portal/admin/licenses/[licenseId]    GET, PUT
/api/portal/admin/licenses/[licenseId]/revoke  POST
/api/portal/admin/licenses/[licenseId]/suspend POST
/api/portal/admin/licenses/[licenseId]/reactivate POST

/api/portal/admin/invoices                GET, POST
/api/portal/admin/invoices/[invoiceId]    GET, PUT
/api/portal/admin/invoices/[invoiceId]/mark-paid POST
/api/portal/admin/invoices/[invoiceId]/void      POST

/api/portal/admin/metrics         GET   (MRR, ARR, churn, projections)
/api/portal/admin/audit           GET   (paginated audit log)

/api/portal/client/login          POST
/api/portal/client/logout         POST
/api/portal/client/me             GET
/api/portal/client/invite/[token] GET (validate), POST (accept + set password)
/api/portal/client/forgot-password POST
/api/portal/client/reset-password  POST

/api/portal/client/licenses                GET
/api/portal/client/licenses/[licenseId]    GET
/api/portal/client/team                    GET, POST (invite)
/api/portal/client/team/[userId]           DELETE (remove member)
/api/portal/client/team/[userId]/role      PUT (change role)
/api/portal/client/billing                 GET
/api/portal/client/billing/[invoiceId]     GET
/api/portal/client/settings                GET, PUT

/api/portal/usage                 POST  (called by downstream Integrius products)
/api/portal/license/validate      POST  (called by downstream Integrius products)
```

---

## 4. API Design

### 4.1 Standard error response format

Every error response follows the same shape so clients can handle them uniformly:

```typescript
interface ApiError {
  error: string;       // Human-readable message
  code?: string;       // Machine-readable code, e.g. "LICENSE_EXPIRED"
  field?: string;      // Which request field caused a validation error
}
```

HTTP status usage:
- `400` — Invalid input (missing fields, bad format)
- `401` — Not authenticated
- `403` — Authenticated but not authorized (wrong role, wrong organization)
- `404` — Record not found
- `409` — Conflict (e.g. duplicate email, duplicate license key)
- `422` — Semantically invalid (e.g. revoking an already-revoked license)
- `500` — Unexpected server error

### 4.2 Shared TypeScript interfaces

```typescript
// src/lib/portal/types.ts

export type LicenseTier = 'STARTER' | 'PLATFORM' | 'ENTERPRISE';
export type LicenseStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED';
export type ProductType = 'CORE' | 'OPTIC' | 'SEARCH' | 'SDK';
export type ClientUserRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type ClientUserStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED';
export type InvoiceStatus = 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE';
export type AuditAction = string; // see enum above

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  billing_email: string;
  billing_name: string | null;
  crm_id: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  notes: string | null;
  is_active: boolean;
  created_at: string; // ISO 8601
  updated_at: string;
  // Aggregates — included on detail endpoints only
  license_count?: number;
  active_license_count?: number;
  mrr_cents?: number;
}

export interface License {
  id: string;
  organization_id: string;
  license_key: string;
  tier: LicenseTier;
  status: LicenseStatus;
  starts_at: string;
  expires_at: string | null;
  trial_ends_at: string | null;
  mrr_cents: number;
  currency: string;
  billing_cycle: 'monthly' | 'annual';
  max_products: number | null;
  max_users: number | null;
  max_data_sources: number | null;
  display_name: string | null;
  notes: string | null;
  revoked_at: string | null;
  revoked_reason: string | null;
  created_at: string;
  updated_at: string;
  products: LicenseProduct[];
  // Joined
  organization?: Pick<Organization, 'id' | 'name' | 'slug'>;
  latest_usage?: UsageSnapshot;
}

export interface LicenseProduct {
  id: string;
  license_id: string;
  product: ProductType;
  enabled: boolean;
  added_at: string;
}

export interface UsageSnapshot {
  user_count: number | null;
  data_source_count: number | null;
  product_count: number | null;
  recorded_at: string;
}

export interface ClientUser {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: ClientUserRole;
  status: ClientUserStatus;
  invite_accepted_at: string | null;
  created_at: string;
  last_login_at: string | null;
}

export interface Invoice {
  id: string;
  organization_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  stripe_invoice_id: string | null;
  stripe_payment_url: string | null;
  amount_cents: number;
  currency: string;
  description: string | null;
  period_start: string;
  period_end: string;
  due_date: string | null;
  paid_at: string | null;
  voided_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  actor_type: 'portal_admin' | 'client_user';
  actor_id: string;
  actor_email: string;
  organization_id: string | null;
  license_id: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface MetricsSummary {
  mrr_cents: number;
  arr_cents: number;
  active_license_count: number;
  active_org_count: number;
  churned_this_month_cents: number;
  churn_rate_pct: number;
  net_new_mrr_cents: number;
  projections: MonthlyProjection[];
}

export interface MonthlyProjection {
  month: string;         // "2026-04"
  projected_mrr_cents: number;
  projected_arr_cents: number;
}
```

### 4.3 Key API request/response examples

#### `POST /api/portal/admin/licenses`

```typescript
// Request body
interface CreateLicenseRequest {
  organization_id: string;
  tier: LicenseTier;
  products: ProductType[];          // At least one required
  starts_at: string;                // ISO 8601 date
  expires_at?: string;              // ISO 8601 date; omit for perpetual
  trial_ends_at?: string;
  mrr_cents: number;                // 0 for trials / perpetual
  billing_cycle: 'monthly' | 'annual';
  max_products?: number;
  max_users?: number;
  max_data_sources?: number;
  display_name?: string;
  notes?: string;
}

// 201 Created response
interface CreateLicenseResponse {
  license: License;
}
```

#### `POST /api/portal/admin/licenses/[licenseId]/revoke`

```typescript
// Request body
interface RevokeLicenseRequest {
  reason: string;  // Required; stored in revoked_reason
}

// 200 OK
interface RevokeLicenseResponse {
  license: Pick<License, 'id' | 'status' | 'revoked_at' | 'revoked_reason'>;
}
```

#### `GET /api/portal/admin/metrics`

```typescript
// Query params (all optional)
// ?from=2026-01-01&to=2026-03-31&projection_months=6

// 200 OK
interface MetricsResponse {
  metrics: MetricsSummary;
  generated_at: string;
}
```

#### `POST /api/portal/license/validate`

Called by deployed Integrius products on every startup and periodically during operation.

```typescript
// Request body — sent by the downstream product
interface LicenseValidateRequest {
  license_key: string;
}

// 200 OK — product receives a short-lived signed JWT
interface LicenseValidateResponse {
  valid: true;
  token: string;           // Signed JWT; see Section 5
  expires_in: number;      // Seconds until the JWT expires (e.g. 3600)
}

// 403 Forbidden — key is invalid, suspended, revoked, or expired
interface LicenseValidateError {
  valid: false;
  error: string;
  code: 'INVALID_KEY' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED';
}
```

#### `POST /api/portal/usage`

```typescript
// Request headers
// Authorization: Bearer <license_jwt_from_validate_endpoint>

// Request body
interface UsageEventRequest {
  product: ProductType;
  event_type: 'heartbeat' | 'query' | 'sync_run' | string;
  user_count?: number;
  data_source_count?: number;
  product_count?: number;
  metadata?: Record<string, unknown>;
}

// 204 No Content on success
```

#### `POST /api/portal/client/invite/[token]` (accept invite)

```typescript
// Request body
interface AcceptInviteRequest {
  password: string;          // Min 12 chars; validated server-side
  full_name?: string;        // Can update their own name at acceptance
}

// 200 OK — sets portal_client_token cookie and returns user
interface AcceptInviteResponse {
  user: ClientUser;
}
```

---

## 5. License Key Format and Validation

### 5.1 License key format

```
INT-{TIER}-{RANDOM}-{CHECKSUM}

Examples:
  INT-STR-X7K2M9QP-A3
  INT-PLT-R4N8WVJC-F9
  INT-ENT-T6B1LXDQ-M5
```

Components:
- `INT` — Fixed prefix identifying Integrius
- `{TIER}` — 3-char tier code: `STR` (Starter), `PLT` (Platform), `ENT` (Enterprise)
- `{RANDOM}` — 8 uppercase alphanumeric characters (base-32 using `BCDFGHJKMPQRTVWXY2346789` — no ambiguous chars like 0/O, 1/I/L)
- `{CHECKSUM}` — 2-char Luhn-style checksum over the random segment

**Generation function** (`src/lib/portal/license-key.ts`):

```typescript
const CHARSET = 'BCDFGHJKMPQRTVWXY2346789';

function generateSegment(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, b => CHARSET[b % CHARSET.length]).join('');
}

function checksum(segment: string): string {
  // Simple sum of char indices mod charset.length, expressed as two chars
  const sum = segment.split('').reduce((acc, c) => acc + CHARSET.indexOf(c), 0);
  const c1 = CHARSET[sum % CHARSET.length];
  const c2 = CHARSET[Math.floor(sum / CHARSET.length) % CHARSET.length];
  return `${c1}${c2}`;
}

export function generateLicenseKey(tier: LicenseTier): string {
  const tierCode = { STARTER: 'STR', PLATFORM: 'PLT', ENTERPRISE: 'ENT' }[tier];
  const random = generateSegment(8);
  const cs = checksum(random);
  return `INT-${tierCode}-${random}-${cs}`;
}

export function validateLicenseKeyFormat(key: string): boolean {
  const match = key.match(/^INT-(STR|PLT|ENT)-([BCDFGHJKMPQRTVWXY2346789]{8})-([BCDFGHJKMPQRTVWXY2346789]{2})$/);
  if (!match) return false;
  const [, , random, cs] = match;
  return checksum(random) === cs;
}
```

### 5.2 Downstream validation via signed JWT

When a deployed Integrius product calls `POST /api/portal/license/validate` with a raw license key, the portal returns a short-lived signed JWT. The product caches this JWT and validates it locally for subsequent requests without hitting the portal API on every operation.

**JWT payload structure:**

```typescript
interface LicenseJwtPayload {
  iss: 'integrius-portal';          // Issuer
  sub: string;                      // license_id (UUID)
  aud: string;                      // organization_id
  iat: number;                      // Issued at
  exp: number;                      // Expiry (1 hour from issue)
  jti: string;                      // Unique JWT ID (UUID) — for replay prevention
  key: string;                      // The raw license key (for logging)
  tier: LicenseTier;
  products: ProductType[];
  limits: {
    max_products: number | null;
    max_users: number | null;
    max_data_sources: number | null;
  };
}
```

**Signing:** `HS256` using `PORTAL_LICENSE_JWT_SECRET` (separate from admin/client secrets).
**TTL:** 3600 seconds (1 hour). Downstream products should re-validate every 55 minutes.
**Validation by downstream:** The product verifies the JWT signature using the shared `PORTAL_LICENSE_JWT_SECRET`. It does not need to contact the portal to validate a non-expired JWT.

**Usage events auth:** The product sends `Authorization: Bearer <license_jwt>` on usage event POSTs. The portal API verifies the JWT, extracts `license_id`, and writes the usage event. This means the portal never trusts a raw license key for usage events — only validated JWTs.

---

## 6. Revenue Metrics Calculation

All metrics are computed at query time in `src/lib/portal/metrics.ts` against the `portal_licenses` and `portal_invoices` tables.

### 6.1 MRR (Monthly Recurring Revenue)

**Definition:** Sum of `mrr_cents` for all licenses where `status = ACTIVE` and `starts_at <= NOW()` and (`expires_at IS NULL` OR `expires_at > NOW()`).

Annual licenses are normalized to monthly: an annual `mrr_cents` value stored in the database should already be monthly equivalent (i.e. `annual_price / 12`). The `billing_cycle` field records whether the customer pays monthly or annually.

```typescript
async function computeMRR(): Promise<number> {
  const result = await prisma.portal_licenses.aggregate({
    _sum: { mrr_cents: true },
    where: {
      status: 'ACTIVE',
      starts_at: { lte: new Date() },
      OR: [
        { expires_at: null },
        { expires_at: { gt: new Date() } },
      ],
    },
  });
  return result._sum.mrr_cents ?? 0;
}
```

### 6.2 ARR (Annual Recurring Revenue)

`ARR = MRR * 12`

No special calculation needed. Annual customers with annual billing cycles are still stored as MRR-equivalent values so this formula holds for all.

### 6.3 Churn calculation

**Monthly churn rate:** The percentage of MRR lost in the current calendar month relative to the MRR at the start of the month.

```typescript
interface ChurnResult {
  churned_mrr_cents: number;    // MRR from licenses revoked/expired this month
  opening_mrr_cents: number;    // MRR at start of current month
  churn_rate_pct: number;       // churned / opening * 100
}

async function computeChurn(year: number, month: number): Promise<ChurnResult> {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd   = new Date(year, month, 1);

  // MRR lost: licenses that became REVOKED or EXPIRED this month
  const churned = await prisma.portal_licenses.aggregate({
    _sum: { mrr_cents: true },
    where: {
      OR: [
        { status: 'REVOKED', revoked_at: { gte: monthStart, lt: monthEnd } },
        { status: 'EXPIRED', expires_at: { gte: monthStart, lt: monthEnd } },
      ],
    },
  });
  const churned_mrr_cents = churned._sum.mrr_cents ?? 0;

  // Opening MRR: all active licenses as of monthStart
  const opening = await prisma.portal_licenses.aggregate({
    _sum: { mrr_cents: true },
    where: {
      status: { in: ['ACTIVE', 'REVOKED', 'EXPIRED'] },
      starts_at: { lt: monthStart },
      OR: [
        { expires_at: null },
        { expires_at: { gte: monthStart } },
      ],
      revoked_at: { not: { lt: monthStart } },
    },
  });
  const opening_mrr_cents = opening._sum.mrr_cents ?? 0;
  const churn_rate_pct = opening_mrr_cents > 0
    ? (churned_mrr_cents / opening_mrr_cents) * 100
    : 0;

  return { churned_mrr_cents, opening_mrr_cents, churn_rate_pct };
}
```

### 6.4 Net New MRR

```
Net New MRR = New MRR (licenses started this month)
            + Expansion MRR (mrr_cents increases via license edits this month)
            - Churned MRR (computed above)
```

For Phase 1, expansion MRR is approximated as zero (no audit of MRR changes yet). Phase 2 uses the `portal_audit_logs` `before`/`after` diff to compute expansion.

### 6.5 Projection algorithm

A simple compound growth model using the last 3 months' average MRR growth rate:

```typescript
interface MonthlyProjection {
  month: string;               // "2026-04"
  projected_mrr_cents: number;
  projected_arr_cents: number;
}

async function computeProjections(
  currentMRR: number,
  monthsAhead: number = 6
): Promise<MonthlyProjection[]> {
  // Compute average monthly growth rate over the last 3 months
  // by querying license starts_at grouped by month
  // Growth rate = (MRR_now / MRR_3_months_ago) ^ (1/3) - 1
  // If insufficient history, default to 0% growth (flat projection).

  const growthRate = await computeAverageMonthlyGrowthRate(3);
  const projections: MonthlyProjection[] = [];
  let mrr = currentMRR;

  for (let i = 1; i <= monthsAhead; i++) {
    mrr = Math.round(mrr * (1 + growthRate));
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    projections.push({
      month: monthKey,
      projected_mrr_cents: mrr,
      projected_arr_cents: mrr * 12,
    });
  }
  return projections;
}
```

---

## 7. File Structure

### New files to create

```
src/
  lib/
    portal/
      types.ts              # All TypeScript interfaces (Section 4.2)
      auth.ts               # Portal admin + client JWT functions
      api-auth.ts           # requirePortalAdmin(), requireClientUser() middleware
      license-key.ts        # generateLicenseKey(), validateLicenseKeyFormat()
      license-jwt.ts        # signLicenseJwt(), verifyLicenseJwt()
      metrics.ts            # computeMRR(), computeChurn(), computeProjections()
      audit.ts              # writeAuditLog() helper
      email.ts              # Portal-specific Resend email templates
      invoice-number.ts     # generateInvoiceNumber() (sequential, e.g. INV-2026-001)

  app/
    portal/
      layout.tsx            # Shared layout (no nav — admin and client have separate layouts)

      admin/
        login/
          page.tsx
        dashboard/
          page.tsx
        organizations/
          page.tsx
          new/
            page.tsx
          [orgId]/
            page.tsx
            edit/
              page.tsx
        licenses/
          page.tsx
          new/
            page.tsx
          [licenseId]/
            page.tsx
            edit/
              page.tsx
        invoices/
          page.tsx
          new/
            page.tsx
          [invoiceId]/
            page.tsx
        audit/
          page.tsx
        settings/
          page.tsx
        layout.tsx           # Admin sidebar + auth check (mirrors src/app/admin/layout.tsx)

      client/
        login/
          page.tsx
        invite/
          [token]/
            page.tsx
        forgot-password/
          page.tsx
        reset-password/
          [token]/
            page.tsx
        licenses/
          page.tsx
          [licenseId]/
            page.tsx
        team/
          page.tsx
        billing/
          page.tsx
          [invoiceId]/
            page.tsx
        settings/
          page.tsx
        layout.tsx           # Client sidebar + auth check

    api/
      portal/
        admin/
          login/
            route.ts
          logout/
            route.ts
          me/
            route.ts
          organizations/
            route.ts
            [orgId]/
              route.ts
              licenses/
                route.ts
          licenses/
            route.ts
            [licenseId]/
              route.ts
              revoke/
                route.ts
              suspend/
                route.ts
              reactivate/
                route.ts
          invoices/
            route.ts
            [invoiceId]/
              route.ts
              mark-paid/
                route.ts
              void/
                route.ts
          metrics/
            route.ts
          audit/
            route.ts

        client/
          login/
            route.ts
          logout/
            route.ts
          me/
            route.ts
          invite/
            [token]/
              route.ts
          forgot-password/
            route.ts
          reset-password/
            route.ts
          licenses/
            route.ts
            [licenseId]/
              route.ts
          team/
            route.ts
            [userId]/
              route.ts
              role/
                route.ts
          billing/
            route.ts
            [invoiceId]/
              route.ts
          settings/
            route.ts

        usage/
          route.ts
        license/
          validate/
            route.ts
```

### What goes where

| Location | Purpose |
|---|---|
| `src/lib/portal/types.ts` | Shared TypeScript interfaces; imported by both API routes and page components |
| `src/lib/portal/auth.ts` | JWT sign/verify for portal admin token and client token |
| `src/lib/portal/api-auth.ts` | `requirePortalAdmin()` and `requireClientUser()` middleware functions that return the session or a `NextResponse` error — same pattern as existing `src/lib/api-auth.ts` |
| `src/lib/portal/license-key.ts` | Key generation and format validation only; no DB access |
| `src/lib/portal/license-jwt.ts` | Signs and verifies the short-lived license JWT issued to downstream products |
| `src/lib/portal/metrics.ts` | Pure computation functions; takes a Prisma client as argument for testability |
| `src/lib/portal/audit.ts` | `writeAuditLog(prisma, entry)` — called in API routes after mutations |
| `src/lib/portal/email.ts` | `sendInviteEmail()`, `sendPasswordResetEmail()`, `sendInvoiceEmail()` using Resend |
| `src/app/portal/admin/*` | Admin-facing pages (client components, thin UI shells) |
| `src/app/portal/client/*` | Client-facing pages |
| `src/app/api/portal/*` | All business logic lives here |

---

## 8. Migration Strategy

### 8.1 Guiding principle

The existing CMS schema is untouched. The portal schema is an additive migration. No existing table is modified, renamed, or dropped.

### 8.2 Step-by-step

**Step 1 — Append portal models to `prisma/schema.prisma`**

Add everything from Section 2. Run `npx prisma validate` to confirm no errors.

**Step 2 — Generate the migration**

```bash
npx prisma migrate dev --name add_portal_tables
```

This creates `prisma/migrations/20260324000001_add_portal_tables/migration.sql` containing only `CREATE TABLE` and `CREATE INDEX` statements for the new `portal_` tables plus the `CREATE TYPE` statements for the new enums. The existing `cms_` tables are not touched.

**Step 3 — Review the generated SQL before applying to production**

Confirm the migration SQL:
- Does not contain any `ALTER TABLE` on existing tables
- Does not contain any `DROP` statements
- Uses `CREATE TYPE IF NOT EXISTS` for all enums (PostgreSQL enums require a type creation step)

**Step 4 — Seed the first portal admin user**

Add to `prisma/seed.ts` (or create `prisma/seed-portal.ts`):

```typescript
import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma';

async function seedPortalAdmin() {
  const email = process.env.PORTAL_ADMIN_EMAIL!;
  const password = process.env.PORTAL_ADMIN_PASSWORD!;
  const hash = await bcrypt.hash(password, 12);

  await prisma.portal_admin_users.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password_hash: hash,
      full_name: 'Ross (Integrius)',
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`Portal admin seeded: ${email}`);
}

seedPortalAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run with:
```bash
PORTAL_ADMIN_EMAIL=admin@example.com PORTAL_ADMIN_PASSWORD=strong-password tsx --env-file .env prisma/seed-portal.ts
```

**Step 5 — Deploy migration to production**

```bash
npx prisma migrate deploy
```

This applies only pending migrations. It is non-destructive.

### 8.3 Rollback plan

Prisma does not support automatic rollback. To roll back the portal migration:

```sql
-- Run manually via psql or the Postgres console
DROP TABLE IF EXISTS portal_audit_logs;
DROP TABLE IF EXISTS portal_usage_events;
DROP TABLE IF EXISTS portal_license_products;
DROP TABLE IF EXISTS portal_invoices;
DROP TABLE IF EXISTS portal_licenses;
DROP TABLE IF EXISTS portal_client_users;
DROP TABLE IF EXISTS portal_organizations;
DROP TABLE IF EXISTS portal_admin_users;
DROP TYPE IF EXISTS "PortalAdminRole";
DROP TYPE IF EXISTS "LicenseTier";
DROP TYPE IF EXISTS "LicenseStatus";
DROP TYPE IF EXISTS "ProductType";
DROP TYPE IF EXISTS "ClientUserRole";
DROP TYPE IF EXISTS "ClientUserStatus";
DROP TYPE IF EXISTS "AuditAction";
DROP TYPE IF EXISTS "InvoiceStatus";
```

Then delete the migration file and remove the portal models from `schema.prisma`. The CMS continues functioning without any changes.

---

## 9. Environment Variables

Append to `.env.example`:

```bash
# ─────────────────────────────────────────────────────────────────────────────
# INTEGRIUS CLIENT PORTAL
# ─────────────────────────────────────────────────────────────────────────────

# Portal admin authentication
# Completely separate from CMS_JWT_SECRET — do not reuse.
PORTAL_ADMIN_JWT_SECRET="generate-a-separate-random-32-char-string"

# Portal client (customer) authentication
PORTAL_CLIENT_JWT_SECRET="generate-another-separate-random-32-char-string"

# License JWT — signed and sent to deployed Integrius products for local validation
# Must be shared (out-of-band) with the Integrius product team for deployment.
PORTAL_LICENSE_JWT_SECRET="generate-yet-another-separate-random-32-char-string"

# Seed credentials for the first portal admin (used by prisma/seed-portal.ts only)
# Remove from production .env after first run.
PORTAL_ADMIN_EMAIL="admin@example.com"
PORTAL_ADMIN_PASSWORD="change-this-before-seeding"

# Portal base URL — used for building invite/reset links in emails
NEXT_PUBLIC_PORTAL_URL="https://integri.us/portal"

# Stripe (Phase 2 — leave blank in Phase 1)
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
# Stripe Price IDs for each tier (create in Stripe dashboard)
STRIPE_PRICE_STARTER_MONTHLY=""
STRIPE_PRICE_PLATFORM_MONTHLY=""
STRIPE_PRICE_ENTERPRISE_MONTHLY=""

# Resend — already present, but document the new sender address
# Portal emails sent from:  portal@notifications.integri.us
# (Register this domain in Resend; same API key works)
```

### Cookie names to add to `src/lib/portal/auth.ts`

```typescript
export const PORTAL_ADMIN_COOKIE = 'portal_admin_token';
export const PORTAL_CLIENT_COOKIE = 'portal_client_token';
export const PORTAL_ADMIN_TTL_HOURS = 8;
export const PORTAL_CLIENT_TTL_HOURS = 24;
```

---

## 10. Third-Party Integrations

### 10.1 Already available (no new packages needed in Phase 1)

| Package | Use in portal |
|---|---|
| `jose` | Sign and verify all three JWT types (admin, client, license) |
| `bcryptjs` | Hash passwords for portal admin and client users |
| `resend` | Send invite emails, password reset emails, invoice delivery |
| `@prisma/client` | All database access |

### 10.2 Phase 2 additions

**Stripe** (`stripe` npm package)

- Create Stripe Customers for each `portal_organizations` record
- Create Stripe Subscriptions mapped to license tiers
- Receive Stripe webhooks at `/api/portal/stripe/webhook` to auto-create `portal_invoices` records on `invoice.paid`, `invoice.payment_failed`, etc.
- Store `stripe_customer_id` on `portal_organizations` and `stripe_subscription_id` on `portal_licenses`
- The client billing page links to the Stripe Customer Portal for self-service payment method updates

Install: `npm install stripe`

**PDF generation** (for invoice downloads)

Recommend `@react-pdf/renderer` for generating invoice PDFs server-side. Invoices are generated on demand at `GET /api/portal/client/billing/[invoiceId]?format=pdf`. No storage needed — generate and stream.

Install: `npm install @react-pdf/renderer`

### 10.3 Recommended but optional

**Sentry** — error monitoring for portal API routes. Add `@sentry/nextjs` and wrap API routes. Especially important for the license validation endpoint which downstream products depend on.

**Upstash Redis** — rate limiting the login and license validate endpoints. Use the `@upstash/ratelimit` package. The license validate endpoint in particular should be rate-limited per IP and per license key to prevent brute-force enumeration.

**PostHog** — usage analytics for the client portal UI. Helps understand which features clients actually use. Client-side only.

---

## 11. Implementation Phases

### Phase 1 — MVP (what to build first)

Target: A working admin portal and client login. No Stripe. Manual billing.

**Deliverables:**

1. **Database** — Prisma schema additions + migration + portal admin seed script
2. **Auth layer** — `src/lib/portal/auth.ts`, `src/lib/portal/api-auth.ts`
3. **Admin auth API** — `POST /api/portal/admin/login`, `POST /api/portal/admin/logout`, `GET /api/portal/admin/me`
4. **Organization CRUD** — `portal_organizations` table + API routes + list/detail/create/edit pages
5. **License management** — `portal_licenses` + `portal_license_products` + API routes + pages. Generate keys using `license-key.ts`. Issue, revoke, suspend, reactivate.
6. **License validation endpoint** — `POST /api/portal/license/validate` — the most critical endpoint. Must be live before any customer deployment.
7. **Usage ingest endpoint** — `POST /api/portal/usage` — validates the license JWT and writes `portal_usage_events`
8. **Client invite flow** — Invite email → accept → set password → login → see licenses
9. **Client license dashboard** — Read-only view of their licenses and latest usage snapshot
10. **Revenue metrics** — `GET /api/portal/admin/metrics` + dashboard page (MRR, ARR, active orgs, simple chart)
11. **Audit log** — `writeAuditLog()` called after every mutation + audit log page for admins
12. **Admin invoice management** — Create, mark paid, void. Manual only.
13. **Client billing history** — Read-only list of their invoices

**Explicitly out of scope for Phase 1:**
- Stripe integration
- PDF invoice generation
- Client password reset (implement invite-only first)
- Portal admin user management (seed manually)
- Expansion MRR tracking
- Rate limiting

**Acceptance criteria for Phase 1:**
- A portal admin can log in, create an organization, issue a license, and copy the key
- A deployed Integrius product can call `/api/portal/license/validate` and receive a signed JWT
- An invited client user can accept their invite, log in, and see their license key
- MRR and ARR are visible on the admin dashboard

### Phase 2 — Full Feature Set

1. **Stripe billing** — Stripe Customer creation on org creation, Subscription mapping to license tier, webhook handler for `invoice.paid` / `invoice.payment_failed`, Stripe Customer Portal link for clients
2. **Client self-service password reset** — `forgot-password` → email → reset token → new password
3. **PDF invoice generation** — `@react-pdf/renderer` on the invoice endpoint
4. **Rate limiting** — Upstash Redis on login and license validate endpoints
5. **Expansion MRR tracking** — Audit log diffing for MRR changes; update `computeChurn()` and `computeNetNewMRR()`
6. **Portal admin user management** — Create, deactivate, change role for portal admin users via `/portal/admin/settings`
7. **Enhanced projections** — Per-tier growth rates, cohort-based retention model
8. **Client team management** — Full invite/remove/role-change flow with audit trail
9. **SSO preparation** — Add `domain` field to organizations and SAML/OIDC callback route stubs
10. **Sentry integration** — Error monitoring on all portal API routes

---

## Appendix A — Auth Middleware Pattern

Follow the exact same pattern as the existing `src/lib/api-auth.ts`:

```typescript
// src/lib/portal/api-auth.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyPortalAdminToken, PORTAL_ADMIN_COOKIE,
         verifyClientToken, PORTAL_CLIENT_COOKIE } from './auth';
import type { PortalAdminSession, ClientSession } from './auth';

export async function requirePortalAdmin(
  req: NextRequest
): Promise<PortalAdminSession | NextResponse> {
  const token = req.cookies.get(PORTAL_ADMIN_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const session = await verifyPortalAdminToken(token);
  if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  return session;
}

export async function requireClientUser(
  req: NextRequest
): Promise<ClientSession | NextResponse> {
  const token = req.cookies.get(PORTAL_CLIENT_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const session = await verifyClientToken(token);
  if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  return session;
}

// Role guard — use after requireClientUser()
export function requireClientRole(
  session: ClientSession,
  minimum: 'MEMBER' | 'ADMIN' | 'OWNER'
): NextResponse | null {
  const hierarchy = { MEMBER: 0, ADMIN: 1, OWNER: 2 };
  if (hierarchy[session.role] < hierarchy[minimum]) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  return null;
}
```

Usage in an API route:

```typescript
// src/app/api/portal/client/team/route.ts
import { requireClientUser, requireClientRole } from '@/lib/portal/api-auth';

export async function POST(req: NextRequest) {
  const session = await requireClientUser(req);
  if (session instanceof NextResponse) return session;

  const denied = requireClientRole(session, 'ADMIN');
  if (denied) return denied;

  // ... invite team member logic
}
```

## Appendix B — Audit Log Helper

```typescript
// src/lib/portal/audit.ts

import type { PrismaClient } from '@prisma/client';
import type { AuditAction } from './types';

interface WriteAuditLogArgs {
  prisma: PrismaClient;
  action: AuditAction;
  actor_type: 'portal_admin' | 'client_user';
  actor_id: string;
  actor_email: string;
  organization_id?: string;
  license_id?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  req?: Request; // For IP/user-agent extraction
}

export async function writeAuditLog({
  prisma,
  action,
  actor_type,
  actor_id,
  actor_email,
  organization_id,
  license_id,
  before,
  after,
  req,
}: WriteAuditLogArgs): Promise<void> {
  const ip_address = req
    ? (req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip'))
    : null;
  const user_agent = req?.headers.get('user-agent') ?? null;

  await prisma.portal_audit_logs.create({
    data: {
      action,
      actor_type,
      actor_id,
      actor_email,
      organization_id: organization_id ?? null,
      license_id: license_id ?? null,
      before: before ?? null,
      after: after ?? null,
      ip_address,
      user_agent,
    },
  });
}
```

## Appendix C — Email Templates (Resend)

```typescript
// src/lib/portal/email.ts

import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Integrius Portal <portal@notifications.integri.us>';
const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL ?? 'https://integri.us/portal';

export async function sendInviteEmail({
  to,
  full_name,
  org_name,
  invite_token,
}: {
  to: string;
  full_name: string;
  org_name: string;
  invite_token: string;
}) {
  const link = `${PORTAL_URL}/client/invite/${invite_token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `You have been invited to the ${org_name} Integrius portal`,
    html: `
      <h2>Welcome to Integrius, ${full_name}</h2>
      <p>You have been invited to manage ${org_name}'s Integrius licenses.</p>
      <p><a href="${link}">Accept your invitation</a></p>
      <p>This link expires in 72 hours.</p>
    `,
  });
}

export async function sendPasswordResetEmail({
  to,
  reset_token,
}: {
  to: string;
  reset_token: string;
}) {
  const link = `${PORTAL_URL}/client/reset-password/${reset_token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your Integrius portal password',
    html: `
      <h2>Password Reset</h2>
      <p><a href="${link}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you did not request a reset, ignore this email.</p>
    `,
  });
}

export async function sendInvoiceEmail({
  to,
  org_name,
  invoice_number,
  amount_formatted,
  due_date,
}: {
  to: string;
  org_name: string;
  invoice_number: string;
  amount_formatted: string;
  due_date: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Invoice ${invoice_number} from Integrius — ${amount_formatted} due ${due_date}`,
    html: `
      <h2>Invoice ${invoice_number}</h2>
      <p>Dear ${org_name},</p>
      <p>Your invoice for <strong>${amount_formatted}</strong> is due on <strong>${due_date}</strong>.</p>
      <p>Log in to your portal to view and pay: <a href="${PORTAL_URL}/client/billing">${PORTAL_URL}/client/billing</a></p>
    `,
  });
}
```
