# Integrius Client Portal — Test Plan

**Version:** 1.0
**Date:** 2026-03-24
**Author:** QA Lead
**Project:** Integrius Client Portal (multi-tenant SaaS portal built on top of the existing Next.js 14 CMS)

---

## 1. Testing Strategy Overview

The client portal introduces the highest-risk surface area in the entire Integrius codebase. Unlike the marketing CMS (which is read-heavy and admin-only), the portal is multi-tenant: multiple paying organisations share one database and one API, separated only by application-layer access controls.

The core testing philosophy is **defence-in-depth verification**: every security boundary must be tested from both sides (the allowed path and the attempted breach). A functional test that only confirms the happy path is insufficient.

### Testing Pyramid

```
                   /\
                  /  \  E2E (Playwright)
                 /    \  ~15% — full user journeys
                /------\
               /        \ Integration (Jest + supertest)
              /          \  ~35% — API route contracts
             /------------\
            /              \ Unit (Jest)
           /                \  ~50% — business logic,
          /------------------\         auth helpers, calculations
```

Unit tests give the fastest feedback cycle and should cover all pure functions: token signing/verification, license key generation, MRR/ARR calculation, role-permission maps. Integration tests verify the HTTP contract of every API route in isolation (database mocked via `jest.mock`). E2E tests cover critical user journeys with a real browser against a staging database.

---

## 2. Test Environment Requirements

### 2.1 Local Development

| Requirement | Detail |
|---|---|
| Node.js | 20.x LTS (matches production) |
| Test runner | Jest 29 with `ts-jest` transformer |
| API test helper | `node-fetch` or `supertest` against Next.js test server (`createServer` from `next`) |
| E2E runner | Playwright 1.x |
| Database | PostgreSQL 15 running in Docker (`docker-compose.test.yml`) with a **dedicated test database** — never the dev or production DB |
| Environment file | `.env.test` — separate `DATABASE_URL`, `CMS_JWT_SECRET`, `PORTAL_JWT_SECRET` |

### 2.2 CI (GitHub Actions)

- Run unit + integration tests on every PR and push to `main`.
- Run E2E tests nightly and on releases.
- Postgres service container provided by GitHub Actions `services:` block.
- Test database seeded fresh before each CI run via `prisma migrate reset --force`.
- Code coverage report uploaded as an artifact; minimum thresholds enforced:
  - Statements: 80%
  - Branches: 75%
  - Functions: 80%

### 2.3 Staging Environment

- Mirror of production infrastructure on Neon (or Railway) with anonymised seed data.
- Used exclusively for E2E and manual security tests.
- No real customer data — use generated fixture organisations.

---

## 3. Test Categories

### 3.1 Unit Tests

Target: pure functions and helper modules with no I/O.

| Module | What to test |
|---|---|
| `lib/auth.ts` | `signAdminToken` produces a decodable JWT; `verifyAdminToken` rejects tampered/expired tokens; `setAdminCookie` returns correct flags |
| `lib/portal-auth.ts` (planned) | `signClientToken`, `verifyClientToken`, `setClientCookie` equivalents |
| License key generator | Output matches regex `^INT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$`; uniqueness across 10,000 generated samples |
| MRR/ARR calculator | Correct sum of active licenses; REVOKED licenses excluded; zero-license org returns 0 |
| Role permission map | ADMIN can do all actions; MEMBER cannot perform ADMIN actions; unknown role denied |
| Input sanitiser (planned) | SQL metacharacters stripped/escaped; XSS payloads stripped from org name |

### 3.2 Integration Tests (API Routes)

Target: every HTTP route contract via Jest + a lightweight Next.js test server or direct handler invocation.

Covered routes (portal — to be built):

```
POST   /api/portal/auth/login          Client login
POST   /api/portal/auth/logout         Client logout
GET    /api/portal/client/me           Current session info
GET    /api/portal/client/licenses     Org's license list
GET    /api/portal/client/invoices     Org's invoice list
POST   /api/portal/client/members      Add team member
DELETE /api/portal/client/members/:id  Remove team member
GET    /api/portal/admin/orgs          List all orgs (admin only)
POST   /api/portal/admin/orgs          Create org (admin only)
POST   /api/portal/admin/licenses      Issue license (admin only)
PATCH  /api/portal/admin/licenses/:id  Revoke/update license (admin only)
GET    /api/portal/admin/metrics       MRR/ARR dashboard (admin only)
```

Each route tested for:
- Happy path (200/201 with correct body shape)
- Missing auth (401)
- Wrong role (403)
- Invalid body (400 with error message)
- Resource not found (404)
- Tenant isolation (attempting cross-org access → 403 or 404)

### 3.3 End-to-End Tests (Playwright)

Critical user journeys:

1. **Admin: full license lifecycle** — log in → create org → issue license → view MRR → revoke license → verify MRR decreases.
2. **Client: onboarding** — receive invite → set password → log in → view license → add team member.
3. **Tenant isolation E2E** — two org accounts logged in simultaneously (Playwright multi-context); Org A attempts to navigate to Org B's license page by URL manipulation → receives error page, not Org B's data.
4. **Session expiry** — token age exceeds TTL → user redirected to login; after re-login, lands back on intended page.
5. **Rate limiting UI** — 5 failed logins → 6th attempt shows rate-limit error message in the UI.

### 3.4 Security Tests

See `SECURITY-TESTS.md` for the full manual checklist. Automated security-adjacent tests woven into the integration suite:

- JWT tamper tests (unit)
- IDOR tests (integration)
- Role escalation tests (integration)
- Rate limit assertion (integration — assert 429 on 6th attempt)

---

## 4. Critical Test Scenarios (Prioritised)

Priority 1 — ship blockers. Portal must not go live without these passing.

| # | Scenario | Category | Why Critical |
|---|---|---|---|
| 1 | Client A cannot read Client B's licenses | Integration + E2E | Core multi-tenancy guarantee |
| 2 | Client A cannot read Client B's invoices | Integration + E2E | Financial data leakage |
| 3 | Client A cannot add members to Client B's org | Integration | Privilege escalation |
| 4 | Unauthenticated request to any /api/portal/* returns 401 | Integration | No anonymous access |
| 5 | CMS admin cookie rejected on portal client routes | Integration | Cookie namespace collision |
| 6 | Portal client cookie rejected on admin routes | Integration | Reverse collision |
| 7 | Revoked license excluded from MRR | Unit + Integration | Financial accuracy |
| 8 | Login rate limiting triggers on 6th attempt | Integration | Brute force defence |
| 9 | JWT with modified payload rejected | Unit | Tampering defence |
| 10 | JWT signed with wrong secret rejected | Unit | Tampering defence |

Priority 2 — required before first paying customer.

| # | Scenario | Category |
|---|---|---|
| 11 | License key matches expected format | Unit |
| 12 | MEMBER role cannot access ADMIN-only endpoints | Integration |
| 13 | Session cookie is HttpOnly, Secure (prod), SameSite=Lax | Unit (flag check) |
| 14 | Expired JWT returns 401, not 500 | Integration |
| 15 | MRR = sum of active license monthlyValues; ARR = MRR × 12 | Unit |
| 16 | Org with no active licenses has MRR = 0 | Unit |
| 17 | Admin can create org | Integration |
| 18 | Admin can issue license to org | Integration |
| 19 | Client can view own licenses | Integration |

Priority 3 — quality of life, pre-GA.

| # | Scenario |
|---|---|
| 20 | Invite email sent when admin adds member |
| 21 | Password reset flow works end-to-end |
| 22 | Pagination on license list (>50 licenses) |
| 23 | Audit log records every admin action |

---

## 5. Risk Areas Requiring Most Coverage

### 5.1 Tenant Isolation (Highest Risk)

The single most dangerous failure mode. If the org ID filtering is ever omitted from a Prisma query, any authenticated client can read every row in the table. Every data-fetching route MUST be tested with:
- A valid session from Org A requesting Org B's resource ID → must return 403 or 404 (never 200).
- A valid session from Org A with Org B's org ID embedded in the request body → must be ignored in favour of the session's org ID.

### 5.2 JWT Implementation

The existing CMS uses a single shared secret (`CMS_JWT_SECRET`). The portal will need a second secret (`PORTAL_JWT_SECRET`) to ensure CMS admin tokens cannot be reused on portal routes. Tests must verify:
- Tokens signed with `CMS_JWT_SECRET` are rejected by portal middleware.
- Tokens signed with `PORTAL_JWT_SECRET` are rejected by CMS middleware.
- Modified payload (e.g., swapping `orgId`) fails signature verification.

### 5.3 Role Enforcement

The portal has at least two roles: `ADMIN` (Integrius staff) and `MEMBER` (client team member). Each role has a sub-role for client orgs: org `OWNER` vs org `MEMBER`. All four combinations must be tested against every sensitive endpoint.

### 5.4 Rate Limiting

The existing login route (`/api/admin/login`) has no rate limiting in the current codebase. The portal login MUST have it. Tests should verify both the counter mechanism (resets after TTL) and the 429 response.

### 5.5 Input Validation

The existing CMS login does a direct `req.json()` cast with no Zod/validation schema. The portal must validate all inputs. Tests should send malformed JSON, oversized payloads, and SQL/XSS payloads.

---

## 6. Testing Tools Recommendation

### Primary Stack

| Tool | Purpose | Rationale |
|---|---|---|
| **Jest 29** | Unit + integration test runner | Mature TypeScript ecosystem; `ts-jest` handles the project's TS config; snapshot testing for response shapes |
| **ts-jest** | TypeScript transformer for Jest | Zero-config with `moduleNameMapper` for `@/*` path aliases |
| **supertest** | HTTP integration testing | Allows calling Next.js route handlers without a live server; pairs cleanly with Jest |
| **@jest/globals** | Typed Jest globals | Avoids polluting global namespace in TS strict mode |
| **Playwright 1.x** | E2E browser testing | First-class support for multi-context (simulate two browsers simultaneously for isolation tests); HTML report; trace viewer for CI debugging |
| **jest-mock-extended** | Prisma client mocking | Type-safe mocks for every Prisma model method; no real DB calls in unit/integration tests |

### Supporting Tools

| Tool | Purpose |
|---|---|
| `@faker-js/faker` | Deterministic test data generation |
| `bcryptjs` (already installed) | Pre-hash test passwords for fixtures |
| `jose` (already installed) | Forge test JWTs (valid and tampered) |
| `msw` (Mock Service Worker) | Mock external APIs (Resend email) in integration tests |
| `c8` / `@vitest/coverage-v8` | Coverage (if migrating to Vitest in future) |

### Jest Configuration (`jest.config.ts`)

```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterFramework: ['<rootDir>/src/__tests__/setup.ts'],
  testPathPattern: ['src/__tests__/**/*.test.ts'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    'src/app/api/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThresholds: {
    global: { statements: 80, branches: 75, functions: 80 },
  },
};

export default config;
```

---

## 7. Test Data Strategy

### 7.1 Fixture Organisations

Use two fixture orgs throughout all tests. This makes cross-org assertion tests deterministic.

```
Org A: { id: 'org-aaa-...', name: 'Acme Corp', slug: 'acme' }
Org B: { id: 'org-bbb-...', name: 'Beta Ltd',  slug: 'beta' }
```

### 7.2 Fixture Users

```
Admin (Integrius staff): { email: 'admin@integrius.io', role: 'INTEGRIUS_ADMIN' }
Org A Owner:             { email: 'owner@acme.com',      orgId: Org_A.id, role: 'ORG_OWNER' }
Org A Member:            { email: 'member@acme.com',     orgId: Org_A.id, role: 'ORG_MEMBER' }
Org B Owner:             { email: 'owner@beta.com',      orgId: Org_B.id, role: 'ORG_OWNER' }
```

### 7.3 Fixture Licenses

```
License 1: { orgId: Org_A.id, status: 'ACTIVE',  monthlyValue: 500  }
License 2: { orgId: Org_A.id, status: 'REVOKED', monthlyValue: 200  }
License 3: { orgId: Org_B.id, status: 'ACTIVE',  monthlyValue: 1000 }
```

Org A active MRR = 500. Org A total (if REVOKED included) = 700.
Org B active MRR = 1000.

### 7.4 Test Isolation

- **Unit tests:** no database, mock via `jest-mock-extended`.
- **Integration tests:** mock Prisma at the module level with `jest.mock('@/lib/prisma')`. Each `beforeEach` resets all mock return values.
- **E2E tests:** use a real Postgres test database seeded via `prisma migrate reset` and the seed script before the test run. Each test file runs in an isolated browser context.

### 7.5 Password Hashing

Pre-compute bcrypt hashes for test passwords in a shared fixture file. Do NOT hash in `beforeEach` — bcrypt is intentionally slow and will tank test performance.

```typescript
// src/__tests__/fixtures/passwords.ts
// Generated once: await bcrypt.hash('TestPassword123!', 10)
export const HASHED_TEST_PASSWORD = '$2a$10$...';
export const PLAINTEXT_TEST_PASSWORD = 'TestPassword123!';
```

---

## 8. Performance Test Scenarios

Performance tests are not part of the initial portal launch but must be completed before the first enterprise customer onboards.

### 8.1 API Throughput

Tool: `k6` or `autocannon`

| Scenario | Target | Pass Criteria |
|---|---|---|
| GET /api/portal/client/licenses (single org, 50 licenses) | 200 RPS | p95 < 150 ms |
| POST /api/portal/auth/login (bcrypt cost 10) | 50 RPS | p95 < 800 ms |
| GET /api/portal/admin/metrics (10 orgs, 500 licenses) | 100 RPS | p95 < 300 ms |
| Concurrent login burst (100 users simultaneously) | — | No 500s; rate limiter triggers correctly |

### 8.2 Database Query Performance

- License list query with org filter must use the `orgId` index — verify via `EXPLAIN ANALYZE` in staging.
- MRR aggregation query must not perform a full table scan.
- All queries must complete in < 20 ms at p95 on a dataset of 10,000 licenses.

### 8.3 Soak Test

- Run a simulated workload of 10 concurrent active clients for 30 minutes.
- Monitor memory, connection pool utilisation (Prisma `connection_limit=1` per serverless function), and error rate.
- Pass criteria: no memory growth trend; error rate < 0.1%.

---

## 9. Security Test Scenarios

See `SECURITY-TESTS.md` for the full manual checklist. Automated equivalents are integrated into the Jest suite.

### Summary of Security Test Categories

| Category | Automated | Manual |
|---|---|---|
| JWT tampering | Yes (unit) | Yes (Burp Suite) |
| IDOR | Yes (integration) | Yes |
| Privilege escalation | Yes (integration) | Yes |
| SQL injection | Partial (integration — send payload, verify no 500) | Yes (sqlmap on staging) |
| XSS | No (server-rendered, low risk) | Yes |
| Cookie flags | Yes (unit — check `setClientCookie` return value) | Yes (DevTools) |
| Rate limiting | Yes (integration) | Yes |
| Brute force | Yes (integration — 6 attempts → 429) | Yes |
| License enumeration | Yes (integration — sequential IDs rejected) | Yes |
| CSRF | No (SameSite=Lax + JSON body mitigates) | Yes (verify no state-change GET routes) |

---

## 10. Definition of Done for Testing

A feature is considered test-complete when:

1. All Priority 1 scenarios for that feature pass in CI.
2. Code coverage for new files meets the 80% threshold.
3. No new ESLint errors introduced.
4. E2E test for the feature's happy path passes in the staging environment.
5. Security test checklist items relevant to the feature are marked complete in `SECURITY-TESTS.md`.
6. PR description links to the test file and summarises what is covered.
