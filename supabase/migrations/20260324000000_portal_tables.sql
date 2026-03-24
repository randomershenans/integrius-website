-- ─────────────────────────────────────────────────────────────────────────────
-- INTEGRIUS CLIENT PORTAL — initial schema
-- Run this in Supabase SQL editor or via supabase db push.
--
-- RLS is disabled on all portal tables. Auth is verified in application code
-- using the Supabase service role key (supabaseAdmin). Row-level security
-- would be redundant and could mask bugs in the access-control layer.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Types ───────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE org_status AS ENUM ('ACTIVE', 'SUSPENDED', 'CHURNED', 'TRIAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE product_type AS ENUM ('CORE', 'OPTIC', 'SEARCH', 'SDK', 'PLATFORM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE license_tier AS ENUM ('STARTER', 'GROWTH', 'ENTERPRISE', 'PLATFORM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE license_status AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── portal_organizations ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS portal_organizations (
  id           TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name         TEXT        NOT NULL,
  slug         TEXT        NOT NULL,
  email        TEXT        NOT NULL,
  phone        TEXT,
  website      TEXT,
  status       org_status  NOT NULL DEFAULT 'ACTIVE',
  notes        TEXT,
  health_score INT         NOT NULL DEFAULT 100,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT portal_organizations_slug_unique  UNIQUE (slug),
  CONSTRAINT portal_organizations_email_unique UNIQUE (email),
  CONSTRAINT portal_organizations_health_score_range CHECK (health_score BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS portal_organizations_status_idx    ON portal_organizations (status);
CREATE INDEX IF NOT EXISTS portal_organizations_created_at_idx ON portal_organizations (created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION portal_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS portal_organizations_updated_at ON portal_organizations;
CREATE TRIGGER portal_organizations_updated_at
  BEFORE UPDATE ON portal_organizations
  FOR EACH ROW EXECUTE FUNCTION portal_set_updated_at();

ALTER TABLE portal_organizations DISABLE ROW LEVEL SECURITY;

-- ─── portal_licenses ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS portal_licenses (
  id               TEXT           PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  org_id           TEXT           NOT NULL REFERENCES portal_organizations (id) ON DELETE CASCADE,
  license_key      TEXT           NOT NULL,
  product          product_type   NOT NULL,
  tier             license_tier   NOT NULL,
  status           license_status NOT NULL DEFAULT 'ACTIVE',
  seats            INT            NOT NULL DEFAULT 1,
  max_api_calls    INT,
  max_data_sources INT,
  starts_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  expires_at       TIMESTAMPTZ,
  monthly_value    NUMERIC(10, 2) NOT NULL,
  revoked_at       TIMESTAMPTZ,
  revoked_reason   TEXT,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT portal_licenses_license_key_unique UNIQUE (license_key),
  CONSTRAINT portal_licenses_seats_positive     CHECK (seats > 0),
  CONSTRAINT portal_licenses_monthly_value_nn   CHECK (monthly_value >= 0)
);

CREATE INDEX IF NOT EXISTS portal_licenses_org_id_idx    ON portal_licenses (org_id);
CREATE INDEX IF NOT EXISTS portal_licenses_status_idx    ON portal_licenses (status);
CREATE INDEX IF NOT EXISTS portal_licenses_created_at_idx ON portal_licenses (created_at DESC);

DROP TRIGGER IF EXISTS portal_licenses_updated_at ON portal_licenses;
CREATE TRIGGER portal_licenses_updated_at
  BEFORE UPDATE ON portal_licenses
  FOR EACH ROW EXECUTE FUNCTION portal_set_updated_at();

ALTER TABLE portal_licenses DISABLE ROW LEVEL SECURITY;

-- ─── portal_invoices ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS portal_invoices (
  id         TEXT           PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  org_id     TEXT           NOT NULL REFERENCES portal_organizations (id) ON DELETE CASCADE,
  amount     NUMERIC(10, 2) NOT NULL,
  currency   TEXT           NOT NULL DEFAULT 'GBP',
  status     invoice_status NOT NULL DEFAULT 'PENDING',
  period     TEXT           NOT NULL,
  paid_at    TIMESTAMPTZ,
  due_at     TIMESTAMPTZ    NOT NULL,
  created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT portal_invoices_amount_positive CHECK (amount >= 0)
);

CREATE INDEX IF NOT EXISTS portal_invoices_org_id_idx    ON portal_invoices (org_id);
CREATE INDEX IF NOT EXISTS portal_invoices_status_idx    ON portal_invoices (status);
CREATE INDEX IF NOT EXISTS portal_invoices_created_at_idx ON portal_invoices (created_at DESC);

ALTER TABLE portal_invoices DISABLE ROW LEVEL SECURITY;

-- ─── portal_client_users ─────────────────────────────────────────────────────
-- Supplementary table for portal users that need org-level metadata beyond
-- what Supabase auth.users stores. Optional — org_id is also stored in
-- user_metadata on the auth.users record.

CREATE TABLE IF NOT EXISTS portal_client_users (
  id         TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  org_id     TEXT        NOT NULL REFERENCES portal_organizations (id) ON DELETE CASCADE,
  auth_uid   UUID        UNIQUE,            -- auth.users.id from Supabase Auth
  email      TEXT        NOT NULL,
  full_name  TEXT,
  role       TEXT        NOT NULL DEFAULT 'member', -- 'admin' | 'member' | 'viewer'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT portal_client_users_email_org_unique UNIQUE (email, org_id),
  CONSTRAINT portal_client_users_role_valid CHECK (role IN ('admin', 'member', 'viewer'))
);

CREATE INDEX IF NOT EXISTS portal_client_users_org_id_idx  ON portal_client_users (org_id);
CREATE INDEX IF NOT EXISTS portal_client_users_auth_uid_idx ON portal_client_users (auth_uid);

ALTER TABLE portal_client_users DISABLE ROW LEVEL SECURITY;

-- ─── portal_audit_logs ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS portal_audit_logs (
  id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  actor_type    TEXT        NOT NULL,   -- 'admin' | 'client'
  actor_id      TEXT        NOT NULL,
  actor_email   TEXT        NOT NULL,
  action        TEXT        NOT NULL,   -- e.g. 'org.create', 'license.revoke'
  resource_type TEXT        NOT NULL,
  resource_id   TEXT,
  metadata      JSONB,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portal_audit_logs_actor_id_idx   ON portal_audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS portal_audit_logs_resource_idx   ON portal_audit_logs (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS portal_audit_logs_created_at_idx ON portal_audit_logs (created_at DESC);

ALTER TABLE portal_audit_logs DISABLE ROW LEVEL SECURITY;

-- ─── portal_usage_events ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS portal_usage_events (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  org_id      TEXT        NOT NULL REFERENCES portal_organizations (id) ON DELETE CASCADE,
  license_id  TEXT        REFERENCES portal_licenses (id) ON DELETE SET NULL,
  event_type  TEXT        NOT NULL,   -- e.g. 'api_call', 'data_source_sync'
  quantity    INT         NOT NULL DEFAULT 1,
  metadata    JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS portal_usage_events_org_id_idx     ON portal_usage_events (org_id);
CREATE INDEX IF NOT EXISTS portal_usage_events_license_id_idx ON portal_usage_events (license_id);
CREATE INDEX IF NOT EXISTS portal_usage_events_occurred_at_idx ON portal_usage_events (occurred_at DESC);

ALTER TABLE portal_usage_events DISABLE ROW LEVEL SECURITY;
