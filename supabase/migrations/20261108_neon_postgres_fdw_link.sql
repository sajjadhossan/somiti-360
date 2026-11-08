-- ==============================================================================
-- SOMITI 360 - SUPABASE TO NEON POSTGRES FDW (FOREIGN DATA WRAPPER) LINK
-- Enables direct SQL queries and real-time streaming from Neon Core Ledger
-- ==============================================================================

-- 1. Enable postgres_fdw extension
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- 2. Define Foreign Server pointing to Neon Serverless Postgres
-- Host: ep-wispy-unit-aodnt6pk.c-2.ap-southeast-1.aws.neon.tech
-- Port: 5432 (SSL Required)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_foreign_server WHERE srvname = 'neon_server') THEN
    CREATE SERVER neon_server
      FOREIGN DATA WRAPPER postgres_fdw
      OPTIONS (
        host 'ep-wispy-unit-aodnt6pk.c-2.ap-southeast-1.aws.neon.tech',
        port '5432',
        dbname 'neondb',
        sslmode 'require'
      );
  ELSE
    ALTER SERVER neon_server OPTIONS (
      SET host 'ep-wispy-unit-aodnt6pk.c-2.ap-southeast-1.aws.neon.tech',
      SET port '5432',
      SET dbname 'neondb',
      SET sslmode 'require'
    );
  END IF;
END $$;

-- 3. Create User Mapping for Postgres Roles (postgres, authenticated, anon)
DO $$
BEGIN
  -- User Mapping for CURRENT_USER (postgres/service_role)
  IF NOT EXISTS (
    SELECT 1 FROM pg_user_mappings 
    WHERE srvname = 'neon_server' AND usename = CURRENT_USER
  ) THEN
    CREATE USER MAPPING FOR CURRENT_USER
      SERVER neon_server
      OPTIONS (user 'neondb_owner', password 'npg_rMOUety68ufY');
  END IF;
END $$;

-- 4. Create Isolated Foreign Schema Namespace in Supabase
CREATE SCHEMA IF NOT EXISTS neon_core;

-- Grant usage on foreign schema
GRANT USAGE ON SCHEMA neon_core TO postgres, authenticated, service_role, anon;

-- 5. Foreign Tables Definition (Explicit Schema Definition for Safety)
CREATE FOREIGN TABLE IF NOT EXISTS neon_core.samity_tenants (
  id TEXT,
  name TEXT,
  code TEXT,
  phone TEXT,
  subscription_status TEXT,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) SERVER neon_server OPTIONS (schema_name 'public', table_name 'samity_tenants');

CREATE FOREIGN TABLE IF NOT EXISTS neon_core.samity_members (
  id TEXT,
  tenant_id TEXT,
  account_number TEXT,
  name TEXT,
  phone TEXT,
  nid TEXT,
  balance NUMERIC(15, 2),
  total_deposited NUMERIC(15, 2),
  total_withdrawn NUMERIC(15, 2),
  status TEXT,
  is_synced BOOLEAN,
  sync_version INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
) SERVER neon_server OPTIONS (schema_name 'public', table_name 'samity_members');

CREATE FOREIGN TABLE IF NOT EXISTS neon_core.samity_deposits (
  id TEXT,
  tenant_id TEXT,
  member_id TEXT,
  amount NUMERIC(15, 2),
  deposit_type TEXT,
  payment_method TEXT,
  collector_id TEXT,
  collector_name TEXT,
  receipt_no TEXT,
  status TEXT,
  is_synced BOOLEAN,
  sync_version INTEGER,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
) SERVER neon_server OPTIONS (schema_name 'public', table_name 'samity_deposits');

CREATE FOREIGN TABLE IF NOT EXISTS neon_core.samity_sync_deltas (
  id TEXT,
  tenant_id TEXT,
  table_name TEXT,
  record_id TEXT,
  action TEXT,
  delta_payload JSONB,
  created_at TIMESTAMPTZ
) SERVER neon_server OPTIONS (schema_name 'public', table_name 'samity_sync_deltas');

-- 6. Unified High-Performance Public Views
CREATE OR REPLACE VIEW public.v_neon_deposits AS
  SELECT * FROM neon_core.samity_deposits;

CREATE OR REPLACE VIEW public.v_neon_members AS
  SELECT * FROM neon_core.samity_members;

CREATE OR REPLACE VIEW public.v_neon_deltas AS
  SELECT * FROM neon_core.samity_sync_deltas;

-- 7. Grant Select on views
GRANT SELECT ON public.v_neon_deposits TO authenticated, service_role, anon;
GRANT SELECT ON public.v_neon_members TO authenticated, service_role, anon;
GRANT SELECT ON public.v_neon_deltas TO authenticated, service_role, anon;

-- End of FDW link migration
