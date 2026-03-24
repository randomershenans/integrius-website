-- ─── Fix license enums to match pricing playbook ──────────────────────────────
--
-- 1. license_tier: add PILOT and PLATFORM_LITE, keep ENTERPRISE and PLATFORM.
--    STARTER and GROWTH are retained so any existing rows aren't broken.
--
-- 2. product_type: remove PLATFORM (it's a tier, not a product).
--    Postgres cannot DROP enum values directly, so we recreate the type.
--    Safe to run on a fresh system with no rows using product='PLATFORM'.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add new tier values (idempotent — errors if already exists, caught below)
DO $$ BEGIN
  ALTER TYPE license_tier ADD VALUE IF NOT EXISTS 'PILOT';
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE license_tier ADD VALUE IF NOT EXISTS 'PLATFORM_LITE';
EXCEPTION WHEN others THEN NULL; END $$;

-- 2. Recreate product_type without PLATFORM
--    Check first — skip if no rows reference 'PLATFORM' as a product
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM portal_licenses WHERE product::text = 'PLATFORM'
  ) THEN
    -- Detach column from old type
    ALTER TABLE portal_licenses
      ALTER COLUMN product TYPE TEXT;

    DROP TYPE IF EXISTS product_type;

    CREATE TYPE product_type AS ENUM ('CORE', 'OPTIC', 'SEARCH', 'SDK');

    -- Re-attach column to new type
    ALTER TABLE portal_licenses
      ALTER COLUMN product TYPE product_type USING product::product_type;
  ELSE
    RAISE NOTICE 'Skipped product_type recreation: rows exist with product=PLATFORM. Migrate those rows first.';
  END IF;
END $$;
