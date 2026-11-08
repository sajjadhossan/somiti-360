/**
 * Somiti 360 - Neon WAL (Write-Ahead Log) Reverse Sync Engine
 * ----------------------------------------------------------------------------
 * Bridges Neon transactional commits into Supabase Realtime WebSocket Mesh:
 * 1. Pulls newly captured WAL delta rows from Neon's `public.samity_sync_deltas`
 * 2. Broadcasts lightweight (<2KB) mutation packets to Supabase Realtime channel
 * 3. Connected Web PWA, Android APK, and Desktop devices update in sub-50ms
 */

import { getNeonSql, getSupabaseClient, isNeonConfigured } from './dualEngineDb.js';

let lastReplicatedTimestamp = new Date(Date.now() - 60000).toISOString();

/**
 * Executes a Reverse Sync cycle from Neon WAL to Supabase Realtime Mesh
 */
export async function runReverseSyncCycle({ limit = 50, tenantId = null } = {}) {
  if (!isNeonConfigured()) {
    return {
      success: false,
      message: 'Neon is not configured. Reverse sync skipped.',
      replicatedCount: 0
    };
  }

  const startTime = Date.now();
  const sql = getNeonSql();
  const supabase = getSupabaseClient();

  // 1. Fetch un-replicated deltas from Neon
  let deltas = [];
  try {
    if (tenantId) {
      deltas = await sql`
        SELECT id, tenant_id, table_name, record_id, action, delta_payload, created_at
        FROM public.samity_sync_deltas
        WHERE created_at > ${lastReplicatedTimestamp} AND tenant_id = ${tenantId}
        ORDER BY created_at ASC
        LIMIT ${limit};
      `;
    } else {
      deltas = await sql`
        SELECT id, tenant_id, table_name, record_id, action, delta_payload, created_at
        FROM public.samity_sync_deltas
        WHERE created_at > ${lastReplicatedTimestamp}
        ORDER BY created_at ASC
        LIMIT ${limit};
      `;
    }
  } catch (err) {
    console.warn('[ReverseSync] Delta query error:', err.message);
    return { success: false, error: err.message, replicatedCount: 0 };
  }

  if (deltas.length === 0) {
    return {
      success: true,
      replicatedCount: 0,
      lastCursor: lastReplicatedTimestamp,
      durationMs: Date.now() - startTime
    };
  }

  // 2. Broadcast each delta mutation to Supabase Realtime channel
  const channel = supabase.channel('samity_live_mesh');
  let broadcastCount = 0;

  for (const delta of deltas) {
    try {
      await channel.send({
        type: 'broadcast',
        event: 'samity_delta_mutation',
        payload: {
          id: delta.id,
          tenant_id: delta.tenant_id,
          table: delta.table_name,
          record_id: delta.record_id,
          action: delta.action,
          delta: delta.delta_payload,
          source: 'neon_wal_cdc',
          isDeltaOnly: true,
          timestamp: delta.created_at
        }
      });
      broadcastCount++;
    } catch (err) {
      console.warn('[ReverseSync] Broadcast warning for delta', delta.id, err.message);
    }
  }

  // Update cursor to the newest delta timestamp
  const newestTimestamp = deltas[deltas.length - 1].created_at;
  if (newestTimestamp) {
    lastReplicatedTimestamp = newestTimestamp;
  }

  return {
    success: true,
    replicatedCount: broadcastCount,
    deltasFound: deltas.length,
    lastCursor: lastReplicatedTimestamp,
    durationMs: Date.now() - startTime
  };
}

/**
 * Gets the current Reverse Sync status and newest WAL cursor
 */
export async function getReverseSyncStatus() {
  if (!isNeonConfigured()) {
    return { status: 'disabled', totalPendingDeltas: 0 };
  }

  try {
    const sql = getNeonSql();
    const rows = await sql`
      SELECT 
        COUNT(*) as total_deltas,
        MAX(created_at) as newest_delta_time
      FROM public.samity_sync_deltas;
    `;

    return {
      status: 'active',
      totalDeltasLogged: parseInt(rows[0]?.total_deltas || 0, 10),
      newestDeltaTime: rows[0]?.newest_delta_time || null,
      lastCursor: lastReplicatedTimestamp,
      channel: 'samity_live_mesh',
      event: 'samity_delta_mutation'
    };
  } catch (err) {
    return { status: 'error', error: err.message };
  }
}
