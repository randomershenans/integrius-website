-- ─────────────────────────────────────────────────────────────────────────────
-- INTEGRIUS CMS — Initial schema
--
-- All tables are prefixed cms_ to avoid collision with product tables.
-- Uses CREATE TABLE IF NOT EXISTS throughout — safe to run against a live DB.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CMS admin users (separate from product users table)
CREATE TABLE IF NOT EXISTS "cms_admin_users" (
  "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
  "email"         TEXT        NOT NULL,
  "password_hash" TEXT        NOT NULL,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "last_login_at" TIMESTAMPTZ,
  CONSTRAINT "cms_admin_users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "cms_admin_users_email_key" ON "cms_admin_users"("email");
CREATE INDEX IF NOT EXISTS "cms_admin_users_email_idx" ON "cms_admin_users"("email");

-- Keyword clusters
CREATE TABLE IF NOT EXISTS "cms_keyword_clusters" (
  "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
  "name"        TEXT        NOT NULL,
  "slug"        TEXT        NOT NULL,
  "description" TEXT,
  "sort_order"  INTEGER     NOT NULL DEFAULT 0,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "cms_keyword_clusters_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "cms_keyword_clusters_name_key" ON "cms_keyword_clusters"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "cms_keyword_clusters_slug_key" ON "cms_keyword_clusters"("slug");

-- Article specifications (content bank blueprints)
CREATE TABLE IF NOT EXISTS "cms_article_specs" (
  "id"                 UUID        NOT NULL DEFAULT gen_random_uuid(),
  "cluster_id"         UUID        NOT NULL,
  "article_type"       TEXT        NOT NULL DEFAULT 'pillar',
  "title"              TEXT        NOT NULL,
  "slug"               TEXT        NOT NULL,
  "primary_keyword"    TEXT        NOT NULL,
  "secondary_keywords" TEXT[]      NOT NULL DEFAULT '{}',
  "search_intent"      TEXT        NOT NULL,
  "meta_title"         TEXT        NOT NULL,
  "meta_description"   TEXT        NOT NULL,
  "h2_structure"       TEXT[]      NOT NULL DEFAULT '{}',
  "key_points"         TEXT[]      NOT NULL DEFAULT '{}',
  "word_count_min"     INTEGER     NOT NULL DEFAULT 1200,
  "word_count_max"     INTEGER     NOT NULL DEFAULT 2000,
  "cta_text"           TEXT,
  "internal_links"     TEXT[]      NOT NULL DEFAULT '{}',
  "created_at"         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "cms_article_specs_pkey"       PRIMARY KEY ("id"),
  CONSTRAINT "cms_article_specs_cluster_fk" FOREIGN KEY ("cluster_id")
    REFERENCES "cms_keyword_clusters"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "cms_article_specs_slug_key" ON "cms_article_specs"("slug");
CREATE INDEX IF NOT EXISTS "cms_article_specs_cluster_idx"       ON "cms_article_specs"("cluster_id");
CREATE INDEX IF NOT EXISTS "cms_article_specs_article_type_idx"  ON "cms_article_specs"("article_type");

-- Published and draft articles
CREATE TABLE IF NOT EXISTS "cms_articles" (
  "id"                  UUID        NOT NULL DEFAULT gen_random_uuid(),
  "spec_id"             UUID,
  "cluster_id"          UUID,
  "title"               TEXT        NOT NULL,
  "slug"                TEXT        NOT NULL,
  "meta_title"          TEXT        NOT NULL,
  "meta_description"    TEXT        NOT NULL,
  "content"             TEXT        NOT NULL DEFAULT '',
  "excerpt"             TEXT,
  "primary_keyword"     TEXT,
  "article_type"        TEXT        NOT NULL DEFAULT 'pillar',
  "word_count"          INTEGER,
  "status"              TEXT        NOT NULL DEFAULT 'draft',
  "published_at"        TIMESTAMPTZ,
  "scheduled_for"       TIMESTAMPTZ,
  "linkedin_shared"     BOOLEAN     NOT NULL DEFAULT false,
  "linkedin_shared_at"  TIMESTAMPTZ,
  "linkedin_post_url"   TEXT,
  "ai_generated"        BOOLEAN     NOT NULL DEFAULT false,
  "ai_model"            TEXT,
  "ai_prompt_tokens"    INTEGER,
  "ai_output_tokens"    INTEGER,
  "created_at"          TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "cms_articles_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "cms_articles_spec_fk"   FOREIGN KEY ("spec_id")
    REFERENCES "cms_article_specs"("id") ON DELETE SET NULL,
  CONSTRAINT "cms_articles_cluster_fk" FOREIGN KEY ("cluster_id")
    REFERENCES "cms_keyword_clusters"("id") ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "cms_articles_slug_key"        ON "cms_articles"("slug");
CREATE INDEX IF NOT EXISTS "cms_articles_status_idx"             ON "cms_articles"("status");
CREATE INDEX IF NOT EXISTS "cms_articles_published_at_idx"       ON "cms_articles"("published_at");
CREATE INDEX IF NOT EXISTS "cms_articles_cluster_id_idx"         ON "cms_articles"("cluster_id");

-- AI generation queue
CREATE TABLE IF NOT EXISTS "cms_generation_queue" (
  "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
  "spec_id"       UUID        NOT NULL,
  "status"        TEXT        NOT NULL DEFAULT 'pending',
  "scheduled_for" TIMESTAMPTZ NOT NULL,
  "started_at"    TIMESTAMPTZ,
  "completed_at"  TIMESTAMPTZ,
  "error"         TEXT,
  "article_id"    UUID,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "cms_generation_queue_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "cms_generation_queue_status_idx" ON "cms_generation_queue"("status", "scheduled_for");
