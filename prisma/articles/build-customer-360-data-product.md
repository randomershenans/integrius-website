---
title: How to Build a Customer 360 Data Product
slug: build-customer-360-data-product
meta_title: How to Build a Customer 360 Data Product (Not Just a View)
meta_description: A Customer 360 view in a dashboard is not a data product. A governed Customer 360 API with access control, lineage, and consumer contracts is. Here is the difference and how to build it.
excerpt: Most Customer 360 projects ship a dashboard and call it done. A governed Customer 360 data product is an API with an owner, access control, lineage, and consumer contracts. Here is how to build one.
primary_keyword: customer 360 data product
article_type: pillar
cluster_slug: use-cases
---

## What a Customer 360 actually means vs what vendors sell you

Every CRM vendor sells a "Customer 360". So does every CDP, every BI tool, and every data warehouse. The phrase has been stretched until it means almost nothing.

Strip away the marketing and a Customer 360 is one idea: a single, trustworthy view of a customer that pulls together everything your organisation knows about them. Who they are. What they pay you. What they have asked for help with. How they use your product.

The version vendors sell you is usually a dashboard. A screen with some charts, a timeline, and a few panels stitched together inside one tool. It looks like a Customer 360. It demos well.

It is not a Customer 360 data product.

The difference matters because of who consumes the data. A dashboard serves one type of user looking at one screen. A real unified customer view feeds many consumers: a support agent's console, a billing reconciliation job, a churn model, a personalisation engine, a finance report. None of those live inside the BI tool. They need the data, not the picture.

So the question is not "can we build a screen that shows everything about a customer". You almost certainly can. The question is "can we serve a governed, unified customer view to every system that needs it, with the right fields, the right freshness, and a clear owner". That is a customer 360 data product, and it is a different thing to build.

The rest of this article is about how to build the second thing. The first half is largely vendor-neutral: what a real unified customer view requires, regardless of tooling. The implementation section near the end is where we get specific.

## Why a dashboard view is not a data product

A dashboard is a presentation. A data product is a contract.

When you build a dashboard, you join some tables, lay out some visuals, and ship it. If a source changes, the dashboard breaks quietly. Nobody owns the join logic. Nobody knows who depends on it. There is no version, no schema anyone agreed to, no way for another team to consume the underlying data without rebuilding the joins themselves.

That last point is the killer. The next team that needs unified customer data does not get to reuse your work. They open the same four source systems, write their own joins, make slightly different decisions about which email is canonical, and ship a slightly different customer view. Now you have two. Within a year you have nine, and no two agree on lifetime value.

A data product fixes this by being a managed, reusable asset rather than a one-off output. If you want the full definition, we cover it in [What Is a Data Product?](/blog/what-is-a-data-product). The short version is that a data product has properties a dashboard does not:

- **An owner.** A named person or team accountable for it.
- **A defined schema.** Consumers know exactly what fields they get and what type each one is.
- **An API.** Systems call it directly. They do not screenshot a chart.
- **Documentation.** What each field means, where it came from, how fresh it is.
- **Lineage.** You can trace every field back to its source.
- **Access control.** Different consumers see different fields.
- **Consumer subscriptions.** You know who depends on the product, so you know the blast radius of a change.

A dashboard has none of these by default. That is why building Customer 360 as a dashboard feels fast and then quietly becomes a liability. You have not built an asset. You have built a screen that happens to look like one.

The proliferation of one-off joins is really the [N x M data integration problem](/blog/n-x-m-data-integration-problem) wearing a customer-shaped hat. Every team wiring its own copy of the customer view is another point-to-point integration nobody governs.

## Sources: CRM, support, billing, product telemetry

A real customer 360 implementation joins at least four kinds of source. Each one owns a different slice of the truth.

**CRM (e.g. Salesforce).** This is your system of record for the commercial relationship. Account name, segment, owner, contacts, opportunity stage, contract terms. The CRM knows who the customer is in business terms.

**Support (e.g. Zendesk).** This owns the service relationship. Open tickets, ticket history, satisfaction scores, time to resolution. Support data tells you whether the customer is happy or about to leave.

**Billing (e.g. Stripe).** This owns the money. Subscriptions, invoices, payments, failed charges, lifetime value, current plan. Finance and revenue teams live here.

**Product telemetry (a product database, warehouse, or event stream).** This owns behaviour. Logins, feature usage, active seats, last activity. This is often the largest and messiest source, and frequently the one that does not share an identifier with the others.

Here is the typical shape of the data:

| Source | System of record for | Example fields | Typical key |
|---|---|---|---|
| CRM | Commercial relationship | account_name, segment, owner, plan_tier | account_id |
| Support | Service relationship | open_tickets, csat, last_contact | requester_email |
| Billing | Revenue | mrr, ltv, invoice_status, plan | stripe_customer_id |
| Product | Behaviour | last_login, active_seats, feature_flags | internal_user_id |

Notice the last column. Four sources, four different identifiers. CRM keys on an account ID. Support keys on email. Billing keys on a Stripe customer ID. Product keys on an internal user ID. Nothing lines up cleanly. That is the central problem of unified customer view data, and it is what the next section is about.

## Entity key strategy: choosing your customer identifier

You cannot join four sources until you decide what a "customer" is and which identifier represents it. This is the single most important design decision in the whole project. Get it wrong and every downstream number is wrong.

Two questions to settle first.

### What grain is a customer?

Is a customer a person, or an account? In most B2B systems the answer is an account: one logical organisation that may contain many individual users. In B2C it is usually a person. Pick the grain deliberately, because billing tends to think in accounts while product telemetry tends to think in users, and you will spend real effort rolling one up to the other.

### What is the canonical key?

You need one identifier that means the same customer everywhere. The candidates are usually:

- A natural key like email or domain. Easy to find, but messy. People change email. One account has many emails. Personal addresses leak in.
- A system key like the CRM account ID or the Stripe customer ID. Stable within one system, meaningless in the others.
- A surrogate key: a new `customer_id` you mint and map every source onto.

The surrogate key is almost always the right answer. You define a canonical `customer_id`, then maintain a mapping from each source's native identifier to it. CRM account `0013000000abc` maps to `customer_id` 42. Stripe customer `cus_xyz` maps to `customer_id` 42. The internal user IDs `881`, `882`, and `883` all map to `customer_id` 42 because they are three seats on the same account.

The hard part is building that mapping when the sources do not agree and there is no shared key to join on. Support only has an email. Billing only has a Stripe ID. There is no column that links them.

This is where **entity resolution** earns its place. Entity resolution unifies records that refer to the same real-world entity across systems, even when they share no common identifier. It matches on the evidence available: email domains, company names, addresses, fuzzy matches across attributes. The output is a clean mapping from every source record to one canonical entity.

Without entity resolution, a customer 360 data product is a fantasy whenever your keys do not line up, which is almost always. With it, you get a real `customer_id` that holds across CRM, support, billing, and product, and every join downstream becomes trivial.

A practical sequence:

1. Decide the grain (account vs person).
2. Mint a surrogate `customer_id`.
3. Map sources that already share a key directly.
4. Use entity resolution to reconcile the sources that do not.
5. Treat the resulting identity map as its own governed asset, because everything depends on it.

## Field mapping and normalisation across sources

Once identities are reconciled, you have to make the fields agree. Four systems will describe the same concept four different ways, and a unified view that mixes them silently is worse than four separate systems, because now the inconsistency is hidden inside one number.

Three layers of normalisation to plan for.

### Naming

Every source names things differently. CRM has `AnnualRevenue`. Billing has `mrr`. Support has `organization_name`. Your data product needs one agreed name per concept: `annual_revenue`, `monthly_recurring_revenue`, `account_name`. Pick names once, document them, and map each source field onto the agreed name.

### Types and units

This is where quiet corruption happens. Currency stored as cents in Stripe and as pounds in the CRM. Dates as ISO strings in one system and Unix timestamps in another. Plan tiers as `enterprise` in one place and `tier_3` in another. Normalise every field to one type, one unit, one vocabulary. Money in minor units or major units, but only one. Timestamps in UTC, always.

### Semantics

The subtle one. "Active" in the product database might mean "logged in this month". "Active" in billing might mean "has a paid subscription". They are different facts. Do not collapse them into one `is_active` field and hope. Keep them as distinct, well-named fields: `product_active_30d` and `billing_active`. Let consumers decide which one they mean.

The output of this stage is a normalised schema: one agreed list of fields, each with a name, a type, a unit, a definition, and a documented source. This schema is the public face of your customer 360 data product. It is the contract consumers build against, so changing it later has a cost, which is exactly why you want it owned and versioned rather than living in someone's ad hoc query.

## Access control: who gets what fields

Here is where most home-grown customer views fall apart, and where the data product model pays off hardest.

Not every consumer should see every field. A unified customer record contains commercial terms, revenue figures, support history, and personal contact details. Handing all of it to every system that wants "the customer record" is both a security problem and a compliance problem.

Different consumers genuinely need different slices:

- **Finance** needs lifetime value, MRR, invoice status, and billing contact. It does not need support ticket transcripts.
- **Support** needs ticket history, satisfaction, plan tier, and product usage so the agent has context. It does not need contract value or margin.
- **Marketing** needs engagement, segment, and product activity for personalisation. It does not need invoice-level billing detail or revenue figures.
- **A churn model** needs behavioural and billing signals but should never see raw personal contact details.

A single dashboard cannot express this. Either everyone sees the screen or nobody does. You end up cloning the dashboard per audience, which means cloning the joins, which means you are back to many slightly different customer views.

The data product model expresses it directly through **field-level access control**: the served API decides, per consumer, which fields come back. One product definition, many authorised projections of it.

A simple field-access matrix for one customer 360 data product might look like this:

| Field | Finance | Support | Marketing | Churn model |
|---|---|---|---|---|
| account_name | yes | yes | yes | yes |
| customer_id | yes | yes | yes | yes |
| mrr / ltv | yes | no | no | yes |
| invoice_status | yes | no | no | no |
| open_tickets | no | yes | no | yes |
| csat | no | yes | no | yes |
| last_login | no | yes | yes | yes |
| segment | yes | yes | yes | no |
| billing_contact_email | yes | no | no | no |

This is exactly the kind of control [data product governance](/blog/data-product-governance) is meant to provide, and it is built into how Integrius serves a product. You define the fields once, then grant each consumer access to the subset they are entitled to. The API enforces it at request time. Finance calling the product gets the finance projection. The churn model gets its projection. Same product, same `customer_id`, different fields returned, no duplicated pipelines.

The same governance layer is what makes the right to erasure tractable. When a customer exercises their GDPR right to be forgotten, the deletion has to propagate through the unified view, not turn into a manual scramble across four source systems and a dozen copies. With Integrius, GDPR atomic erasure handles this in a single transaction: it deletes, anonymises, and writes a chained audit row in one step, against the governed product. Because the product knows its lineage and its consumers, you know exactly what was affected and you have a tamper-evident record that it happened.

## Consumer subscriptions and SLAs

A data product is only as good as its relationship with the systems that consume it. This is the part dashboards have no concept of at all.

When a consumer starts using your customer 360 data product, that should be an explicit subscription, not an undocumented dependency someone discovers when it breaks. A subscription records who consumes the product, which fields they rely on, and what they expect in return.

That relationship carries obligations in both directions.

### What the consumer can expect

- A stable schema. Fields will not vanish or change type without notice.
- A known freshness. The consumer knows whether data is seconds, minutes, or hours old.
- A known availability and latency for the served API.

### What the producer gets

- Visibility of the blast radius. Because every product knows what depends on it, the owner can see exactly who breaks before they change anything. A schema change becomes a managed migration with a known list of affected consumers, not a surprise outage.

This is also where the real-time versus batch question gets answered properly. Different consumers have different freshness needs. A support console wants the customer's latest ticket reflected immediately. A monthly finance report is happy with last night's snapshot. A churn model retrains weekly and does not care about the last hour at all.

A well-built customer data product architecture serves both from one definition. You define the customer 360 once. You then choose, per use, how it is served: a materialised snapshot for speed and stability, or a live read for freshness. The consumer that needs sub-second context gets the cached projection. The consumer that needs this-second truth reads live. Neither requires a second definition of what a customer is.

That single definition is the whole point. Without it, "real-time" and "batch" become two separate pipelines that drift apart and disagree. With it, they are two delivery modes of the same governed truth.

## Implementation steps with Integrius

Here is how the pieces come together as a concrete build. This is the customer 360 implementation in order, mapped onto how Integrius works.

### 1. Connect the sources

Integrius ships with 16 connectors, including Salesforce, Zendesk over REST, Stripe over REST, PostgreSQL, MySQL, Snowflake, BigQuery, and Kafka. For a typical customer 360 you connect Salesforce for the commercial relationship, Zendesk for support, Stripe for billing, and your product database or event stream for telemetry. No bespoke extraction code per source. If your sources are themselves a mess of point-to-point feeds, it is worth reading why [your AI and analytics initiatives stall on exactly this](/blog/data-integration-for-ai): the data layer, not the model or the dashboard, is usually where these projects die.

### 2. Resolve identities

Run entity resolution across the connected sources to reconcile the four different identifiers into one canonical `customer_id`. CRM accounts, Stripe customers, support requesters, and product users collapse onto one entity. This is the foundation; build it before anything else.

### 3. Define the normalised schema

Map each source field onto the agreed name, type, and unit. The result is the product's public schema, with documentation and lineage attached to every field, so any consumer can see what a field means and where it came from.

### 4. Set field-level access

Define which consumer sees which fields, as in the matrix above. Finance, support, marketing, and your models each get their authorised projection. The served API enforces it per request.

### 5. Wire GDPR erasure

With the product governed, the right to erasure runs as one atomic transaction across the unified view: delete, anonymise, and write a chained, tamper-evident audit row. No manual cleanup across source systems.

### 6. Publish the API and onboard consumers

The product is now served as a single API. A consumer asks for one customer and gets every field it is entitled to, in one call:

```
GET /customer/{id}
```

```json
{
  "customer_id": 42,
  "account_name": "Northwind Trading",
  "segment": "enterprise",
  "mrr": 4200,
  "open_tickets": 1,
  "last_login": "2026-05-30T09:14:00Z"
}
```

Each consumer subscribes, picks materialised or live delivery for its freshness needs, and the owner gets full visibility of the blast radius for any future change. Materialised snapshots serve at roughly 33ms p50, fast enough to sit in front of an interactive support console, while a live read is available from the same definition when a consumer needs this-second freshness.

The whole thing deploys via Docker or Helm inside your own infrastructure, so the unified customer record, with all its commercial and personal detail, never leaves your environment. Pricing is per governed data product, so a customer 360 is one product, not a per-seat or per-row meter.

### What you end up with

Not a dashboard. A governed customer 360 data product: one canonical `customer_id`, a normalised and documented schema, field-level access per consumer, atomic GDPR erasure, known freshness, and a clear owner who can see every system that depends on it. Every team consumes the same truth through one API instead of rebuilding it nine different ways. If your current "single customer view" is really nine slightly different views, the problem is the same one that makes [enterprise search so consistently disappointing](/blog/why-enterprise-search-sucks): the same entity, scattered and ungoverned, answered differently every time you ask.

Build your Customer 360 as a governed data product. [See Integrius.](/contact)
