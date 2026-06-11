-- ─────────────────────────────────────────────────────────────────────────────
-- INTEGRIUS CMS — SEO brain runs
--
-- Stores one row per agentic SEO run (nightly cron or manual trigger).
-- Uses CREATE TABLE IF NOT EXISTS — safe to run against a live DB.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "cms_seo_runs" (
  "id"                  UUID        NOT NULL DEFAULT gen_random_uuid(),
  "started_at"          TIMESTAMPTZ NOT NULL DEFAULT now(),
  "finished_at"         TIMESTAMPTZ,
  "status"              TEXT        NOT NULL DEFAULT 'ok',
  "gsc_rows"            INTEGER     NOT NULL DEFAULT 0,
  "posthog_rows"        INTEGER     NOT NULL DEFAULT 0,
  "opportunities_found" INTEGER     NOT NULL DEFAULT 0,
  "specs_created"       INTEGER     NOT NULL DEFAULT 0,
  "quick_wins"          JSONB       NOT NULL DEFAULT '[]',
  "report"              JSONB       NOT NULL DEFAULT '{}',
  "error"               TEXT,
  CONSTRAINT "cms_seo_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "cms_seo_runs_started_at_idx" ON "cms_seo_runs"("started_at");
