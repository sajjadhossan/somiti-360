/**
 * Somiti 360 - Neon Core Financial Ledger Schema Initializer
 * Deploys the multi-tenant transactional ledger tables to Neon Serverless Postgres
 */

const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(dbUrl);

async function initNeonCoreSchema() {
  console.log('Deploying Somiti 360 Core Schema to Neon Serverless Postgres...');

  // 1. Tenants Table
  await sql`
    CREATE TABLE IF NOT EXISTS public.samity_tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT,
      phone TEXT,
      subscription_status TEXT DEFAULT 'active',
      subscription_expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  console.log('✓ public.samity_tenants ready');

  // 2. Members Table
  await sql`
    CREATE TABLE IF NOT EXISTS public.samity_members (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      account_number TEXT,
      name TEXT NOT NULL,
      phone TEXT,
      nid TEXT,
      balance NUMERIC(15, 2) DEFAULT 0.00,
      total_deposited NUMERIC(15, 2) DEFAULT 0.00,
      total_withdrawn NUMERIC(15, 2) DEFAULT 0.00,
      status TEXT DEFAULT 'active',
      is_synced BOOLEAN DEFAULT true,
      sync_version INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      deleted_at TIMESTAMPTZ
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_neon_members_tenant_status ON public.samity_members (tenant_id, status);`;
  console.log('✓ public.samity_members ready');

  // 3. Deposits Ledger Table
  await sql`
    CREATE TABLE IF NOT EXISTS public.samity_deposits (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      member_id TEXT NOT NULL,
      amount NUMERIC(15, 2) NOT NULL,
      deposit_type TEXT DEFAULT 'savings',
      payment_method TEXT DEFAULT 'cash',
      collector_id TEXT,
      collector_name TEXT,
      receipt_no TEXT,
      status TEXT DEFAULT 'approved',
      is_synced BOOLEAN DEFAULT true,
      sync_version INTEGER DEFAULT 1,
      idempotency_key TEXT UNIQUE,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      deleted_at TIMESTAMPTZ
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_neon_deposits_tenant_created ON public.samity_deposits (tenant_id, created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_neon_deposits_member ON public.samity_deposits (member_id);`;
  console.log('✓ public.samity_deposits ready');

  // 4. Real-time Delta Stream Table (Sub-50ms Delta Mutation Queue)
  await sql`
    CREATE TABLE IF NOT EXISTS public.samity_sync_deltas (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      action TEXT NOT NULL,
      delta_payload JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_neon_deltas_tenant_time ON public.samity_sync_deltas (tenant_id, created_at DESC);`;
  console.log('✓ public.samity_sync_deltas ready');

  // 5. Query verified tables
  const tables = await sql`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;

  console.log('\nVerified Neon Public Tables:', tables.map(t => t.table_name).join(', '));
  console.log('All Neon Core Schema tables deployed successfully!');
}

initNeonCoreSchema().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
