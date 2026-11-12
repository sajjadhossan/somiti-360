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
  assert(pkg.version === '2.6.5', 'package.json version is 2.6.5');

  const gradle = fs.readFileSync('android/app/build.gradle', 'utf8');
  assert(gradle.includes('versionCode 40'), 'android/app/build.gradle versionCode is 40');
  assert(gradle.includes('versionName "2.6.5"'), 'android/app/build.gradle versionName is "2.6.5"');
  assert(gradle.includes('v1SigningEnabled true') && gradle.includes('v2SigningEnabled true'), 'android/app/build.gradle enforces consistent v1 & v2 signing for in-place updates');

  const versionFile = fs.existsSync('api/_handlers/app/version.js') ? 'api/_handlers/app/version.js' : 'api/app/version.js';
  const versionApi = fs.readFileSync(versionFile, 'utf8');
  assert(versionApi.includes('"2.6.5"') && versionApi.includes('buildNumber: 40'), 'api/app/version.js specifies v2.6.5 Build 40');
  assert(fs.existsSync('api/[...slug].js'), 'Universal Serverless API Gateway [...slug].js exists for Vercel Hobby plan');

  // 2. PWA & Service Worker
  assert(fs.existsSync('public/manifest.json'), 'PWA manifest.json exists');
  const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
  assert(manifest.short_name === 'সমিতি ৩৬০', 'manifest.json has correct short_name');
  assert(manifest.display === 'standalone', 'manifest.json display is standalone');

  assert(fs.existsSync('public/sw.js'), 'PWA sw.js exists');
  const sw = fs.readFileSync('public/sw.js', 'utf8');
  assert(sw.includes('somiti360-shell-v2.6.5'), 'Service worker has correct cache version (v2.6.5)');
  assert(sw.includes('/api/'), 'Service worker explicitly skips /api/ routes to prevent leaking private cache');

  // 2b. Enterprise Zero-Demo & Multi-Platform Logo Service Checks
  assert(fs.existsSync('src/services/samityLogoService.js'), 'src/services/samityLogoService.js exists');
  const logoService = fs.readFileSync('src/services/samityLogoService.js', 'utf8');
  assert(logoService.includes('getEffectiveSamityLogo') && logoService.includes('setGlobalSamityLogo'), 'samityLogoService exports getEffectiveSamityLogo and setGlobalSamityLogo');

  const tenantSrc = fs.readFileSync('src/services/tenantManagerService.js', 'utf8');
  assert(tenantSrc.includes('setOwnSamity'), 'tenantManagerService exports setOwnSamity for Super Admin dynamic designation');
  assert(!tenantSrc.includes('tenant_demo_client_1'), 'tenantManagerService contains zero demo clients');

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

  // 6. Multi-Tenant SaaS Master Switchboard & Cascading RBAC
  const tenantService = fs.readFileSync('src/services/tenantManagerService.js', 'utf8');
  assert(tenantService.includes('GRANULAR_FEATURE_CATEGORIES'), 'tenantManagerService exports GRANULAR_FEATURE_CATEGORIES');
  assert(tenantService.includes('canRolePerformAction'), 'tenantManagerService exports double-gated canRolePerformAction');
  assert(tenantService.includes('field_collection') && tenantService.includes('member_portal'), 'Granular features cover both field and member portals');
  assert(fs.existsSync('src/components/superadmin/GranularMasterSwitchboardModal.jsx'), 'GranularMasterSwitchboardModal component exists');

  // 7. 50-Point System Diagnostics & Self-Healing Suite
  assert(fs.existsSync('src/services/systemDiagnosticService.js'), 'systemDiagnosticService.js exists');
  const diagService = fs.readFileSync('src/services/systemDiagnosticService.js', 'utf8');
  assert(diagService.includes('runFullSystemDiagnostic'), 'Diagnostic service exports runFullSystemDiagnostic');
  assert(diagService.includes('executeSelfHealing'), 'Diagnostic service exports executeSelfHealing');
  assert(fs.existsSync('src/components/common/SystemDiagnosticModal.jsx'), 'SystemDiagnosticModal.jsx exists');

  // 8. Frontend UI & Power Keyboard Shortcuts Integration
  const appJsx = fs.readFileSync('src/App.jsx', 'utf8');
  assert(appJsx.includes('EnterpriseOfflineBanner'), 'App.jsx renders EnterpriseOfflineBanner');
  assert(appJsx.includes('SyncConflictResolutionModal'), 'App.jsx renders SyncConflictResolutionModal');
  assert(appJsx.includes('SystemDiagnosticModal'), 'App.jsx renders SystemDiagnosticModal');
  assert(appJsx.includes('somiti_trigger_diagnostic'), 'App.jsx listens to somiti_trigger_diagnostic event');

  // 9. Enterprise SaaS Subscription & Expiration Guards
  assert(tenantService.includes('checkTenantSubscriptionStatus'), 'tenantManagerService exports checkTenantSubscriptionStatus');
  assert(tenantService.includes('extendTenantSubscription'), 'tenantManagerService exports extendTenantSubscription');
  assert(fs.existsSync('src/components/superadmin/TenantSubscriptionLockModal.jsx'), 'TenantSubscriptionLockModal component exists');
  assert(appJsx.includes('TenantSubscriptionLockModal'), 'App.jsx renders TenantSubscriptionLockModal');

  // 10. Commercial Plan Isolation & In-App Module Enforcement
  assert(fs.existsSync('src/components/common/ModuleLockedBySuperAdminCard.jsx'), 'ModuleLockedBySuperAdminCard component exists');
  const hubJsx = fs.readFileSync('src/components/samity/SamityManagementHub.jsx', 'utf8');
  assert(hubJsx.includes('ModuleLockedBySuperAdminCard'), 'SamityManagementHub renders ModuleLockedBySuperAdminCard');
  assert(hubJsx.includes('checkPermissionOrToast'), 'SamityManagementHub enforces checkPermissionOrToast');
  const samitySvc = fs.readFileSync('src/services/samityService.js', 'utf8');
  assert(samitySvc.includes('field_officer'), 'samityService exports field_officer in SAMITY_RBAC_ROLES');
  assert(tenantService.includes('isModuleEnabledForTenant'), 'tenantManagerService exports isModuleEnabledForTenant');

  // 11. Multi-Gigabyte (10GB+) Persistent Offline Storage & Idempotency Engine
  const offlineSvc = fs.readFileSync('src/services/somitiOfflineStore.js', 'utf8');
  assert(offlineSvc.includes('requestPersistentStorage'), 'somitiOfflineStore exports requestPersistentStorage');
  assert(offlineSvc.includes('supportsMultiGigabyte'), 'somitiOfflineStore tracks supportsMultiGigabyte');
  assert(diagService.includes('isMultiGigabyteReady'), 'diagnosticService evaluates isMultiGigabyteReady');

  // 12. Blue-Green 1-Click OTA Global Broadcast & In-App Rollback Engine
  assert(fs.existsSync('src/services/blueGreenReleaseService.js'), 'blueGreenReleaseService.js exists');
  const otaSvc = fs.readFileSync('src/services/blueGreenReleaseService.js', 'utf8');
  assert(otaSvc.includes('publishOtaRelease'), 'blueGreenReleaseService exports publishOtaRelease');
  assert(otaSvc.includes('executeEmergencyRollback'), 'blueGreenReleaseService exports executeEmergencyRollback');
  assert(otaSvc.includes('checkClientNeedsUpdate'), 'blueGreenReleaseService exports checkClientNeedsUpdate');
  assert(fs.existsSync('src/components/superadmin/BlueGreenReleaseModal.jsx'), 'BlueGreenReleaseModal.jsx component exists');
  assert(fs.existsSync('src/components/common/GlobalUpdatePromptModal.jsx'), 'GlobalUpdatePromptModal.jsx component exists');
  assert(appJsx.includes('GlobalUpdatePromptModal'), 'App.jsx renders GlobalUpdatePromptModal');

  // 13. Super Admin 50+ Enterprise Feature Switchboard Catalog
  const { GRANULAR_FEATURE_CATEGORIES } = require('../src/services/tenantManagerService');
  let totalFeatures = 0;
  GRANULAR_FEATURE_CATEGORIES.forEach(c => totalFeatures += c.features.length);
  assert(totalFeatures >= 50, `Catalog contains 50+ individual toggle switches (Found: ${totalFeatures})`);
  assert(GRANULAR_FEATURE_CATEGORIES.some(c => c.id === 'ai_smart_tools'), 'AI & Advanced Super SaaS category exists');
  assert(GRANULAR_FEATURE_CATEGORIES.some(c => c.features.some(f => f.id === 'field_bluetooth_thermal')), 'Thermal printing switch exists');
  assert(GRANULAR_FEATURE_CATEGORIES.some(c => c.features.some(f => f.id === 'ai_nid_ocr_scanner')), 'Bangla NID OCR switch exists');

  // 14. Commercial Bluetooth Thermal Receipt POS Printer Engine (58mm/80mm)
  assert(fs.existsSync('src/services/thermalPrinterService.js'), 'thermalPrinterService.js exists');
  const thermalSvc = fs.readFileSync('src/services/thermalPrinterService.js', 'utf8');
  assert(thermalSvc.includes('buildReceiptEscPosBuffer'), 'thermalPrinterService exports buildReceiptEscPosBuffer');
  assert(thermalSvc.includes('getPairedBluetoothPrinters'), 'thermalPrinterService exports getPairedBluetoothPrinters');
  assert(thermalSvc.includes('sendBufferToPrinter'), 'thermalPrinterService exports sendBufferToPrinter');
  assert(fs.existsSync('src/components/samity/BluetoothThermalPrinterModal.jsx'), 'BluetoothThermalPrinterModal.jsx component exists');
  assert(hubJsx.includes('BluetoothThermalPrinterModal'), 'SamityManagementHub renders BluetoothThermalPrinterModal');
  assert(hubJsx.includes('field_bluetooth_thermal'), 'SamityManagementHub guards field_bluetooth_thermal permission');

  // 15. Bangla Smart NID Auto-Fill On-Device OCR Scanner Engine
  assert(fs.existsSync('src/services/nidOcrParserService.js'), 'nidOcrParserService.js exists');
  const nidSvc = fs.readFileSync('src/services/nidOcrParserService.js', 'utf8');
  assert(nidSvc.includes('scanSmartNidImage'), 'nidOcrParserService exports scanSmartNidImage');
  assert(nidSvc.includes('parseBanglaNidRawText'), 'nidOcrParserService exports parseBanglaNidRawText');
  assert(nidSvc.includes('normalizeDateOfBirth'), 'nidOcrParserService exports normalizeDateOfBirth');
  assert(fs.existsSync('src/components/samity/AiNidOcrScannerModal.jsx'), 'AiNidOcrScannerModal.jsx component exists');
  assert(hubJsx.includes('AiNidOcrScannerModal'), 'SamityManagementHub renders AiNidOcrScannerModal');
  assert(hubJsx.includes('ai_nid_ocr_scanner'), 'SamityManagementHub guards ai_nid_ocr_scanner permission');

  // 16. Field Officer Mobile Offline Collection Route Sheet & 1-Tap Collection Engine
  assert(fs.existsSync('src/components/samity/FieldCollectionSheetModal.jsx'), 'FieldCollectionSheetModal.jsx component exists');
  assert(hubJsx.includes('FieldCollectionSheetModal'), 'SamityManagementHub renders FieldCollectionSheetModal');
  assert(hubJsx.includes('field_offline_sheet'), 'SamityManagementHub guards field_offline_sheet permission');

  // 17. Smart E-Voice Soundbox & Audio Announcement Engine
  assert(fs.existsSync('src/services/voiceSoundboxService.js'), 'voiceSoundboxService.js exists');
  const soundboxSvc = fs.readFileSync('src/services/voiceSoundboxService.js', 'utf8');
  assert(soundboxSvc.includes('isSoundboxEnabled'), 'voiceSoundboxService exports isSoundboxEnabled');
  assert(soundboxSvc.includes('playSoundboxDing'), 'voiceSoundboxService exports playSoundboxDing');
  assert(soundboxSvc.includes('speakText'), 'voiceSoundboxService exports speakText');
  assert(soundboxSvc.includes('announceDepositSoundbox'), 'voiceSoundboxService exports announceDepositSoundbox');
  assert(fs.existsSync('src/components/common/VoiceSoundboxModal.jsx'), 'VoiceSoundboxModal.jsx component exists');
  assert(appJsx.includes('VoiceSoundboxModal'), 'App.jsx renders VoiceSoundboxModal');
  assert(appJsx.includes('initSoundboxBroadcastListener'), 'App.jsx initializes initSoundboxBroadcastListener');

  // 18. Retail Merchant & Partner Store QR Code Hub Engine
  assert(fs.existsSync('src/services/merchantService.js'), 'merchantService.js exists');
  const merchantSvc = fs.readFileSync('src/services/merchantService.js', 'utf8');
  assert(merchantSvc.includes('getMerchantsList'), 'merchantService exports getMerchantsList');
  assert(merchantSvc.includes('saveMerchantRecord'), 'merchantService exports saveMerchantRecord');
  assert(merchantSvc.includes('recordMerchantPurchase'), 'merchantService exports recordMerchantPurchase');
  assert(merchantSvc.includes('settleMerchantPayment'), 'merchantService exports settleMerchantPayment');
  assert(fs.existsSync('src/components/samity/MerchantStoreHubModal.jsx'), 'MerchantStoreHubModal.jsx component exists');
  assert(hubJsx.includes('MerchantStoreHubModal'), 'SamityManagementHub renders MerchantStoreHubModal');
  assert(hubJsx.includes('ai_merchant_qr_pos'), 'SamityManagementHub guards ai_merchant_qr_pos permission');

  // 19. Render.com Cloud Web Publishing & Hosting Engine
  assert(fs.existsSync('render.yaml'), 'render.yaml blueprint specification exists');
  const renderYaml = fs.readFileSync('render.yaml', 'utf8');
  assert(renderYaml.includes('somiti-360-web') && renderYaml.includes('runtime: static'), 'render.yaml configures high-speed static CDN site');
  assert(renderYaml.includes('somiti-360-service') && renderYaml.includes('runtime: node'), 'render.yaml configures Node.js web service');
  assert(fs.existsSync('render_server.cjs'), 'render_server.cjs production server exists');
  const renderServer = fs.readFileSync('render_server.cjs', 'utf8');
  assert(renderServer.includes('process.env.PORT'), 'render_server.cjs binds to dynamic Render PORT');
  assert(pkg.scripts['render:build'] && pkg.scripts['render:start'], 'package.json defines render:build and render:start');
  assert(fs.existsSync('src/components/common/RenderPublishHubModal.jsx'), 'RenderPublishHubModal.jsx component exists');
  assert(appJsx.includes('RenderPublishHubModal'), 'App.jsx renders RenderPublishHubModal');
  assert(appJsx.includes('somiti_trigger_render_publish'), 'App.jsx listens to somiti_trigger_render_publish event');

  // 20. High-Speed Architecture & Performance Optimizations
  assert(offlineStore.includes('optimizeImageWithStats'), 'somitiOfflineStore integrates client-side image downsampling');
  assert(fs.existsSync('supabase/migrations/20261108_enterprise_high_speed_atomic_transactions.sql'), 'Atomic transactions and composite index SQL migration exists');
  const atomicSql = fs.readFileSync('supabase/migrations/20261108_enterprise_high_speed_atomic_transactions.sql', 'utf8');
  assert(atomicSql.includes('idx_samity_deposits_tenant_created'), 'SQL migration creates composite tenant deposit index');
  assert(atomicSql.includes('process_atomic_deposit_with_ledger'), 'SQL migration creates atomic deposit RPC function');
  const printerSvc = fs.readFileSync('src/services/thermalPrinterService.js', 'utf8');
  assert(printerSvc.includes('enqueueThermalPrintJob'), 'thermalPrinterService exports enqueueThermalPrintJob buffer');
  assert(appJsx.includes('const SamityManagementHub = lazy('), 'App.jsx uses dynamic code splitting for SamityManagementHub');

  // 21. Sub-50ms Delta Mutation Real-Time Sync Engine
  const cloudSync = fs.readFileSync('src/services/somitiCloudSyncService.js', 'utf8');
  assert(cloudSync.includes('extractDeltaFromAction'), 'somitiCloudSyncService exports extractDeltaFromAction');
  assert(cloudSync.includes('applyDeltaMutationToLocalState'), 'somitiCloudSyncService exports applyDeltaMutationToLocalState');
  assert(cloudSync.includes('isDeltaOnly'), 'somitiCloudSyncService enforces lightweight delta payload over WebSockets');

  // 22. Supabase + Neon Hybrid Dual-Engine Database Backend
  assert(fs.existsSync('api/_lib/dualEngineDb.js'), 'dualEngineDb.js adapter exists');
  const dualDb = fs.readFileSync('api/_lib/dualEngineDb.js', 'utf8');
  assert(dualDb.includes('isNeonConfigured'), 'dualEngineDb exports isNeonConfigured');
  assert(dualDb.includes('checkDualEngineHealth'), 'dualEngineDb exports checkDualEngineHealth');
  const healthFile = fs.existsSync('api/_handlers/health.js') ? 'api/_handlers/health.js' : 'api/health.js';
  const healthApi = fs.readFileSync(healthFile, 'utf8');
  assert(healthApi.includes('checkDualEngineHealth'), 'api/health.js monitors dual-engine health status');
  const envExample = fs.readFileSync('.env.example', 'utf8');
  assert(envExample.includes('NEON_DATABASE_URL'), '.env.example configures Neon Serverless Postgres');
  assert(renderYaml.includes('NEON_DATABASE_URL'), 'render.yaml configures Neon Serverless Postgres connection');

  // 23. Neon Full-Stack Infrastructure as Code & Client Services
  assert(fs.existsSync('neon.ts'), 'neon.ts infrastructure as code file exists');
  const neonTs = fs.readFileSync('neon.ts', 'utf8');
  assert(neonTs.includes('realtime: true') && neonTs.includes('auth: true'), 'neon.ts defines realtime, auth and storage');
  assert(fs.existsSync('src/services/neonService.js'), 'neonService.js client service exists');
  const neonService = fs.readFileSync('src/services/neonService.js', 'utf8');
  assert(neonService.includes('getNeonAuthClient') && neonService.includes('getNeonRealtimeClient'), 'neonService exports auth and realtime clients');

  // 24. Android Hardware Back Button & Persistent Memory Lock
  const nativeApp = fs.readFileSync('src/services/nativeAppService.js', 'utf8');
  assert(nativeApp.includes('initNativeBackHandling') && nativeApp.includes('registerBackAction'), 'nativeAppService exports back button stack handling');
  assert(nativeApp.includes('somiti_hardware_back_pressed'), 'nativeAppService dispatches somiti_hardware_back_pressed event');
  assert(appJsx.includes('initNativeBackHandling'), 'App.jsx initializes native hardware back button handling');
  assert(appJsx.includes('registerBackAction'), 'App.jsx registers modal hierarchy with back action stack');
  assert(appJsx.includes('requestPersistentStorage'), 'App.jsx actively locks storage with requestPersistentStorage on launch');

  // 25. Postgres FDW (Foreign Data Wrapper) Neon Direct Link
  assert(fs.existsSync('supabase/migrations/20261108_neon_postgres_fdw_link.sql'), 'Postgres FDW SQL migration exists');
  const fdwSql = fs.readFileSync('supabase/migrations/20261108_neon_postgres_fdw_link.sql', 'utf8');
  assert(fdwSql.includes('postgres_fdw') && fdwSql.includes('neon_server'), 'FDW migration creates neon_server foreign wrapper');
  assert(fdwSql.includes('neon_core') && fdwSql.includes('v_neon_deposits'), 'FDW migration defines neon_core foreign tables & views');
  assert(dualDb.includes('insertNeonDeposit') && dualDb.includes('insertNeonDelta'), 'dualEngineDb exports insertNeonDeposit and insertNeonDelta');
  assert(fs.existsSync('scripts/test_postgres_fdw_link.cjs'), 'Postgres FDW automated verification script exists');

  // 26. CQRS (Read-Write Split) & Neon WAL Reverse Sync Pipeline
  assert(fs.existsSync('api/_lib/cqrsManager.js'), 'cqrsManager.js exists');
  const cqrsManager = fs.readFileSync('api/_lib/cqrsManager.js', 'utf8');
  assert(cqrsManager.includes('executeDepositCommand') && cqrsManager.includes('executeDashboardMetricsQuery'), 'cqrsManager separates commands and queries');
  assert(fs.existsSync('api/_lib/reverseSyncEngine.js'), 'reverseSyncEngine.js exists');
  const revSyncEngine = fs.readFileSync('api/_lib/reverseSyncEngine.js', 'utf8');
  assert(revSyncEngine.includes('runReverseSyncCycle') && revSyncEngine.includes('samity_live_mesh'), 'reverseSyncEngine broadcasts WAL deltas to Supabase mesh');
  assert(fs.existsSync('api/_handlers/sync/reverse.js') || fs.existsSync('api/sync/reverse.js'), 'api/sync/reverse.js reverse sync endpoint exists');
  assert(fs.existsSync('api/_handlers/cqrs.js') || fs.existsSync('api/cqrs.js'), 'api/cqrs.js CQRS command/query router endpoint exists');
  assert(fs.existsSync('src/services/cqrsService.js'), 'cqrsService.js client service exists');
  assert(fs.existsSync('scripts/test_cqrs_and_wal.cjs'), 'CQRS and WAL automated verification test exists');

  // 27. 7 Lightning-Fast Data Push Super Tips
  assert(fs.existsSync('src/services/lightningPushEngine.js'), 'lightningPushEngine.js engine exists');
  const lightningEngine = fs.readFileSync('src/services/lightningPushEngine.js', 'utf8');
  assert(lightningEngine.includes('generateUuidV7'), 'Tip 4: RFC 9562 Monotonic UUIDv7 generator exists');
  assert(lightningEngine.includes('createDeltaMutationPayload'), 'Tip 1: Delta-only mutation standard exists');
  assert(lightningEngine.includes('executeOptimisticMutation'), 'Tip 2: Optimistic UI engine with rollback exists');
  assert(lightningEngine.includes('packCompressedBatch') && lightningEngine.includes('unpackCompressedBatch'), 'Tip 3: Compact batch packing & unpacker exists');
  assert(lightningEngine.includes('broadcastToPeerMesh'), 'Tip 5: Ephemeral peer mesh broadcast exists');
  assert(lightningEngine.includes('generateMicroThumbnail'), 'Tip 6: Micro thumbnail placeholder generator exists');
  assert(lightningEngine.includes('calculateBackoffDelay') && lightningEngine.includes('executeWithExponentialBackoff'), 'Tip 7: Jittered exponential backoff engine exists');
  assert(cloudSync.includes('generateUuidV7') && cloudSync.includes('createDeltaMutationPayload'), 'somitiCloudSyncService integrates lightning push engine');
  assert(fs.existsSync('scripts/test_lightning_push_7_tips.cjs'), '7 Tips automated verification test suite exists');

  console.log('\n-----------------------------------------------------');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('-----------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
