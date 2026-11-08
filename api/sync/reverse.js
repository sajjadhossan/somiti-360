/**
 * Somiti 360 - Neon WAL Reverse Sync Endpoint
 * Triggers bidirectional replication cycle from Neon WAL deltas to Supabase Realtime Mesh
 */

import { runReverseSyncCycle, getReverseSyncStatus } from '../_lib/reverseSyncEngine.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const status = await getReverseSyncStatus();
    return res.status(200).json({
      success: true,
      service: 'NEON_WAL_REVERSE_SYNC',
      status
    });
  }

  if (req.method === 'POST') {
    const { limit = 50, tenantId } = req.body || {};
    const result = await runReverseSyncCycle({ limit, tenantId });
    return res.status(200).json({
      success: result.success,
      replicatedCount: result.replicatedCount,
      lastCursor: result.lastCursor,
      durationMs: result.durationMs,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(405).json({
    success: false,
    error: 'Method Not Allowed'
  });
}
