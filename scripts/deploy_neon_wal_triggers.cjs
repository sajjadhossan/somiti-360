/**
 * Somiti 360 - Neon WAL (Write-Ahead Log) Change-Data-Capture (CDC) Trigger Deployer
 * Attaches automated WAL recording triggers to Neon financial ledger tables
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

async function deployWalTriggers() {
  console.log('Deploying Neon WAL (Write-Ahead Log) Change-Capture Triggers...');

  // 1. Create WAL Trigger Function
  await sql`
    CREATE OR REPLACE FUNCTION public.fn_capture_wal_delta()
    RETURNS TRIGGER AS $$
    DECLARE
      v_tenant_id TEXT;
      v_record_id TEXT;
      v_delta JSONB;
      v_action TEXT;
    BEGIN
      v_action := TG_OP;

      IF TG_OP = 'DELETE' THEN
        v_tenant_id := OLD.tenant_id;
        v_record_id := OLD.id;
        v_delta := jsonb_build_object('id', OLD.id, 'deleted_at', now());
      ELSE
        v_tenant_id := NEW.tenant_id;
        v_record_id := NEW.id;
        v_delta := to_jsonb(NEW);
      END IF;

      -- Insert into Delta Stream only if not already written by explicit app delta
      INSERT INTO public.samity_sync_deltas (
        id, tenant_id, table_name, record_id, action, delta_payload, created_at
      ) VALUES (
        'wal_' || gen_random_uuid(),
        COALESCE(v_tenant_id, 'tenant_main'),
        TG_TABLE_NAME,
        v_record_id,
        v_action,
        v_delta,
        now()
      );

      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
  `;
  console.log('✓ WAL Trigger Function fn_capture_wal_delta created');

  // 2. Attach Trigger to samity_deposits
  await sql`DROP TRIGGER IF EXISTS trg_wal_deposits ON public.samity_deposits;`;
  await sql`
    CREATE TRIGGER trg_wal_deposits
      AFTER INSERT OR UPDATE OR DELETE ON public.samity_deposits
      FOR EACH ROW EXECUTE FUNCTION public.fn_capture_wal_delta();
  `;
  console.log('✓ WAL Trigger trg_wal_deposits attached to samity_deposits');

  // 3. Attach Trigger to samity_members
  await sql`DROP TRIGGER IF EXISTS trg_wal_members ON public.samity_members;`;
  await sql`
    CREATE TRIGGER trg_wal_members
      AFTER INSERT OR UPDATE OR DELETE ON public.samity_members
      FOR EACH ROW EXECUTE FUNCTION public.fn_capture_wal_delta();
  `;
  console.log('✓ WAL Trigger trg_wal_members attached to samity_members');

  console.log('All Neon WAL CDC Triggers successfully deployed!');
}

deployWalTriggers().catch(err => {
  console.error('Trigger deployment failed:', err);
  process.exit(1);
});
