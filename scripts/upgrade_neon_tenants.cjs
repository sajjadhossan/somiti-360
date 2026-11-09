/**
 * Upgrade Neon samity_tenants with logo_url, is_own_samity and settings columns
 */
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

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

const sql = neon(process.env.DATABASE_URL);

async function run() {
  try {
    console.log('Inspecting and upgrading public.samity_tenants in Neon Postgres...');
    
    // Add columns if they do not exist
    await sql`ALTER TABLE public.samity_tenants ADD COLUMN IF NOT EXISTS logo_url TEXT`;
    await sql`ALTER TABLE public.samity_tenants ADD COLUMN IF NOT EXISTS is_own_samity BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE public.samity_tenants ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb`;
    await sql`ALTER TABLE public.samity_tenants ADD COLUMN IF NOT EXISTS modules JSONB DEFAULT '{}'::jsonb`;
    
    console.log('✓ Columns added to public.samity_tenants successfully.');
    
    const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'samity_tenants'`;
    console.log('Current schema for samity_tenants:');
    cols.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
    
  } catch (err) {
    console.error('Error upgrading tenants schema:', err);
    process.exit(1);
  }
}

run();
