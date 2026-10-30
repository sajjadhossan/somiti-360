/**
 * Somiti 360 - Automated Test & Verification Suite (v2.0.0)
 * -----------------------------------------------------------
 * Validates version parity, PWA assets, local DB schema definitions,
 * sync engine endpoints, and localization key parity.
 */

const fs = require('fs');
const path = require('path');

function runTests() {
  console.log('=====================================================');
  console.log('🛡️ SOMITI 360 — OFFLINE + ONLINE SUPER APP TEST SUITE');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Version Parity Check
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert(pkg.version === '2.1.0', 'package.json version is 2.1.0');

  const gradle = fs.readFileSync('android/app/build.gradle', 'utf8');
  assert(gradle.includes('versionCode 21'), 'android/app/build.gradle versionCode is 21');
  assert(gradle.includes('versionName "2.1.0"'), 'android/app/build.gradle versionName is "2.1.0"');

  const versionApi = fs.readFileSync('api/app/version.js', 'utf8');
  assert(versionApi.includes('"2.1.0"') && versionApi.includes('buildNumber: 21'), 'api/app/version.js specifies v2.1.0 Build 21');

  // 2. PWA & Service Worker
  assert(fs.existsSync('public/manifest.json'), 'PWA manifest.json exists');
  const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
  assert(manifest.short_name === 'সমিতি ৩৬০', 'manifest.json has correct short_name');
  assert(manifest.display === 'standalone', 'manifest.json display is standalone');

  assert(fs.existsSync('public/sw.js'), 'PWA sw.js exists');
  const sw = fs.readFileSync('public/sw.js', 'utf8');
  assert(sw.includes('somiti360-shell-v2.1.0'), 'Service worker has correct cache version');
  assert(sw.includes('/api/'), 'Service worker explicitly skips /api/ routes to prevent leaking private cache');

  // 3. Local Database & Offline Stores (IndexedDB v2)
  const offlineStore = fs.readFileSync('src/services/somitiOfflineStore.js', 'utf8');
  assert(offlineStore.includes('cached_members'), 'offlineStore contains cached_members');
  assert(offlineStore.includes('cached_deposits'), 'offlineStore contains cached_deposits');
  assert(offlineStore.includes('pending_sync_queue'), 'offlineStore contains pending_sync_queue');
  assert(offlineStore.includes('sync_conflicts'), 'offlineStore contains sync_conflicts');
  assert(offlineStore.includes('offline_files'), 'offlineStore contains offline_files');

  // 4. Localization Parity Check
  const bn = JSON.parse(fs.readFileSync('src/locales/bn.json', 'utf8'));
  const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
  const bnKeys = Object.keys(bn);
  const enKeys = Object.keys(en);
  assert(bnKeys.length === enKeys.length, `Localization key count matches (${bnKeys.length} keys)`);
  const missingInEn = bnKeys.filter(k => !enKeys.includes(k));
  assert(missingInEn.length === 0, 'No missing translation keys between bn and en');

  // 5. Cloud Database Migration
  assert(fs.existsSync('supabase/migrations/20261030_offline_sync_tables.sql'), 'Offline sync SQL migration file exists');
  const sql = fs.readFileSync('supabase/migrations/20261030_offline_sync_tables.sql', 'utf8');
  assert(sql.includes('sync_audit_logs'), 'SQL migration creates sync_audit_logs');
  assert(sql.includes('sync_conflicts'), 'SQL migration creates sync_conflicts');
  assert(sql.includes('sync_cursors'), 'SQL migration creates sync_cursors');

  // 6. Frontend UI Integration
  const appJsx = fs.readFileSync('src/App.jsx', 'utf8');
  assert(appJsx.includes('EnterpriseOfflineBanner'), 'App.jsx renders EnterpriseOfflineBanner');
  assert(appJsx.includes('SyncConflictResolutionModal'), 'App.jsx renders SyncConflictResolutionModal');

  console.log('\n-----------------------------------------------------');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('-----------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
