# Integrius Client Portal — Security Test Checklist

**Version:** 1.0
**Date:** 2026-03-24
**Scope:** Manual security tests to be performed before each portal release and after any change to authentication, authorisation, or data-access logic.

**Tools required:**
- Burp Suite Community Edition (or Pro for automated scanning)
- `curl` / HTTPie for raw request crafting
- Browser DevTools (Chrome or Firefox)
- `sqlmap` (for SQL injection automation on staging only — never production)
- `jwt.io` for JWT inspection and manual tampering
- A second browser profile or Playwright multi-context for isolation tests

**Environments:**
- All tests are performed against the **staging** environment.
- The staging database must be seeded with fixture organisations (Org A and Org B) and associated users before testing.
- Never run destructive or enumeration tests against production.

---

## How to Use This Checklist

Each section contains one or more test items. Each item follows this structure:

- **Attack:** What an attacker is attempting to do.
- **Steps:** The exact actions to reproduce the test.
- **Expected Defence:** What the system must do to block or mitigate the attack.
- **Status:** [ ] Not tested / [PASS] / [FAIL] / [N/A]

Mark each item with its result and the tester's initials and date.

---

## 1. SQL Injection

> **Risk level:** Critical
> **Applies to:** All text input fields that influence database queries — login form, member invite email, org name, search fields, license ID path parameters.

### 1.1 Login Email Field

**Attack:** Inject SQL metacharacters into the email field to bypass authentication or extract data.

**Steps:**
1. Open `POST /api/portal/auth/login` in Burp Repeater.
2. Send each of the following payloads as the `email` value, with any password:
   - `' OR '1'='1`
   - `' OR 1=1--`
   - `admin'--`
   - `' UNION SELECT null, null, null--`
   - `"; DROP TABLE portal_users;--`
3. Observe the HTTP response status and body.

**Expected Defence:**
- Response is 401 (not 200 or 500).
- No database error message appears in the response body.
- The application uses Prisma's parameterised queries — raw SQL string interpolation is not used.
- Server logs show the attempted injection was received but did not affect the query.

**Status:** [ ]

---

### 1.2 Login Password Field

**Attack:** Inject SQL into the password field.

**Steps:**
1. Use a valid existing email (e.g., `owner@acme.com`).
2. Send each payload as the `password` value:
   - `' OR '1'='1`
   - `' OR 1=1--`
   - `TestPassword123!' OR '1'='1`

**Expected Defence:** Same as 1.1 — 401 response; no bypass.

**Status:** [ ]

---

### 1.3 Path Parameters (License ID, Member ID)

**Attack:** Inject SQL via URL path parameters that are used in database lookups.

**Steps:**
1. Authenticate as Org A owner.
2. Send requests to parameterised routes with injection payloads as the ID:
   - `GET /api/portal/client/licenses/' OR '1'='1`
   - `GET /api/portal/client/licenses/1; DROP TABLE portal_licenses;--`
   - `PATCH /api/portal/admin/licenses/' UNION SELECT id, licenseKey FROM portal_licenses--`
3. Observe response codes and bodies.

**Expected Defence:**
- 400 or 404 response — the ID format should be validated (UUID format check before any DB call).
- No 500 errors exposing stack traces.
- No data returned for injected queries.

**Status:** [ ]

---

### 1.4 Member Invite Email

**Attack:** Inject SQL via the email field of the member invite endpoint.

**Steps:**
1. Authenticate as Org A owner.
2. `POST /api/portal/client/members` with body `{ "email": "' OR 1=1--@test.com", "role": "ORG_MEMBER" }`.

**Expected Defence:** 400 response — email fails format validation; no DB query executed with the raw payload.

**Status:** [ ]

---

## 2. JWT Tampering

> **Risk level:** Critical
> **Applies to:** `portal_session` cookie (client JWT) and `cms_admin_token` cookie (admin JWT).

### 2.1 Modified Payload — Org ID Swap

**Attack:** Decode a valid JWT, change `orgId` to a different organisation's ID, re-encode without changing the signature, and replay.

**Steps:**
1. Log in as Org A owner. Copy the `portal_session` cookie value.
2. Go to [jwt.io](https://jwt.io). Paste the token. Observe the decoded payload.
3. Change `orgId` from Org A's ID to Org B's ID.
4. Copy the modified token (the signature is now invalid).
5. Use Burp Repeater to send `GET /api/portal/client/licenses` with the modified token as the cookie value.

**Expected Defence:**
- 401 response with `Session expired` or `Unauthorised`.
- The `jose` library's `jwtVerify` rejects the token because the signature does not match the new payload.
- No Org B data is returned.

**Status:** [ ]

---

### 2.2 Modified Payload — Role Escalation

**Attack:** Change `role` from `ORG_MEMBER` to `ORG_OWNER` (or from client role to `INTEGRIUS_ADMIN`) in the JWT payload.

**Steps:**
1. Log in as Org A member. Copy the `portal_session` cookie.
2. Decode at jwt.io, change `"role": "ORG_MEMBER"` to `"role": "ORG_OWNER"`.
3. Attempt `POST /api/portal/client/members` (add team member — owner-only action) with the modified token.

**Expected Defence:** 401 — tampered signature rejected before role is read.

**Status:** [ ]

---

### 2.3 Wrong Signature (Forged Token)

**Attack:** Generate a completely new JWT signed with a different secret and replay it.

**Steps:**
1. Using `jose` or the jwt.io "secret" field, sign a payload `{ userId: "fake", orgId: ORG_B.id, role: "ORG_OWNER" }` with the secret `"wrong-secret"`.
2. Send the forged token as `portal_session` to any protected route.

**Expected Defence:** 401 — signature verification fails.

**Status:** [ ]

---

### 2.4 Algorithm Confusion — `alg: none`

**Attack:** Strip the signature and set `alg` to `none` in the header, which some naive JWT libraries accept.

**Steps:**
1. Take a valid token. Split it into header, payload, signature.
2. Re-encode the header with `"alg": "none"`.
3. Construct `<new-header>.<original-payload>.` (empty signature).
4. Send as the session cookie.

**Expected Defence:** 401 — `jose` rejects tokens with `alg: none` by default. The `jwtVerify` call must not pass `algorithms: ['none']` in its options.

**Status:** [ ]

---

### 2.5 Expired Token Replay

**Attack:** Wait for a token to expire, then replay it to access data.

**Steps:**
1. Log in and capture the `portal_session` cookie.
2. Wait for the token TTL to elapse (or manually set `exp` to a past timestamp using jwt.io with the correct secret on a dev/staging instance where the secret is known).
3. Replay the expired token against `GET /api/portal/client/me`.

**Expected Defence:** 401 with `Session expired` or `Unauthorised`.

**Status:** [ ]

---

### 2.6 Cross-Cookie Replay (CMS Admin Token on Portal Routes)

**Attack:** Use a valid CMS admin JWT (`cms_admin_token`) as the value for the `portal_session` cookie.

**Steps:**
1. Log in to the CMS admin panel at `/admin/login`. Copy the `cms_admin_token` cookie.
2. Send `GET /api/portal/client/me` with cookie `portal_session=<cms_admin_token_value>`.

**Expected Defence:** 401 — the portal middleware uses `PORTAL_JWT_SECRET`; the CMS token is signed with `CMS_JWT_SECRET`, so signature verification fails.

**Status:** [ ]

---

### 2.7 Cross-Cookie Replay (Portal Client Token on CMS Admin Routes)

**Attack:** Use a valid portal client JWT as the `cms_admin_token` cookie.

**Steps:**
1. Log in as an Org A owner. Copy the `portal_session` cookie value.
2. Send `GET /api/admin/me` with cookie `cms_admin_token=<portal_session_value>`.

**Expected Defence:** 401 — CMS admin middleware uses `CMS_JWT_SECRET`; portal token signed with `PORTAL_JWT_SECRET` will fail verification.

**Status:** [ ]

---

## 3. IDOR — Insecure Direct Object References

> **Risk level:** Critical
> **Applies to:** Any route that accepts a resource ID (license ID, invoice ID, member ID, org ID) in the path or query string.

### 3.1 License ID Enumeration

**Attack:** Guess or enumerate other organisations' license IDs and request them directly.

**Steps:**
1. Log in as Org A owner. Note Org A's license IDs from `GET /api/portal/client/licenses`.
2. Change one character in the UUID to guess Org B license IDs.
3. `GET /api/portal/client/licenses/<guessed-org-b-license-id>`.

**Expected Defence:** 404 (preferred — does not confirm the resource exists) or 403. Never 200 with Org B's license data.

**Status:** [ ]

---

### 3.2 Invoice ID Direct Access

**Attack:** Request Org B's invoice by ID while authenticated as Org A.

**Steps:**
1. On staging, know Org B's invoice ID from test fixture data.
2. Log in as Org A owner.
3. `GET /api/portal/client/invoices/<org-b-invoice-id>`.

**Expected Defence:** 404 or 403. Never 200.

**Status:** [ ]

---

### 3.3 Member ID Deletion Across Orgs

**Attack:** Delete a user from Org B while authenticated as Org A.

**Steps:**
1. On staging, know a member ID that belongs to Org B.
2. Log in as Org A owner.
3. `DELETE /api/portal/client/members/<org-b-member-id>`.

**Expected Defence:** 404 or 403. The member must not be deleted.

**Status:** [ ]

---

### 3.4 OrgId Injection via Request Body

**Attack:** Supply a different `orgId` in the POST/PATCH body to redirect a write operation to another org.

**Steps:**
1. Log in as Org A owner.
2. `POST /api/portal/client/members` with body `{ "email": "test@test.com", "role": "ORG_MEMBER", "orgId": "<org-b-id>" }`.
3. Check which org the new member was created under (if the request succeeds).

**Expected Defence:** The route must derive `orgId` from the session token, never from the request body. If a member is created, it belongs to Org A. Alternatively, the route returns 400 if an `orgId` is supplied that does not match the session.

**Status:** [ ]

---

### 3.5 OrgId Injection via Query String

**Attack:** Append `?orgId=<org-b-id>` to a GET route and see if it returns Org B's data.

**Steps:**
1. Log in as Org A owner.
2. `GET /api/portal/client/licenses?orgId=<org-b-id>`.
3. `GET /api/portal/client/invoices?orgId=<org-b-id>`.

**Expected Defence:** Query string `orgId` must be ignored. Response contains only Org A data (or 400).

**Status:** [ ]

---

## 4. Privilege Escalation

> **Risk level:** High
> **Applies to:** Routes protected by role checks (MEMBER vs OWNER vs INTEGRIUS_ADMIN).

### 4.1 MEMBER Attempts OWNER-Only Action

**Attack:** Log in as an org member and attempt actions reserved for org owners (add/remove members, update billing info).

**Steps:**
1. Log in as Org A member (role: `ORG_MEMBER`).
2. Attempt each of the following:
   - `POST /api/portal/client/members` (add member)
   - `DELETE /api/portal/client/members/<any-id>` (remove member)
   - `PATCH /api/portal/client/org` (update org info, if the route exists)

**Expected Defence:** 403 Forbidden for each. The server must check the role from the verified JWT, not from a request body or header that the client controls.

**Status:** [ ]

---

### 4.2 Client Attempts Integrius Admin Actions

**Attack:** Log in as a client (org owner or member) and attempt actions only Integrius admins can perform.

**Steps:**
1. Log in as Org A owner.
2. Attempt:
   - `GET /api/portal/admin/metrics`
   - `GET /api/portal/admin/orgs`
   - `POST /api/portal/admin/licenses`
   - `PATCH /api/portal/admin/licenses/<id>`

**Expected Defence:** 401 (not 403 — the portal admin routes require the CMS admin cookie, which the client does not have). No admin data is returned.

**Status:** [ ]

---

### 4.3 Role Value Manipulation via HTTP Header

**Attack:** Add a custom header `X-Role: INTEGRIUS_ADMIN` and see if the route honours it.

**Steps:**
1. Log in as Org A member.
2. Add header `X-Role: INTEGRIUS_ADMIN` or `X-User-Role: ORG_OWNER` to requests.
3. Attempt a restricted action.

**Expected Defence:** The role must be read exclusively from the verified JWT payload. Custom headers are ignored for authorisation decisions.

**Status:** [ ]

---

## 5. Cookie Theft Mitigations

> **Risk level:** High
> **Applies to:** `portal_session` and `cms_admin_token` cookies.

### 5.1 HttpOnly Flag Verification

**Attack:** JavaScript on the page reads the session cookie and exfiltrates it.

**Steps:**
1. Log in as any user.
2. Open browser DevTools → Console.
3. Run: `document.cookie`

**Expected Defence:** The session cookie does not appear in `document.cookie`. It is `HttpOnly` and therefore inaccessible to JavaScript.

**Status:** [ ]

---

### 5.2 Secure Flag Verification (Production / HTTPS only)

**Attack:** Session cookie is transmitted over HTTP (plain text), exposing it to network eavesdropping.

**Steps:**
1. In DevTools, go to Application → Cookies.
2. Inspect `portal_session` and `cms_admin_token`.
3. Verify the `Secure` column is checked.
4. (Optional) Use a proxy and attempt to intercept the cookie over HTTP.

**Expected Defence:** Both cookies have the `Secure` flag set in production (where `NODE_ENV === 'production'`). The cookie is never sent over HTTP.

**Status:** [ ]

---

### 5.3 SameSite Flag Verification

**Attack:** Cross-site request forgery (CSRF) — a malicious site triggers a state-changing request using the victim's cookie.

**Steps:**
1. Verify in DevTools that both cookies show `SameSite: Lax`.
2. Craft a cross-origin form POST (from a different domain) to `POST /api/portal/client/members`.
3. Observe whether the browser sends the cookie with the cross-origin request.

**Expected Defence:** With `SameSite=Lax`, the cookie is not sent with cross-site POST requests. The route also expects a JSON body (`Content-Type: application/json`), which browsers do not send as simple form submissions — adding a second layer of CSRF protection.

**Status:** [ ]

---

### 5.4 Cookie Scope (Path and Domain)

**Steps:**
1. Inspect cookies in DevTools.
2. Verify:
   - `Path: /` (acceptable — scope to all paths)
   - No `Domain` attribute that would share the cookie with subdomains (unless intentional).

**Expected Defence:** Cookie does not bleed to unintended subdomains.

**Status:** [ ]

---

## 6. Rate Limiting

> **Risk level:** High
> **Applies to:** Login endpoints (`/api/portal/auth/login` and `/api/admin/login`).

### 6.1 Portal Login Rate Limit — Trigger

**Attack:** Automate rapid login attempts to brute-force a password.

**Steps:**
1. Use a script or Burp Intruder to send 10 rapid POST requests to `/api/portal/auth/login` with an invalid password for a known email.
2. Observe the HTTP status codes.

**Expected Defence:**
- Attempts 1–5: 401 (Invalid credentials).
- Attempt 6 onwards: 429 Too Many Requests.
- Response includes `Retry-After` header indicating when to try again.

**Status:** [ ]

---

### 6.2 Rate Limit Reset After Window

**Attack:** Verify the rate limit counter resets correctly so legitimate users are not permanently blocked.

**Steps:**
1. Trigger the rate limit (6+ failed attempts).
2. Wait for the rate limit window to expire (e.g., 15 minutes).
3. Attempt login again with the correct password.

**Expected Defence:** Login succeeds with a 200 after the window expires. The counter resets to 0.

**Status:** [ ]

---

### 6.3 Rate Limit Scope — Per IP vs Per Account

**Attack:** Bypass per-IP rate limiting by rotating IP addresses; bypass per-account limiting by targeting many different accounts.

**Steps:**
1. Send 6 failed attempts from IP A → confirm 429 on IP A.
2. Send the 7th attempt from IP B (simulated via `X-Forwarded-For` header) → confirm whether it is blocked.
3. Document the scope of the rate limiter.

**Expected Defence:** Rate limiting is ideally applied per account (email) to prevent account lockout by an attacker who knows a user's email. Per-IP is a secondary layer. Confirm which is implemented and document the design decision.

**Status:** [ ]

---

### 6.4 CMS Admin Login Rate Limit (Existing Route — Gap)

**Attack:** The existing `/api/admin/login` route has no rate limiting in the current codebase.

**Steps:**
1. Send 20 rapid POST requests to `/api/admin/login` with wrong credentials.
2. Observe whether any request returns 429.

**Expected Defence:** This is a known gap. Rate limiting must be added before portal launch. Expected result for now: all requests return 401 — document as a finding and track in the backlog.

**Status:** [ ] **KNOWN GAP — backlog item required**

---

## 7. Brute Force Attack Simulation

> **Risk level:** High
> **Applies to:** Both login endpoints.

### 7.1 Common Password List Attack

**Attack:** Try the 100 most common passwords against a known account email.

**Steps:**
1. Obtain a small common-password wordlist (e.g., top 100 from SecLists).
2. Use Burp Intruder or a custom script to iterate through the list against `/api/portal/auth/login` with a known email.
3. Observe when the rate limiter triggers.

**Expected Defence:** Rate limiter triggers at attempt 6, returning 429. None of the common passwords succeed (verifying the seeded test account uses a strong password).

**Status:** [ ]

---

### 7.2 Distributed Slow Brute Force (Low-and-Slow)

**Attack:** Send one attempt per minute from different IPs to avoid per-IP rate limiting.

**Steps:**
1. Send 1 request per minute over 30 minutes (30 attempts), rotating the `X-Forwarded-For` header each time.
2. Observe whether any defence triggers.

**Expected Defence:** Per-account rate limiting (not just per-IP) blocks this after the configured threshold. If only per-IP limiting exists, document this as a risk.

**Status:** [ ]

---

## 8. License Key Enumeration

> **Risk level:** Medium
> **Applies to:** Any public-facing or client-accessible endpoint that validates or looks up license keys.

### 8.1 Sequential Key Guessing

**Attack:** If license keys follow a predictable pattern, an attacker could guess valid keys and use them to determine a competitor's license status.

**Steps:**
1. Note the format of a known license key: `INT-XXXX-XXXX-XXXX`.
2. Write a script that generates all combinations starting from a base key (e.g., `INT-A1B2-C3D4-E5F0` through `INT-A1B2-C3D4-E5FF`).
3. If there is a public license validation endpoint, query it with guessed keys and observe timing differences between "valid" and "invalid" responses.

**Expected Defence:**
- License key space is large enough to make enumeration infeasible (16 alphanumeric characters = 36^12 possibilities).
- Any validation endpoint returns the same response time for valid and invalid keys (no timing oracle).
- After N failed validation attempts from the same IP, rate limiting triggers.
- License key validation requires authentication — unauthenticated validation endpoints do not exist.

**Status:** [ ]

---

### 8.2 Timing Attack on License Validation

**Attack:** Measure response time differences between a valid license key and an invalid one to determine if partial matches receive faster or slower responses (timing oracle).

**Steps:**
1. Collect 100 response times for a known-valid license key lookup.
2. Collect 100 response times for a random invalid license key.
3. Compare the distributions using a t-test or simple average comparison.

**Expected Defence:** Response times are statistically indistinguishable. The application does not short-circuit on a partial match.

**Status:** [ ]

---

### 8.3 License Key Exposure in API Responses

**Attack:** Ensure license keys are not inadvertently included in API responses that should not contain them (e.g., admin org list, metrics endpoint).

**Steps:**
1. Log in as an Integrius admin.
2. `GET /api/portal/admin/orgs` — inspect the response body for license key fields.
3. `GET /api/portal/admin/metrics` — inspect for license keys.

**Expected Defence:** License keys only appear in responses specifically designed to return them (the license detail/list routes). They are not included in aggregated or summary responses.

**Status:** [ ]

---

## 9. Additional Checks

### 9.1 Verbose Error Messages

**Attack:** Trigger server errors and capture detailed stack traces or database schemas from error responses.

**Steps:**
1. Send malformed JSON to all POST endpoints.
2. Send SQL-like strings in UUID fields.
3. Remove required fields from request bodies.

**Expected Defence:** All 400/404/500 responses return only a generic error message. No stack traces, file paths, or database column names appear in production/staging responses.

**Status:** [ ]

---

### 9.2 Mass Assignment

**Attack:** Include extra fields in a POST/PATCH body that should not be user-controllable (e.g., `status: "ACTIVE"` when creating a license as a client, or `role: "INTEGRIUS_ADMIN"` when updating a user profile).

**Steps:**
1. Log in as Org A owner.
2. `POST /api/portal/client/members` with `{ "email": "x@x.com", "role": "INTEGRIUS_ADMIN" }`.
3. If the member is created, check what role they were assigned.

**Expected Defence:** The server uses an allowlist of writable fields. Extra fields are stripped or cause a 400. The created member has `role: "ORG_MEMBER"` regardless of what was sent.

**Status:** [ ]

---

### 9.3 Content-Type Enforcement

**Attack:** Send a JSON payload with `Content-Type: text/plain` or `Content-Type: application/x-www-form-urlencoded` to bypass middleware that checks content type.

**Steps:**
1. Send `POST /api/portal/auth/login` with `Content-Type: text/plain` and a JSON body string.
2. Send with `Content-Type: application/x-www-form-urlencoded` and form-encoded body.

**Expected Defence:** Route either rejects non-`application/json` content types with 400 or parses only `application/json` (Next.js default behaviour). Does not process unexpected content types as authentication attempts.

**Status:** [ ]

---

## Sign-Off

| Release | Tester | Date | Findings |
|---|---|---|---|
| v0.1 — Portal Alpha | | | |
| v0.2 | | | |
| v1.0 — GA | | | |

All FAIL findings must be resolved and re-tested before a GA release. KNOWN GAP items must have a backlog ticket created before the alpha release.
