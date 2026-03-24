# Integrius Client Portal — Product Requirements Document

**Version:** 1.0
**Date:** 2026-03-24
**Status:** Draft — Awaiting Tech Lead Sign-off
**Owner:** Product Management
**Reviewers:** Tech Lead, Security Architect, Lead Dev, Tester, Technical Writer

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Goals and Success Metrics](#2-goals-and-success-metrics)
3. [User Personas](#3-user-personas)
4. [Feature List with Priority](#4-feature-list-with-priority)
5. [User Stories](#5-user-stories)
6. [Screen and Page Inventory](#6-screen-and-page-inventory)
7. [Data Model Requirements](#7-data-model-requirements)
8. [Integration Requirements](#8-integration-requirements)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Out of Scope](#10-out-of-scope)
11. [Acceptance Criteria for P0 Features](#11-acceptance-criteria-for-p0-features)

---

## 1. Executive Summary

Integrius sells four products — Core, Optic, Search, and SDK — under a licensing model. Today, license management is entirely manual: contracts live in spreadsheets, usage is untracked, and clients have no self-service visibility into what they have purchased or how much of it they are consuming. This creates churn risk (clients who feel unsupported leave), revenue leakage (expired licenses go unrenewed), and significant support overhead.

The Integrius Client Portal is a two-sided platform built directly into the existing Next.js 14 website. The **Admin Side** gives the Integrius team a single pane of glass to manage clients, issue and revoke licenses, track commercial health (MRR, ARR, LTV), and flag at-risk accounts. The **Client Side** gives each customer a branded, secure portal where they can view their entitlements, monitor usage, manage their team, access documentation, and download invoices — without filing a support ticket.

The portal reuses the existing PostgreSQL/Prisma infrastructure and mirrors the JWT-based HttpOnly-cookie authentication pattern already established for the CMS admin. All new database tables are prefixed with `portal_` to maintain the existing namespace discipline (CMS tables use `cms_`).

This document is the authoritative specification. It is written to be consumed simultaneously by the Tech Lead, Security Architect, Lead Dev, Tester, and Technical Writer. Where opinions differ, this document prevails until a version bump is issued.

---

## 2. Goals and Success Metrics

### 2.1 Business Goals

| Goal | Rationale |
|---|---|
| Reduce license-renewal churn by 30% within 6 months of launch | Clients who can see their own usage data renew proactively |
| Eliminate manual license tracking spreadsheets within 90 days of launch | Single source of truth reduces admin overhead and error rate |
| Increase seat expansion revenue by 20% within 12 months | Self-service seat management surfaces upgrade prompts at the right moment |
| Reduce support tickets related to "what am I entitled to?" by 50% | Client-facing entitlement view answers this without a human |

### 2.2 Success Metrics (KPIs)

| Metric | Target | Measurement Method |
|---|---|---|
| Client portal login rate (% of licensed clients who log in at least once per month) | >70% within 3 months of launch | Portal session logs |
| License renewal rate | >85% (up from estimated current ~65%) | portal_licenses.renewed_at vs. expires_at |
| Mean time to issue a new license (admin side) | <5 minutes | Timestamp delta: license created vs. admin session start |
| Support ticket volume tagged "license/entitlement" | -50% vs. pre-launch baseline | Helpdesk tagging |
| Seat utilisation rate visible to clients | 100% of active licenses show usage | Automated test suite |
| Client NPS (portal-specific) | >40 within 6 months | In-portal NPS survey (P2 feature) |

### 2.3 Launch Definition

**MVP (P0 complete):** Admin can create clients and issue licenses; clients can log in, see their licenses, and view entitlement limits.

**V1 (P0 + P1 complete):** Full admin financial dashboard, usage tracking, invoice download, team management, support contact.

**V2 (P0 + P1 + P2 complete):** NPS surveys, API webhooks for external enforcement, advanced account health scoring.

---

## 3. User Personas

### 3.1 Integrius Admin (Internal)

**Name:** Alex (Account Operations Lead)
**Context:** Works at Integrius. Responsible for onboarding new clients, issuing licenses, monitoring renewal risk, and escalating commercial issues to sales. Not a developer.
**Technical proficiency:** Moderate. Comfortable with SaaS dashboards; not comfortable with SQL or CLI tools.
**Frustrations today:**
- Maintains a Google Sheet with license expiry dates; dates are often wrong.
- Has no visibility into whether a client is actively using their license.
- Discovers churned clients only when invoices go unpaid.

**Goals in the portal:**
- Create a new client record and issue a license in under 5 minutes.
- See at a glance which accounts are at renewal risk this month.
- Annotate accounts with health notes without asking engineering to add a field.

**Success looks like:** Alex opens the portal on Monday morning and can see a "Renewals this month" panel and an "At-risk accounts" list without opening a spreadsheet.

---

### 3.2 Client Admin (External — Primary External Persona)

**Name:** Priya (Head of Data Engineering at a client company)
**Context:** The primary point of contact at a client organisation. Signed the contract with Integrius. Responsible for the technical implementation and internal billing questions.
**Technical proficiency:** High. Developer-adjacent. Understands API calls, seats, rate limits.
**Frustrations today:**
- Emails Integrius support to find out their API call limit.
- Cannot see how many seats her team has consumed.
- Receives PDF invoices by email with no context.

**Goals in the portal:**
- Log in and immediately know what they are paying for and how much headroom they have.
- Add or remove team members without emailing Integrius.
- Download a clean invoice for the finance team.

**Success looks like:** Priya can answer "how many API calls do we have left this month?" in 30 seconds without contacting support.

---

### 3.3 Client Team Member (External — Secondary External Persona)

**Name:** Sam (Data Engineer at a client company)
**Context:** A seat holder on the client's license. Priya added Sam to the portal. Sam does not manage billing.
**Technical proficiency:** High. Primarily interested in documentation and product access.
**Frustrations today:**
- Does not know where the official Integrius documentation lives.
- Cannot confirm whether a feature is available on their license tier.

**Goals in the portal:**
- Check which products and features are enabled on their company's license.
- Access documentation links without asking Priya.

**Success looks like:** Sam logs in, sees the products the company has licensed, and navigates directly to documentation for Integrius Core — in under 60 seconds.

---

## 4. Feature List with Priority

Priority definitions:
- **P0 — Must have for launch.** Portal does not launch without these.
- **P1 — Required for V1.** Delivered within 4 weeks of P0 launch.
- **P2 — Nice to have.** Delivered when capacity allows; no fixed date.

### 4.1 Admin Side Features

| ID | Feature | Priority | Notes |
|---|---|---|---|
| A-01 | Create, read, update, deactivate client organisations | P0 | Deactivate, not hard-delete; audit trail required |
| A-02 | Issue a product license to a client (product, tier, limits, expiry) | P0 | One license per product per client |
| A-03 | Revoke / suspend a license | P0 | Revocation must propagate to enforcement within 60 seconds |
| A-04 | Set license tier limits: seats, API calls/month, data sources, products | P0 | Per-product limit configuration |
| A-05 | View all licenses for a client (active, expired, revoked) | P0 | |
| A-06 | Admin login / logout with HttpOnly JWT cookie | P0 | Reuse existing cms_admin_users table and auth pattern |
| A-07 | Per-client MRR and ARR display | P1 | Manually entered; not connected to billing system in V1 |
| A-08 | Per-client LTV and churn risk score (manual input) | P1 | Churn score: 1–10 scale, set by admin |
| A-09 | Renewal date tracker with "renewals this month" dashboard panel | P1 | Alerts when license expires within 30 days |
| A-10 | Client notes (free-text, timestamped, admin-only) | P1 | Append-only audit log style |
| A-11 | Account health score (composite: usage % + churn score + days to renewal) | P1 | Computed field, displayed as RAG (Red/Amber/Green) |
| A-12 | View per-client usage metrics (API calls, seats, data sources consumed) | P1 | Read from portal_usage_events table |
| A-13 | Upload and attach invoices to a client (PDF) | P1 | Stored in /public/portal-invoices/ or external storage |
| A-14 | Search and filter client list | P1 | Filter by: product, tier, renewal month, health status |
| A-15 | Bulk license expiry report (CSV export) | P2 | |
| A-16 | Webhook configuration per client for license status pushes | P2 | See Integration Requirements |
| A-17 | Admin audit log (who issued/revoked what and when) | P2 | |
| A-18 | Email notification to client when license is 30 days from expiry | P2 | Via Resend (already in package.json) |

### 4.2 Client Side Features

| ID | Feature | Priority | Notes |
|---|---|---|---|
| C-01 | Client login with email + password (HttpOnly JWT, separate cookie from admin) | P0 | |
| C-02 | Client logout | P0 | |
| C-03 | Dashboard: view all active licenses with product name and tier | P0 | |
| C-04 | View entitlement details per license: seat limit, API call limit, data source limit, expiry date | P0 | |
| C-05 | View current usage vs. limits (seats used, API calls used this month, data sources connected) | P1 | Requires usage ingestion pipeline |
| C-06 | Team management: invite team member by email (consumes a seat) | P1 | Email sent via Resend |
| C-07 | Team management: remove a team member (frees a seat) | P1 | |
| C-08 | View and download invoices (PDF) | P1 | Invoices uploaded by admin (A-13) |
| C-09 | View product documentation links per licensed product | P1 | Links configured per product in admin; not a full docs host |
| C-10 | Contact support form (submits to existing /api/contact endpoint or new portal-specific endpoint) | P1 | Pre-fills client name and license ID |
| C-11 | Change own password | P1 | Current password required for confirmation |
| C-12 | View license history (expired and revoked licenses) | P2 | |
| C-13 | In-portal NPS survey (shown once per quarter) | P2 | |
| C-14 | API key display for SDK/API-based products (read-only, masked) | P2 | If Integrius issues API keys tied to licenses |

---

## 5. User Stories

### Integrius Admin Stories

**US-01**
As an Integrius Admin, I want to create a new client organisation record with a company name, primary contact email, and billing contact, so that I have a single place to manage everything related to that account.

**US-02**
As an Integrius Admin, I want to issue a license for a specific Integrius product to a client, specifying the tier, seat limit, API call limit, data source limit, and expiry date, so that the client has formal, tracked access to the product.

**US-03**
As an Integrius Admin, I want to revoke a client's license immediately, so that access is terminated the moment a contract lapses or is breached.

**US-04**
As an Integrius Admin, I want to see a list of all licenses expiring within the next 30 days, so that I can proactively reach out to clients before they churn.

**US-05**
As an Integrius Admin, I want to view a client's monthly recurring revenue (MRR) and annual recurring revenue (ARR) on their account page, so that I can quickly communicate commercial value during account reviews.

**US-06**
As an Integrius Admin, I want to assign a churn risk score (1–10) to a client account and write free-text notes, so that the broader team has context when I am unavailable.

**US-07**
As an Integrius Admin, I want to see an account health indicator (Red/Amber/Green) for every client in the client list, so that I can triage at-risk accounts in one glance without opening each record.

**US-08**
As an Integrius Admin, I want to search and filter the client list by product, tier, and renewal month, so that I can prepare for targeted outreach campaigns efficiently.

**US-09**
As an Integrius Admin, I want to upload a PDF invoice and attach it to a client record, so that the client can download it from their portal without emailing me.

**US-10**
As an Integrius Admin, I want to view the usage metrics (API calls consumed this month, seats active, data sources connected) for any client, so that I can identify clients who are approaching their limits and upsell proactively.

**US-11**
As an Integrius Admin, I want to set a client's initial login credentials (email + temporary password), so that the client can access their portal on day one without a manual handoff.

**US-12**
As an Integrius Admin, I want to deactivate a client organisation (not delete it), so that all historical data is preserved for audit purposes while the client loses access.

### Client Admin Stories

**US-13**
As a Client Admin, I want to log in to my company's portal with an email address and password, so that I can securely access my organisation's license and usage information.

**US-14**
As a Client Admin, I want to see all of my organisation's active licenses on a single dashboard, including the product name, tier, and expiry date, so that I understand exactly what I have purchased at a glance.

**US-15**
As a Client Admin, I want to see how many API calls my organisation has consumed this month versus our monthly limit, so that I can plan usage and avoid hitting our cap unexpectedly.

**US-16**
As a Client Admin, I want to invite a new team member by email and have them consume one of our licensed seats, so that I can onboard colleagues without contacting Integrius support.

**US-17**
As a Client Admin, I want to remove a team member from the portal, so that I can free up the seat for someone else and ensure departed employees lose access.

**US-18**
As a Client Admin, I want to download any of my organisation's invoices as a PDF, so that I can submit them to my finance team without chasing Integrius.

**US-19**
As a Client Admin, I want to submit a support request directly from the portal with my license ID pre-filled, so that Integrius support can identify my account immediately without back-and-forth.

**US-20**
As a Client Admin, I want to change my portal password, so that I can rotate credentials when required by my company's security policy.

### Client Team Member Stories

**US-21**
As a Client Team Member, I want to see which Integrius products my organisation has licensed and what tier we are on, so that I know which features are available to me without asking my admin.

**US-22**
As a Client Team Member, I want to access curated documentation links for each licensed product directly from the portal, so that I can find official guidance quickly without searching the public web.

**US-23**
As a Client Team Member, I want to log out of the portal securely, so that I can safely use a shared or public machine without leaving my session open.

---

## 6. Screen and Page Inventory

All client portal routes live under `/portal/*`. All admin portal extensions live under `/admin/*` (extending the existing admin section). Route segments marked `[id]` accept a UUID.

### 6.1 Public / Unauthenticated Routes

| URL | Page Name | Description |
|---|---|---|
| `/portal/login` | Client Login | Email + password form. Redirects to `/portal/dashboard` on success. Error states for invalid credentials and deactivated accounts. |
| `/portal/forgot-password` | Forgot Password | Email input. Sends a one-time reset link valid for 1 hour. (P1) |
| `/portal/reset-password` | Reset Password | Token-validated form to set a new password. (P1) |

### 6.2 Client Portal — Authenticated Routes

All routes under `/portal/*` (except login) require a valid `portal_client_token` HttpOnly cookie. Unauthenticated requests redirect to `/portal/login`.

| URL | Page Name | Description |
|---|---|---|
| `/portal/dashboard` | Client Dashboard | Summary cards: active licenses, total seats used/available, API calls this month, next renewal date. Quick-links to each product's docs. |
| `/portal/licenses` | Licenses List | Table of all licenses (active, expired, revoked). Columns: Product, Tier, Seats Used/Total, API Calls Used/Limit, Data Sources Used/Limit, Expiry, Status. |
| `/portal/licenses/[id]` | License Detail | Full entitlement breakdown for one license. Usage progress bars. Link to product docs. |
| `/portal/team` | Team Management | Table of all seat holders (name, email, role, date added). Actions: Invite, Remove. Seat counter badge. |
| `/portal/invoices` | Invoice History | Table of invoices (date, description, amount, status). Download button per row (PDF). |
| `/portal/support` | Contact Support | Pre-filled form (client name, company, license ID auto-populated). Description field. Submits to support endpoint. |
| `/portal/settings` | Account Settings | Change password. View own profile (name, email). Read-only: company name, primary contact. |

### 6.3 Admin Portal — New Routes (extending `/admin/*`)

All routes under `/admin/*` require a valid `cms_admin_token` HttpOnly cookie (existing auth). Integrius Admin users authenticate via the existing `/admin/login` page.

| URL | Page Name | Description |
|---|---|---|
| `/admin/portal` | Portal Overview | Summary stats: total clients, active licenses, licenses expiring in 30 days, accounts flagged Red health. |
| `/admin/portal/clients` | Client List | Searchable, filterable table. Columns: Company, Primary Contact, Active Licenses, MRR, ARR, Health (RAG), Next Renewal. |
| `/admin/portal/clients/new` | New Client Form | Create a client organisation. Fields: company name, primary contact name + email, billing contact email, notes. Auto-sends welcome/credential email if client users are created. |
| `/admin/portal/clients/[id]` | Client Detail | Full account view. Tabs: Overview (MRR/ARR/LTV/churn score/health), Licenses, Usage, Notes, Invoices, Team. |
| `/admin/portal/clients/[id]/edit` | Edit Client | Edit client organisation fields. Cannot hard-delete; only deactivate. |
| `/admin/portal/clients/[id]/licenses/new` | Issue License | Form to issue a new product license to the client. Fields: product (select), tier (select), seat limit, API call limit/month, data source limit, start date, expiry date, notes. |
| `/admin/portal/clients/[id]/licenses/[lid]` | License Detail (Admin) | Full license detail. Actions: Revoke, Suspend, Edit limits. Displays real-time usage. |
| `/admin/portal/clients/[id]/invoices/upload` | Upload Invoice | Upload a PDF and attach to client record. Fields: invoice date, description, amount, currency, status (paid/unpaid). |
| `/admin/portal/clients/[id]/notes/new` | Add Note | Free-text note attached to client. Timestamped. Author auto-populated from admin session. |
| `/admin/portal/users` | Portal User Management | List of all client-side portal user accounts. Actions: reset password, deactivate, view associated client. |

---

## 7. Data Model Requirements

All new tables are prefixed with `portal_` and added to the existing Prisma schema (`prisma/schema.prisma`). No CMS tables are modified.

### 7.1 Entity Relationship Overview

```
portal_clients
  └── portal_licenses (one client : many licenses, one per product)
  └── portal_client_users (one client : many users / seats)
  └── portal_invoices (one client : many invoices)
  └── portal_client_notes (one client : many notes)

portal_licenses
  └── portal_usage_events (one license : many usage events)

portal_password_reset_tokens (one portal_client_user : many tokens, only one active)
```

### 7.2 Table Specifications

---

#### `portal_clients`

Represents a client organisation (a company that has purchased an Integrius product).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK, default `gen_random_uuid()` | |
| `company_name` | `VARCHAR(255)` | NOT NULL | |
| `slug` | `VARCHAR(255)` | NOT NULL, UNIQUE | URL-safe identifier derived from company name |
| `primary_contact_name` | `VARCHAR(255)` | NOT NULL | |
| `primary_contact_email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Used for portal login account creation |
| `billing_contact_email` | `VARCHAR(255)` | NULLABLE | May differ from primary contact |
| `status` | `VARCHAR(50)` | NOT NULL, DEFAULT `'active'` | `'active'` \| `'deactivated'` |
| `mrr_cents` | `INTEGER` | NULLABLE | Monthly recurring revenue in cents (USD) |
| `arr_cents` | `INTEGER` | NULLABLE | Annual recurring revenue in cents (USD). Computed or manually set. |
| `ltv_cents` | `INTEGER` | NULLABLE | Lifetime value in cents. Manually set by admin. |
| `churn_risk_score` | `SMALLINT` | NULLABLE, CHECK 1–10 | 1 = lowest risk, 10 = churning |
| `account_health` | `VARCHAR(10)` | NOT NULL, DEFAULT `'green'` | `'green'` \| `'amber'` \| `'red'`. Computed or manually overridden. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | Updated on any write |
| `deactivated_at` | `TIMESTAMPTZ` | NULLABLE | Set when status changes to `'deactivated'` |

Indexes: `slug`, `status`, `churn_risk_score`, `account_health`.

---

#### `portal_client_users`

Represents a human user with portal login credentials. One record per person. A user belongs to exactly one client.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `client_id` | `UUID` | FK → `portal_clients.id`, NOT NULL | |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Login identifier |
| `password_hash` | `VARCHAR(255)` | NOT NULL | bcrypt, rounds ≥ 12 |
| `full_name` | `VARCHAR(255)` | NOT NULL | |
| `role` | `VARCHAR(50)` | NOT NULL, DEFAULT `'member'` | `'admin'` \| `'member'`. Client Admins have role `'admin'`. |
| `status` | `VARCHAR(50)` | NOT NULL, DEFAULT `'active'` | `'active'` \| `'deactivated'` \| `'invited'` |
| `last_login_at` | `TIMESTAMPTZ` | NULLABLE | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | |
| `invited_by_user_id` | `UUID` | FK → `portal_client_users.id`, NULLABLE | Who sent the invite |
| `invited_at` | `TIMESTAMPTZ` | NULLABLE | |

Indexes: `client_id`, `email`, `status`.

**Seat counting rule:** A seat is consumed by any `portal_client_users` record where `status = 'active'` or `status = 'invited'` AND `client_id` matches the license's `client_id`. Deactivated users do not consume seats.

---

#### `portal_licenses`

Represents a single product license issued to a client. One license per product per client (enforced at application layer; no DB unique constraint because a client may have an expired license and a new active one for the same product simultaneously — the active one is the one with the latest `starts_at` and `status = 'active'`).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `client_id` | `UUID` | FK → `portal_clients.id`, NOT NULL | |
| `product_key` | `VARCHAR(50)` | NOT NULL | `'core'` \| `'optic'` \| `'search'` \| `'sdk'` |
| `tier` | `VARCHAR(50)` | NOT NULL | `'starter'` \| `'professional'` \| `'enterprise'` \| `'platform'` |
| `status` | `VARCHAR(50)` | NOT NULL, DEFAULT `'active'` | `'active'` \| `'suspended'` \| `'revoked'` \| `'expired'` |
| `seat_limit` | `INTEGER` | NOT NULL | Maximum concurrent seats (active + invited users) |
| `api_calls_per_month` | `INTEGER` | NULLABLE | NULL means unlimited |
| `data_source_limit` | `INTEGER` | NULLABLE | NULL means unlimited |
| `starts_at` | `TIMESTAMPTZ` | NOT NULL | License start date |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | License expiry date |
| `renewed_at` | `TIMESTAMPTZ` | NULLABLE | Set when a renewal is processed |
| `revoked_at` | `TIMESTAMPTZ` | NULLABLE | Set when status changes to `'revoked'` |
| `revoked_by_admin_id` | `UUID` | FK → `cms_admin_users.id`, NULLABLE | |
| `issued_by_admin_id` | `UUID` | FK → `cms_admin_users.id`, NOT NULL | |
| `docs_url` | `VARCHAR(500)` | NULLABLE | Override docs link for this license; falls back to product default |
| `notes` | `TEXT` | NULLABLE | Internal admin notes on the license |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | |

Indexes: `client_id`, `product_key`, `status`, `expires_at`.

**Status transition rules (enforced in application layer):**
- `active` → `suspended` (reversible by admin)
- `active` → `revoked` (irreversible)
- `active` → `expired` (set by background job when `expires_at` passes)
- `suspended` → `active`
- `suspended` → `revoked`
- `expired` → (no transitions; create a new license to renew)

---

#### `portal_usage_events`

Append-only event log for usage tracking. Each row represents a discrete usage event reported by a product integration. This table is the source of truth for usage aggregations shown in both admin and client views.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `license_id` | `UUID` | FK → `portal_licenses.id`, NOT NULL | |
| `event_type` | `VARCHAR(50)` | NOT NULL | `'api_call'` \| `'seat_activated'` \| `'seat_deactivated'` \| `'data_source_connected'` \| `'data_source_disconnected'` |
| `quantity` | `INTEGER` | NOT NULL, DEFAULT `1` | For `api_call`, may be >1 if batched |
| `occurred_at` | `TIMESTAMPTZ` | NOT NULL | When the event happened |
| `source` | `VARCHAR(100)` | NULLABLE | Originating service identifier (e.g., `'integrius-core-v2'`) |
| `metadata` | `JSONB` | NULLABLE | Arbitrary additional context (e.g., endpoint called, user agent) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | When the event was recorded |

Indexes: `license_id`, `event_type`, `occurred_at`.

**Aggregation:** API call totals are computed as `SUM(quantity) WHERE event_type = 'api_call' AND occurred_at >= start_of_current_month AND license_id = ?`. These queries must execute in <200ms; add partial indexes on `(license_id, occurred_at)` for the current month window.

---

#### `portal_invoices`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `client_id` | `UUID` | FK → `portal_clients.id`, NOT NULL | |
| `invoice_date` | `DATE` | NOT NULL | |
| `description` | `VARCHAR(500)` | NOT NULL | e.g., "Integrius Core — Professional — Q1 2026" |
| `amount_cents` | `INTEGER` | NOT NULL | Amount in cents |
| `currency` | `VARCHAR(3)` | NOT NULL, DEFAULT `'USD'` | ISO 4217 |
| `status` | `VARCHAR(50)` | NOT NULL, DEFAULT `'unpaid'` | `'paid'` \| `'unpaid'` \| `'void'` |
| `file_path` | `VARCHAR(1000)` | NULLABLE | Server path or CDN URL to the PDF file |
| `uploaded_by_admin_id` | `UUID` | FK → `cms_admin_users.id`, NOT NULL | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | |

Indexes: `client_id`, `invoice_date`, `status`.

---

#### `portal_client_notes`

Append-only internal notes attached to a client. Notes cannot be edited or deleted — they can only be added. This preserves account history integrity.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `client_id` | `UUID` | FK → `portal_clients.id`, NOT NULL | |
| `admin_id` | `UUID` | FK → `cms_admin_users.id`, NOT NULL | Author of the note |
| `body` | `TEXT` | NOT NULL | Free-text content |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | |

Index: `client_id`, `created_at DESC`.

---

#### `portal_password_reset_tokens`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `user_id` | `UUID` | FK → `portal_client_users.id`, NOT NULL | |
| `token_hash` | `VARCHAR(255)` | NOT NULL | SHA-256 of the raw token sent to the user |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | 1 hour from creation |
| `used_at` | `TIMESTAMPTZ` | NULLABLE | Set when token is consumed |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | |

Index: `token_hash` (for lookup), `user_id`.

**Security rule:** Only one active (unused, non-expired) reset token per user. Creating a new one invalidates all previous tokens for that user (set `used_at = now()` on prior records).

---

#### `portal_product_docs`

Configuration table mapping product keys to documentation URLs. Managed by admin. Allows per-license doc URL override via `portal_licenses.docs_url`.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `product_key` | `VARCHAR(50)` | NOT NULL, UNIQUE | Matches `portal_licenses.product_key` |
| `product_display_name` | `VARCHAR(100)` | NOT NULL | e.g., "Integrius Core" |
| `docs_url` | `VARCHAR(500)` | NOT NULL | Default documentation URL |
| `changelog_url` | `VARCHAR(500)` | NULLABLE | |
| `status_page_url` | `VARCHAR(500)` | NULLABLE | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` | |

Pre-populated via migration seed for: `core`, `optic`, `search`, `sdk`.

---

### 7.3 Auth Session Design

Two separate JWT cookie namespaces are used:

| Cookie | Persona | Secret Env Var | TTL | Scope |
|---|---|---|---|---|
| `cms_admin_token` | Integrius Admin | `CMS_JWT_SECRET` (existing) | 12 hours | `/admin/*` routes (existing behaviour, unchanged) |
| `portal_client_token` | Client Admin, Client Team Member | `PORTAL_JWT_SECRET` (new) | 8 hours | `/portal/*` routes |

The `portal_client_token` JWT payload:

```typescript
interface ClientSession {
  userId: string;       // portal_client_users.id
  clientId: string;     // portal_clients.id
  email: string;
  role: 'admin' | 'member';
}
```

Session sliding: On any authenticated `/portal/*` request, if the token has less than 2 hours remaining, issue a fresh token and set a new cookie. This prevents users being logged out mid-session.

---

## 8. Integration Requirements

### 8.1 License Enforcement Strategy

The portal is the **source of truth** for license status and limits. Integrius products (Core, Optic, Search, SDK) must query the portal to enforce entitlements. Two enforcement mechanisms are required.

**Mechanism 1: Polling API (P0)**

A machine-readable REST endpoint that Integrius products can poll on a configurable schedule (recommended: every 5 minutes):

```
GET /api/portal/licenses/verify
Headers: X-License-Key: <license_key>
         X-Product: <product_key>

Response 200:
{
  "valid": true,
  "status": "active",
  "tier": "professional",
  "limits": {
    "seats": 25,
    "api_calls_per_month": 100000,
    "data_sources": 50
  },
  "expires_at": "2027-01-01T00:00:00Z"
}

Response 403:
{
  "valid": false,
  "status": "revoked",
  "message": "License revoked. Contact support@integrius.io"
}
```

Each `portal_licenses` record must have a `license_key` field (a random 32-byte hex string, generated on issue, displayed once to the admin, and stored as a SHA-256 hash in the database). The polling endpoint compares the hash.

Add `license_key_hash` (`VARCHAR(64)`, NOT NULL, UNIQUE) to `portal_licenses`.

**Mechanism 2: Webhook Push on Status Change (P2)**

When a license status changes (issued, revoked, suspended, expired), the portal pushes a signed webhook payload to a configurable endpoint on the client's infrastructure. Webhook signature uses HMAC-SHA256 with a per-client secret stored in `portal_clients.webhook_secret_hash`.

```json
{
  "event": "license.revoked",
  "license_id": "...",
  "product_key": "core",
  "client_id": "...",
  "timestamp": "2026-03-24T10:00:00Z"
}
```

Retries: 3 attempts with exponential backoff (1s, 5s, 25s). Log failures to a `portal_webhook_delivery_log` table (P2).

### 8.2 Usage Event Ingestion

Integrius products report usage events to a write-only ingest endpoint:

```
POST /api/portal/usage/ingest
Headers: X-License-Key: <license_key>
         Content-Type: application/json

Body:
{
  "event_type": "api_call",
  "quantity": 1,
  "occurred_at": "2026-03-24T09:58:12Z",
  "source": "integrius-core-v2",
  "metadata": { "endpoint": "/v1/sync", "duration_ms": 142 }
}
```

This endpoint:
- Validates the license key (same hash lookup as the verify endpoint).
- Rejects events if license `status != 'active'`.
- Appends a row to `portal_usage_events`.
- Returns 202 Accepted immediately (non-blocking write).
- Rate limit: 1,000 ingest requests per minute per license key. Return 429 if exceeded.

### 8.3 Email Integration (Resend)

`resend` is already a dependency. Use it for:

| Trigger | Recipient | Template |
|---|---|---|
| New client user created by admin | Client user | Welcome email with temporary password and portal login link |
| Team member invited by Client Admin | Invitee | Invite email with one-time setup link |
| Password reset requested | Requesting user | Reset link (1-hour expiry) |
| License expiring in 30 days | Client primary contact + billing contact | Renewal reminder |
| License revoked | Client primary contact | Revocation notice |

All email templates must be plain HTML (no external template service). Template files live at `src/lib/portal/email-templates/`.

### 8.4 File Storage for Invoices (P1)

For MVP (P1), invoice PDFs are stored on the local filesystem at `/public/portal-invoices/[client_id]/[invoice_id].pdf`. Files are served at `/portal-invoices/[client_id]/[invoice_id].pdf` — this path requires auth middleware to gate access (only the owning client can download; admins can always download). Do not serve invoice files from `public/` without the auth gate; consider `/api/portal/invoices/[id]/download` as a proxied download endpoint instead.

For V2, migrate to an object store (S3-compatible or Cloudflare R2). The download endpoint abstracts the storage layer so the migration does not affect the client-facing URL.

---

## 9. Non-Functional Requirements

### 9.1 Performance

| Metric | Requirement |
|---|---|
| Client dashboard page load (server-side rendered) | p95 < 800ms |
| License verify API response time | p99 < 200ms. This is in the hot path of product enforcement. |
| Usage ingest endpoint response time | p99 < 100ms (non-blocking write). Returns 202 before DB write completes if necessary. |
| Admin client list (up to 1,000 clients) | p95 < 1,000ms |
| Usage aggregation query (current month API calls per license) | p99 < 200ms. Requires compound index on `(license_id, occurred_at)`. |

### 9.2 Scalability

- The `portal_usage_events` table will grow rapidly. Design for 100 million rows within 18 months. Implement table partitioning by month on `occurred_at` before launch.
- The license verify endpoint must handle bursts of 500 RPS without degradation. It is a read-only query against a single indexed column (`license_key_hash`). No caching layer is required at P0, but design the endpoint to be idempotent and stateless so a Redis cache can be inserted transparently later.
- All portal database queries must complete within a single Prisma transaction where writes are involved. No multi-step writes without transactions.

### 9.3 Security

- **Authentication:** All `/portal/*` and `/admin/portal/*` routes return HTTP 401 (API routes) or HTTP 302 to login (page routes) if no valid session cookie is present. Middleware enforces this at the Next.js middleware layer (`middleware.ts`), not at the page component level.
- **Authorisation:** A `portal_client_users` record with `role = 'member'` must not be able to access team management (invite/remove), invoices, or support form pre-populated with full account data. Only `role = 'admin'` can perform those actions. Enforce at the API route level, not just the UI level.
- **Cross-client data isolation:** Every database query for client-side portal routes must include `WHERE client_id = session.clientId`. The Tech Lead must add a lint rule or code review checklist item to enforce this. A client must never be able to access another client's data by manipulating URL parameters.
- **License key security:** The raw license key is shown exactly once to the issuing admin at license creation time. After that, only the SHA-256 hash is stored. There is no "reveal key" endpoint.
- **Password hashing:** bcrypt with a minimum cost factor of 12. Use the `bcryptjs` package (already a dependency).
- **CSRF:** Because HttpOnly cookies are used, all state-changing API routes must validate the `Origin` header against an allowlist of expected origins. Alternatively, require a `X-Requested-With: XMLHttpRequest` header on all API routes (belt-and-suspenders alongside SameSite=Lax).
- **Rate limiting on auth endpoints:** `/portal/api/login` and `/portal/api/forgot-password` are rate limited to 10 requests per IP per minute. Return 429 with `Retry-After` header. Use an in-memory store for P0; migrate to Redis for V2.
- **Session invalidation on password change:** Changing a password must invalidate all active sessions for that user. Implement by storing a `session_version` integer in `portal_client_users`; include it in the JWT payload. Increment on password change. The session middleware rejects tokens with a stale `session_version`.
- **Invite link expiry:** Team member invite links expire after 72 hours. Implemented via a `portal_invitations` table (separate from `portal_password_reset_tokens`).
- **HTTPS only:** All portal routes must set `Strict-Transport-Security: max-age=31536000; includeSubDomains` in production. Enforce at Netlify edge (already deployed on Netlify per `netlify.toml`).
- **Audit:** Every license issuance, revocation, suspension, and client deactivation must write a row to `portal_audit_log` with: `actor_type` (`'admin'` | `'system'`), `actor_id`, `action`, `target_type`, `target_id`, `metadata` (JSONB), `created_at`. This table is append-only and never modified after insert.

### 9.4 Availability and Reliability

- The portal (client-facing) targets 99.9% monthly uptime (same SLA as the marketing website on Netlify).
- The license verify API (`/api/portal/licenses/verify`) targets 99.95% uptime. This endpoint is in the enforcement hot path. A database outage must return the last cached valid response (grace mode: serve a 200 with a `"cached": true` flag for up to 15 minutes after DB becomes unreachable). Grace mode must be a documented, intentional decision approved by the Security Architect before implementation.
- The usage ingest endpoint (`/api/portal/usage/ingest`) is allowed to drop events during a DB outage. Log dropped events to STDERR with sufficient context for replay. No user-facing impact.

### 9.5 Accessibility

All client-facing portal pages must meet WCAG 2.1 AA. Specific requirements:
- All form inputs have associated `<label>` elements.
- Error messages are associated with their input via `aria-describedby`.
- Focus order is logical on all forms.
- Colour is not the sole indicator of status (RAG health badges must include text: "Healthy", "At Risk", "Critical").
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text.

### 9.6 Browser Support

Match the existing marketing website support matrix: latest 2 versions of Chrome, Firefox, Safari, Edge. No IE11. No React Native or mobile app in scope (see Out of Scope).

---

## 10. Out of Scope

The following are explicitly not included in V1 or V2 of this portal. Raising a ticket for any of these requires a PRD amendment.

| Item | Rationale |
|---|---|
| Direct billing / payment processing (Stripe, etc.) | Integrius invoices manually; no self-serve checkout in scope |
| Automated license renewal / subscription management | Manual renewal workflow only; admin issues new license on renewal |
| Native mobile app (iOS / Android) | Portal is mobile-responsive web only |
| Multi-currency invoicing (beyond display) | All amounts stored in USD cents; display-only conversion is out of scope |
| SSO / SAML / OAuth (Google, Microsoft) for client login | Future consideration; not in V1 |
| In-portal product usage (i.e., actually running Integrius Core from within the portal) | The portal is a management plane, not a product plane |
| Public-facing API for clients to query their own license programmatically | The verify endpoint is for Integrius products only; a client-facing API is a future feature |
| Automated account health score (ML-based) | Health score is manually set by admin in V1; ML model is future work |
| Multi-tenant sub-organisations (e.g., a client with multiple departments each with separate licenses) | One organisation per `portal_clients` record; sub-org hierarchy is not modelled |
| In-portal documentation hosting | The portal links to documentation; it does not host it |
| Real-time WebSocket usage dashboards | Polling-based page refresh only; WebSocket upgrade is V3 |
| Automated dunning / overdue invoice chasing | Admin handles renewals manually |
| Custom branding per client (white-label) | Portal uses Integrius branding only |

---

## 11. Acceptance Criteria for P0 Features

Acceptance criteria are written in Given/When/Then format. All P0 ACs must pass before the feature is considered complete for launch.

---

### A-01: Create, Read, Update, Deactivate Client Organisations

**AC-A01-1 (Create)**
- Given: An authenticated Integrius Admin is on `/admin/portal/clients/new`
- When: They submit the form with a valid company name, primary contact name, primary contact email, and at least one character in the company name field
- Then: A `portal_clients` record is created with `status = 'active'`, the admin is redirected to `/admin/portal/clients/[new-id]`, and the new client appears in the client list at `/admin/portal/clients`

**AC-A01-2 (Duplicate email rejected)**
- Given: A `portal_clients` record already exists with `primary_contact_email = 'existing@client.com'`
- When: An admin submits the new client form with the same email
- Then: The form returns a 400 error with the message "A client with this primary contact email already exists" and no new record is created

**AC-A01-3 (Deactivate)**
- Given: An authenticated Integrius Admin is on the detail page of an active client
- When: They click "Deactivate Client" and confirm the action
- Then: The `portal_clients.status` is set to `'deactivated'`, `portal_clients.deactivated_at` is set to the current timestamp, all `portal_client_users` for that client are set to `status = 'deactivated'`, and the client can no longer log in

**AC-A01-4 (No hard delete)**
- Given: Any authenticated Integrius Admin
- When: They attempt a DELETE request to `/api/admin/portal/clients/[id]`
- Then: The API returns 405 Method Not Allowed. The database record is not deleted.

---

### A-02: Issue a Product License

**AC-A02-1 (Successful issuance)**
- Given: An authenticated Integrius Admin is on `/admin/portal/clients/[id]/licenses/new`
- When: They select a product, a tier, enter valid seat/API/data source limits, a start date, and an expiry date at least 1 day in the future, and submit
- Then: A `portal_licenses` record is created with `status = 'active'`, a unique `license_key_hash` is stored, the raw license key is displayed once in a modal ("Copy this key — it will not be shown again"), and an entry is written to `portal_audit_log`

**AC-A02-2 (Expiry date validation)**
- Given: An authenticated admin is on the issue license form
- When: They set the expiry date to a date in the past or equal to the start date
- Then: The form returns a validation error "Expiry date must be after the start date" and no record is created

**AC-A02-3 (License key shown once)**
- Given: A license has just been issued and the raw key was displayed in the post-creation modal
- When: The admin navigates away and returns to the license detail page
- Then: The license key is not displayed. Only a masked representation (e.g., `••••••••••••••••3f9a`) and a "Regenerate key" action are shown.

---

### A-03: Revoke a License

**AC-A03-1 (Revocation)**
- Given: An authenticated Integrius Admin is on the detail page of an active license
- When: They click "Revoke License" and confirm the action in the confirmation dialog
- Then: `portal_licenses.status` is set to `'revoked'`, `portal_licenses.revoked_at` is set to now, `portal_licenses.revoked_by_admin_id` is set to the admin's ID, an entry is written to `portal_audit_log`, and a subsequent call to `/api/portal/licenses/verify` with the revoked license key returns HTTP 403

**AC-A03-2 (Verify endpoint reflects revocation within 60 seconds)**
- Given: A license has been revoked
- When: A product polls the `/api/portal/licenses/verify` endpoint within 60 seconds of revocation
- Then: The endpoint returns `{ "valid": false, "status": "revoked" }` with HTTP 403

**AC-A03-3 (Revocation is irreversible via UI)**
- Given: A license has `status = 'revoked'`
- When: An admin views the license detail page
- Then: There is no "Reactivate" or "Undo Revoke" button. The only available action is to issue a new license for the same product.

---

### A-04: Set License Tier Limits

**AC-A04-1 (Limit validation — seats)**
- Given: An admin is creating or editing a license
- When: They enter a seat limit of 0 or a negative number
- Then: The form returns a validation error "Seat limit must be at least 1"

**AC-A04-2 (Unlimited API calls)**
- Given: An admin is creating a license
- When: They leave the "API calls per month" field blank
- Then: `portal_licenses.api_calls_per_month` is stored as NULL and the client portal displays "Unlimited" for that limit

---

### A-06: Admin Login / Logout

**AC-A06-1 (Login reuses existing auth)**
- Given: The existing `/admin/login` page and `cms_admin_users` table are unchanged
- When: A valid CMS admin logs in
- Then: They can access both `/admin/articles` (existing CMS) and `/admin/portal/clients` (new portal admin) using the same session cookie

**AC-A06-2 (Portal admin route protection)**
- Given: No `cms_admin_token` cookie is present
- When: Any request is made to any `/admin/portal/*` route
- Then: The response is a 302 redirect to `/admin/login`

---

### C-01: Client Login

**AC-C01-1 (Successful login)**
- Given: A `portal_client_users` record exists with `status = 'active'` and a valid bcrypt password hash
- When: The user submits the login form at `/portal/login` with matching credentials
- Then: A `portal_client_token` HttpOnly cookie is set, the user is redirected to `/portal/dashboard`, and `portal_client_users.last_login_at` is updated

**AC-C01-2 (Invalid credentials)**
- Given: A user submits the login form with a correct email but incorrect password
- Then: The form displays "Invalid email or password" (generic; do not indicate which field is wrong), no cookie is set, and the failed attempt is logged (for rate limiting purposes)

**AC-C01-3 (Deactivated account)**
- Given: A `portal_client_users` record has `status = 'deactivated'`
- When: The user attempts to log in with correct credentials
- Then: The form displays "Your account has been deactivated. Contact support@integrius.io" and no cookie is set

**AC-C01-4 (Rate limiting)**
- Given: A single IP address has submitted 10 failed login attempts within 60 seconds
- When: They attempt an 11th login within that window
- Then: The server returns HTTP 429 with a `Retry-After: 60` header before even checking credentials

---

### C-02: Client Logout

**AC-C02-1**
- Given: A client user is authenticated
- When: They click "Log out" or send a POST to `/api/portal/logout`
- Then: The `portal_client_token` cookie is cleared (set with `Max-Age=0`), and the user is redirected to `/portal/login`

---

### C-03 / C-04: Client Dashboard and License Entitlement View

**AC-C03-1 (Dashboard loads correct data)**
- Given: A client user is authenticated and their organisation has 2 active licenses
- When: They load `/portal/dashboard`
- Then: Both licenses are displayed as cards with the correct product name, tier, and expiry date. Data from other clients' licenses is never included.

**AC-C04-1 (Entitlement limits displayed correctly)**
- Given: A license has `seat_limit = 10`, `api_calls_per_month = 50000`, `data_source_limit = NULL`
- When: The client user views `/portal/licenses/[id]`
- Then: The page shows "10 seats", "50,000 API calls / month", and "Unlimited data sources"

**AC-C04-2 (Cross-client isolation)**
- Given: Client A is authenticated and knows the UUID of Client B's license
- When: Client A navigates to `/portal/licenses/[client-b-license-id]`
- Then: The server returns HTTP 404 (not 403 — do not confirm the resource exists)

---

*End of Document*

---

**Document Control**

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-03-24 | Product Management | Initial draft |
