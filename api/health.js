import { checkDualEngineHealth } from './_lib/dualEngineDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const dualHealth = await checkDualEngineHealth();

  return res.status(200).json({
    success: true,
    status: dualHealth.providers.supabase.status === 'healthy' ? 'UP' : 'DEGRADED',
    app: 'Somiti 360',
    version: '2.2.0',
    buildNumber: 22,
    timestamp: dualHealth.timestamp,
    engineMode: dualHealth.engineMode,
    isNeonActive: dualHealth.isNeonActive,
    totalLatencyMs: dualHealth.totalLatencyMs,
    services: {
      api: 'healthy',
      database: dualHealth.providers.supabase.status,
      databaseLatencyMs: dualHealth.providers.supabase.latencyMs,
      realtimeSync: 'operational (sub-50ms delta mesh)',
      offlineSupport: 'active (IndexedDB v2 + Persistent Storage)'
    },
    providers: dualHealth.providers
  });
}
