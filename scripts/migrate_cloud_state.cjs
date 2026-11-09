const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const envPath = path.resolve('.env.local');
const env = fs.readFileSync(envPath, 'utf8');
let dbUrl = '';
env.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
  }
});

const sql = neon(dbUrl);

async function run() {
  console.log('Migrating Neon Postgres tables for omni-device document and logo sync...');

  // 1. Ensure public.samity_cloud_state table exists
  await sql`
    CREATE TABLE IF NOT EXISTS public.samity_cloud_state (
      tenant_id text PRIMARY KEY,
      logo_url text,
      letterhead jsonb DEFAULT '{}'::jsonb,
      profile jsonb DEFAULT '{}'::jsonb,
      full_state jsonb DEFAULT '{}'::jsonb,
      updated_at timestamptz DEFAULT now()
    );
  `;
  console.log('✅ Created/verified public.samity_cloud_state table in Neon');

  // 2. Ensure public.samity_tenants table has all required columns
  await sql`
    ALTER TABLE public.samity_tenants 
    ADD COLUMN IF NOT EXISTS logo_url text,
    ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS modules jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS is_own_samity boolean DEFAULT false;
  `;
  console.log('✅ Verified public.samity_tenants columns');

  // 3. Inspect existing rows in samity_tenants and samity_cloud_state
  const tenants = await sql`SELECT id, name, is_own_samity, logo_url, updated_at FROM public.samity_tenants`;
  console.log('Existing tenants count in Neon:', tenants.length);

  const states = await sql`SELECT tenant_id, updated_at FROM public.samity_cloud_state`;
  console.log('Existing cloud states count in Neon:', states.length);
}

run().then(() => {
  console.log('Migration finished successfully.');
  process.exit(0);
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
