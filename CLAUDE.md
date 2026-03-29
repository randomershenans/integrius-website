# Integrius Website — Claude Instructions

## Project
Next.js 14 App Router on Netlify + Supabase. Dark theme. TypeScript strict.

## Stack
- **Framework**: Next.js 14 App Router
- **Styling**: Tailwind CSS (dark theme, cyan accents)
- **Database**: Supabase (portal tables) + Prisma (CMS tables only)
- **Auth**: CMS = custom JWT (`CMS_JWT_SECRET`). Portal = Supabase Auth
- **Deploy**: Netlify (auto-deploy on master push)

## Key conventions
- Portal API routes: `/api/portal/admin/**` (CMS JWT) and `/api/portal/client/**` (Supabase JWT)
- Admin UI: `/admin/**` — unified CMS + client management
- Client portal: `/portal/dashboard/**`
- No `max-w` constraints on dashboard/admin content areas (full width)
- No em dashes in content copy — use commas, colons, or periods instead
- License key format: `INT-{PRODUCT}-{TIER}-{6RANDOM}-{CHECKSUM}`
- Valid products: `CORE | OPTIC | SEARCH | SDK`
- Valid tiers: `PILOT | ENTERPRISE | PLATFORM_LITE | PLATFORM`

---

## Diablo Audit System

Diablo is the automated 18-stage audit suite. It drops findings into `.diablo/`.

### When woken by a Diablo FileChanged event:

**Step 1 — Triage**
```
Read .diablo/gate.json          → overall pass/fail, score, timestamp
Read .diablo/.meta.json         → full metadata if present
Read .diablo/remediations/README.md  → prioritised index table
```

**Step 2 — Deploy fix agents by category (parallel where safe)**

Process in this order, one agent per remediation file:

| File | Agent focus |
|------|-------------|
| `01-critical-security.md` | Security: auth, injection, secrets, SSRF |
| `02-critical-data-handling.md` | Data: validation, sanitisation, SQL safety |
| `03-warning-testing.md` | Tests: coverage, missing tests, brittle assertions |
| `04-warning-infrastructure.md` | Infra: env vars, config, build, Netlify, Supabase |
| `05-info-documentation.md` | Docs: missing JSDoc, API docs, README gaps |

**Step 3 — Each fix agent must:**
1. Read the full remediation file to understand every finding
2. Read all referenced source files before touching them
3. Fix each finding — no partial fixes
4. Run `npx tsc --noEmit` to verify TypeScript is clean
5. Return a summary of what was changed and why

**Step 4 — After all agents complete:**
```
git checkout -b fix/diablo-{date} origin/master
git add -A
git commit -m "fix: Diablo audit remediation — {gate_status} → PASS"
git push origin fix/diablo-{date}
gh pr create --title "fix: Diablo audit {date}" ...
gh pr merge --squash
```

**Step 5 — Document fixes**
Update `.diablo/remediations/README.md` — mark each fixed item with status and commit hash.

### Never:
- Skip a finding without explaining why it can't be fixed
- Mark a gate as passing if there are open criticals
- Push directly to master — always branch + PR
- Batch unrelated fixes into one commit
