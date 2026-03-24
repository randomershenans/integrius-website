# Welcome to the Integrius Client Portal

> This guide is for Integrius customers. It explains how to log in, understand your licenses, manage your team, and get the most out of the client portal.

---

## Table of Contents

1. [Logging In](#logging-in)
2. [Your License Dashboard](#your-license-dashboard)
3. [Finding Your License Key](#finding-your-license-key)
4. [What Your License Tier Includes](#what-your-license-tier-includes)
5. [Adding Team Members](#adding-team-members)
6. [Billing and Invoices](#billing-and-invoices)
7. [Contacting Support](#contacting-support)

---

## Logging In

Your client portal is at:

**`https://portal.integrius.io/portal/client`**

You will have received a welcome email from `portal@integrius.io` with your login credentials. If you did not receive this email, check your spam folder or contact your Integrius account manager.

### First login

1. Go to `https://portal.integrius.io/portal/client`.
2. Enter your email address and temporary password.
3. You will be prompted to set a new password. Choose a strong, unique password.
4. Once set, you are taken to your license dashboard.

Your session stays active for 7 days. After that you will be asked to log in again.

### Forgotten password

Use the **Forgot password** link on the login page. A reset link will be sent to your registered email address. The link expires after 24 hours.

If you no longer have access to your registered email address, contact support at `support@integrius.io`.

---

## Your License Dashboard

After logging in, you land on the **Licenses** page. This is your main view.

### What you see

For each active license, the dashboard shows:

| Field | What it means |
|-------|---------------|
| **Product** | Which Integrius product the license covers (Core, Optic, Search, or SDK) |
| **Tier** | Your subscription tier (Starter, Growth, Enterprise, or Platform) |
| **Status** | Active, Expired, or Revoked |
| **Data sources** | How many data sources you can connect |
| **Seats** | How many team members can access the product |
| **Valid until** | The date your current license expires |
| **License key** | The key you install into your Integrius deployment |

### License statuses

**Active** — Everything is working. Your installation is licensed and running.

**Expiring soon** — Your license expires within 30 days. Contact your account manager to arrange renewal. Your installation will continue to work until the expiry date.

**Expired** — Your license has passed its expiry date. Your Integrius installation will enter a read-only or locked state depending on the product. Contact support immediately to arrange renewal.

**Revoked** — Your license has been cancelled before its expiry date. Contact your account manager to discuss next steps.

---

## Finding Your License Key

Your license key is the signed token that activates your Integrius installation. You install it once into your deployment environment.

### How to find it

1. Log in to the portal at `https://portal.integrius.io/portal/client`.
2. Click **Licenses** in the left navigation.
3. Find the license for the product you are activating (e.g. Integrius Core).
4. Click **Copy license key**. The key is copied to your clipboard.

The key looks like a long string of characters starting with `eyJ...`. This is a signed JWT — it contains your license terms and is cryptographically verified by the Integrius product.

### How to activate your installation

Set the license key as an environment variable in your Integrius deployment:

```bash
INTEGRIUS_LICENSE_KEY=eyJhbGciOiJSUzI1NiJ9...
```

Then restart the service. Integrius Core and Optic validate the key at startup. If valid, the product starts normally. If invalid or expired, the product will display an error message in its logs explaining what is wrong.

Refer to your product's installation documentation for the exact environment variable name and configuration file location.

### If you need to update your license key

When your license is renewed or upgraded, a new license key is issued. The portal will show the updated key on your Licenses page. Copy it and update the environment variable in your deployment, then restart the service.

Your old key remains valid until it expires, so there is no rush — but update it before the expiry date.

---

## What Your License Tier Includes

Integrius offers four tiers across its products. Your tier is agreed at the time of purchase and shown on your license dashboard.

### Tier overview

| | Starter | Growth | Enterprise | Platform |
|---|---------|--------|------------|----------|
| **Data sources** | Up to 5 | Up to 25 | Up to 100 | 200+ (unlimited) |
| **Team seats** | 3 | 15 | 50 | Unlimited |
| **Support** | Email | Email + priority | Dedicated account manager | Dedicated account manager |
| **SLA** | Best effort | 1 business day | 4 hours | 1 hour |
| **Self-hosted** | Yes | Yes | Yes | Yes |
| **Air-gapped deployment** | No | No | Yes | Yes |
| **Custom integrations** | No | No | On request | Included |

### Products

**Integrius Core** — The governed data layer. Connects your data sources, normalises them into governed data products, and serves them through a stable API. The foundation of the Integrius platform.

**Integrius Optic** — Real-time observability across your governed data. See data flows, monitor product health, and trace lineage — all within your own infrastructure.

**Integrius Search** — Federated search across all your governed data products. No separate indexing infrastructure. Real-time, access-controlled, emergent from your governance layer.

**Integrius SDK** — Build applications that consume your governed data products. Typed client libraries for the languages your team uses.

If you are unsure which tier or products are right for your use case, speak to your account manager.

---

## Adding Team Members

You can give colleagues access to the client portal so they can view licenses, copy license keys, and download invoices.

### Roles

| Role | What they can do |
|------|-----------------|
| **Owner** | Full access, including inviting and removing team members |
| **Admin** | Can invite members; cannot remove owners |
| **Member** | Read-only: can view licenses and invoices, copy license keys |

Your account starts with one Owner — the primary contact set up during onboarding. There can only be one Owner per organization.

### Inviting a team member

You must be an **Owner** or **Admin** to invite team members.

1. Log in to the portal.
2. Click **Team** in the left navigation.
3. Click **Invite team member**.
4. Enter the colleague's email address and choose their role.
5. Click **Send invitation**.

Your colleague will receive an invitation email with a link to set up their account. The link expires after 7 days.

### Notes on invitations

- The invitation link can only be used once.
- If the link expires, go to **Team** and re-send the invitation.
- Team members must use an email address matching your organization's domain (e.g. `@acme.com`). If you need to add someone with a different email address, contact support.

### Removing a team member

1. Go to **Team**.
2. Find the team member you want to remove.
3. Click the **...** menu next to their name.
4. Select **Remove from organization**.

Removed users are immediately logged out and can no longer access the portal.

---

## Billing and Invoices

### Viewing invoices

1. Log in to the portal.
2. Click **Billing** in the left navigation.
3. All invoices are listed, with the most recent at the top.

For each invoice you can see:

- Invoice number (e.g. `INV-2026-001`)
- Period covered
- Amount (in GBP)
- Status: **Paid**, **Unpaid**, **Overdue**, or **Void**
- Due date
- A **Download PDF** link

### Invoice statuses

**Paid** — Payment has been received. No action required.

**Unpaid** — Payment is not yet due or is awaited. Please pay by the due date shown on the invoice.

**Overdue** — Payment is past the due date. Please arrange payment immediately. Overdue invoices may result in license suspension.

**Void** — The invoice was cancelled. Contact your account manager if you have questions.

### Payment

Integrius invoices in GBP. Payment is typically made by bank transfer to the details shown on your invoice PDF. If your organization requires a different payment method, speak to your account manager.

### Changing billing information

If your billing contact, legal entity name, or billing address changes, email `billing@integrius.io` with the updated details. Allow 1–2 business days for the change to be reflected.

---

## Contacting Support

### For technical issues (installation, license validation, product errors)

Email: `support@integrius.io`

Please include:

- Your organization name
- Which product and version you are using
- A description of the issue
- Any error messages from the product logs
- Whether the problem is intermittent or consistent

Response times by tier:

| Tier | Target response time |
|------|---------------------|
| Starter | Best effort (typically 1–2 business days) |
| Growth | 1 business day |
| Enterprise | 4 business hours |
| Platform | 1 business hour |

### For billing and account queries

Email: `billing@integrius.io`

For invoices, payment terms, billing address changes, or questions about your subscription.

### For license renewals and upgrades

Contact your account manager directly, or email `accounts@integrius.io`.

We recommend starting the renewal conversation at least 30 days before your license expires. You will also see a reminder banner in the portal when your license is within 30 days of expiry.

### For urgent issues (production down)

If your Integrius installation is down and you are on an Enterprise or Platform tier, use the emergency contact details provided in your onboarding email. If you cannot locate these, email `support@integrius.io` with "URGENT" in the subject line and we will escalate immediately.

---

*Integrius client portal — last updated March 2026.*
*Questions about this guide? Email `support@integrius.io`.*
