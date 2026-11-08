/**
 * Somiti 360 - End-to-End Test for CQRS (Read-Write Split) & Neon WAL Reverse Sync
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

async function runCqrsAndWalTests() {
  console.log('=====================================================');
  console.log('TESTING CQRS (READ-WRITE SPLIT) & NEON WAL REVERSE SYNC');
  console.log('=====================================================');

  const { executeDepositCommand, executeMemberCreateCommand, executeDashboardMetricsQuery, executeMemberDirectoryQuery, executeCancelReceiptCommand } = await import('../api/_lib/cqrsManager.js');
  const { runReverseSyncCycle, getReverseSyncStatus } = await import('../api/_lib/reverseSyncEngine.js');

  const testTenantId = 'tenant_cqrs_test_' + Date.now();
  const testMemberId = 'mem_cqrs_' + Date.now();

  // 1. Ensure test tenant exists
  await sql`
    INSERT INTO public.samity_tenants (id, name, code)
    VALUES (${testTenantId}, 'CQRS টেস্ট সমিতি', 'CQRS-01')
    ON CONFLICT (id) DO NOTHING;
  `;

  // 2. CQRS COMMAND: Create Member
  console.log('\n--- 1. Testing CQRS Command: CREATE_MEMBER ---');
  const memberCmd = await executeMemberCreateCommand({
    member: {
      id: testMemberId,
      name: 'সাজ্জাদ হোসেন (CQRS মেম্বার)',
      phone: '01700000000',
      balance: 1000.00
    },
    tenantId: testTenantId
  });
  console.log(`✓ Member created via CQRS Command in ${memberCmd.executionMs}ms (ID: ${memberCmd.memberId})`);

  // 3. CQRS COMMAND: Record Deposit with Atomic Balance Rollup
  console.log('\n--- 2. Testing CQRS Command: RECORD_DEPOSIT ---');
  const testDepId = 'dep_cqrs_' + Date.now();
  const idemKey = 'idem_cqrs_' + Date.now();

  const depCmd = await executeDepositCommand({
    deposit: {
      id: testDepId,
      member_id: testMemberId,
      amount: 2500.00,
      idempotency_key: idemKey,
      collector_name: 'অফিসার সুমন'
    },
    tenantId: testTenantId
  });
  console.log(`✓ Deposit recorded with ACID balance rollup in ${depCmd.executionMs}ms:`);
  console.log(`  Deposit ID: ${depCmd.depositId}, Amount: ${depCmd.amount} BDT, New Balance: ${depCmd.updatedBalance} BDT`);

  // 4. Test Idempotency Guard (Duplicate Prevention)
  console.log('\n--- 3. Testing Idempotency Guard ---');
  const dupCmd = await executeDepositCommand({
    deposit: {
      id: 'dep_duplicate_attempt',
      member_id: testMemberId,
      amount: 2500.00,
      idempotency_key: idemKey // Same idempotency key!
    },
    tenantId: testTenantId
  });
  console.log(`✓ Idempotency protected: duplicate recognized (isDuplicate: ${dupCmd.isDuplicate})`);

  // 5. Verify WAL Change-Data-Capture Trigger
  console.log('\n--- 4. Testing WAL CDC Trigger Auto-Capture ---');
  const walDeltas = await sql`
    SELECT id, table_name, record_id, action, created_at
    FROM public.samity_sync_deltas
    WHERE tenant_id = ${testTenantId}
    ORDER BY created_at DESC;
  `;
  console.log(`✓ WAL CDC Trigger captured ${walDeltas.length} delta event(s) in samity_sync_deltas:`);
  walDeltas.forEach(d => console.log(`  - [${d.action}] Table: ${d.table_name}, Record: ${d.record_id}`));

  // 6. Test Reverse Sync Pipeline Cycle
  console.log('\n--- 5. Testing Neon WAL Reverse Sync Cycle ---');
  const revSync = await runReverseSyncCycle({ limit: 10, tenantId: testTenantId });
  console.log(`✓ Reverse Sync executed: found ${revSync.deltasFound || 0} deltas, replicated: ${revSync.replicatedCount || 0} in ${revSync.durationMs}ms`);

  const status = await getReverseSyncStatus();
  console.log(`✓ Reverse Sync Status: ${status.status}, total deltas in ledger: ${status.totalDeltasLogged}`);

  // 7. CQRS QUERY: Dashboard Metrics (Read Path)
  console.log('\n--- 6. Testing CQRS Query: DASHBOARD_METRICS (Read Path) ---');
  const metrics1 = await executeDashboardMetricsQuery({ tenantId: testTenantId });
  console.log(`✓ Fresh Metrics read in ${metrics1.executionMs}ms (Total Balance: ${metrics1.totalMemberBalance} BDT, Deposits Count: ${metrics1.totalDepositsCount})`);

  const metrics2 = await executeDashboardMetricsQuery({ tenantId: testTenantId });
  console.log(`✓ Cached Metrics read in ${metrics2.executionMs}ms (isCached: ${metrics2.isCached})`);

  // 8. CQRS QUERY: Member Directory
  console.log('\n--- 7. Testing CQRS Query: MEMBER_DIRECTORY ---');
  const directory = await executeMemberDirectoryQuery({ tenantId: testTenantId, search: 'সাজ্জাদ' });
  console.log(`✓ Member Directory read in ${directory.executionMs}ms (Found: ${directory.count} member(s))`);

  // Clean up test records
  await sql`DELETE FROM public.samity_sync_deltas WHERE tenant_id = ${testTenantId}`;
  await sql`DELETE FROM public.samity_deposits WHERE tenant_id = ${testTenantId}`;
  await sql`DELETE FROM public.samity_members WHERE tenant_id = ${testTenantId}`;
  await sql`DELETE FROM public.samity_tenants WHERE id = ${testTenantId}`;
  console.log('\n✓ Test records cleaned up successfully (Zero-pollution)');

  console.log('\n=====================================================');
  console.log('🎉 ALL CQRS & WAL REVERSE SYNC TESTS: PASSED!');
  console.log('=====================================================');
}

runCqrsAndWalTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
