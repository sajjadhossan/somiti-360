/**
 * Somiti 360 - Enterprise CQRS (Command Query Responsibility Segregation) Manager
 * -------------------------------------------------------------------------------
 * Separates transactional Writes (Commands) from non-blocking Reads (Queries):
 *  - Commands: ACID Transactions, Idempotency Guard, Auto WAL Delta Stream (Neon Pooler)
 *  - Queries: High-Throughput Read Pipeline, Aggregated Metrics, In-Memory Caching
 */

import { getNeonSql, isNeonConfigured, getSupabaseClient } from './dualEngineDb.js';

// In-memory read cache with 15-second TTL for non-blocking read acceleration
const queryCache = new Map();
const CACHE_TTL_MS = 15000;

function getCachedResult(key) {
  const cached = queryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  return null;
}

function setCachedResult(key, data) {
  queryCache.set(key, { data, timestamp: Date.now() });
  // Evict old entries if cache grows
  if (queryCache.size > 200) {
    const oldestKey = queryCache.keys().next().value;
    queryCache.delete(oldestKey);
  }
}

export function invalidateQueryCache(tenantId) {
  for (const key of queryCache.keys()) {
    if (key.includes(tenantId)) {
      queryCache.delete(key);
    }
  }
}

// ============================================================================
// 1. COMMAND SIDE (WRITES - STRICT ACID ISOLATION ON NEON POOLER)
// ============================================================================

/**
 * Command: Record Deposit with Member Balance Atomic Rollup
 */
export async function executeDepositCommand({ deposit, tenantId = 'tenant_main', actorId = 'system' }) {
  const sql = getNeonSql();
  const startTime = Date.now();

  const depId = deposit.id || ('dep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
  const memberId = deposit.member_id || deposit.memberId;
  const amount = parseFloat(deposit.amount) || 0;
  const idempotencyKey = deposit.idempotency_key || deposit.idempotencyKey || depId;

  if (!memberId || amount <= 0) {
    throw new Error('VALIDATION_FAILED: Member ID and positive amount required');
  }

  // 1. Check Idempotency Guard
  const existing = await sql`
    SELECT id, status, amount, created_at 
    FROM public.samity_deposits 
    WHERE idempotency_key = ${idempotencyKey} 
    LIMIT 1;
  `;

  if (existing.length > 0) {
    return {
      success: true,
      command: 'RECORD_DEPOSIT',
      isDuplicate: true,
      depositId: existing[0].id,
      amount: existing[0].amount,
      executionMs: Date.now() - startTime
    };
  }

  // 2. Insert Deposit and Update Member Balance Atomically
  const result = await sql`
    WITH inserted_deposit AS (
      INSERT INTO public.samity_deposits (
        id, tenant_id, member_id, amount, deposit_type, payment_method,
        collector_id, collector_name, receipt_no, status, is_synced,
        sync_version, idempotency_key, created_at, updated_at
      ) VALUES (
        ${depId}, ${tenantId}, ${memberId}, ${amount},
        ${deposit.deposit_type || deposit.type || 'savings'},
        ${deposit.payment_method || deposit.paymentMethod || 'cash'},
        ${deposit.collector_id || deposit.collectorId || actorId},
        ${deposit.collector_name || deposit.collectorName || 'ফিল্ড অফিসার'},
        ${deposit.receipt_no || deposit.receiptNo || ('RCT-' + Date.now().toString().slice(-6))},
        'approved', true, 1, ${idempotencyKey}, now(), now()
      )
      RETURNING *
    ),
    updated_member AS (
      UPDATE public.samity_members
      SET 
        balance = COALESCE(balance, 0) + ${amount},
        total_deposited = COALESCE(total_deposited, 0) + ${amount},
        updated_at = now()
      WHERE id = ${memberId} AND tenant_id = ${tenantId}
      RETURNING balance, total_deposited
    )
    SELECT 
      (SELECT id FROM inserted_deposit) as deposit_id,
      (SELECT amount FROM inserted_deposit) as deposit_amount,
      (SELECT balance FROM updated_member) as updated_balance;
  `;

  invalidateQueryCache(tenantId);

  return {
    success: true,
    command: 'RECORD_DEPOSIT',
    depositId: result[0]?.deposit_id || depId,
    amount,
    updatedBalance: result[0]?.updated_balance || null,
    executionMs: Date.now() - startTime
  };
}

/**
 * Command: Create Member Profile in Core Ledger
 */
export async function executeMemberCreateCommand({ member, tenantId = 'tenant_main' }) {
  const sql = getNeonSql();
  const startTime = Date.now();

  const memberId = member.id || ('mem_' + Date.now());
  const initialBalance = parseFloat(member.balance) || 0;

  const rows = await sql`
    INSERT INTO public.samity_members (
      id, tenant_id, account_number, name, phone, nid,
      balance, total_deposited, total_withdrawn, status,
      is_synced, sync_version, created_at, updated_at
    ) VALUES (
      ${memberId}, ${tenantId},
      ${member.account_number || member.accountNumber || ('AC-' + Date.now().toString().slice(-5))},
      ${member.name},
      ${member.phone || null},
      ${member.nid || null},
      ${initialBalance},
      ${initialBalance},
      0.00,
      ${member.status || 'active'},
      true, 1, now(), now()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      phone = EXCLUDED.phone,
      updated_at = now()
    RETURNING *;
  `;

  invalidateQueryCache(tenantId);

  return {
    success: true,
    command: 'CREATE_MEMBER',
    memberId: rows[0].id,
    executionMs: Date.now() - startTime
  };
}

/**
 * Command: Cancel Deposit / Receipt with Balance Reversal
 */
export async function executeCancelReceiptCommand({ depositId, tenantId = 'tenant_main', reason = 'ভুল এন্ট্রি সংশোধন' }) {
  const sql = getNeonSql();
  const startTime = Date.now();

  const dep = await sql`
    SELECT id, member_id, amount, status 
    FROM public.samity_deposits 
    WHERE id = ${depositId} AND tenant_id = ${tenantId} AND deleted_at IS NULL
    LIMIT 1;
  `;

  if (!dep.length) {
    throw new Error('DEPOSIT_NOT_FOUND_OR_ALREADY_CANCELLED');
  }

  const amount = parseFloat(dep[0].amount) || 0;
  const memberId = dep[0].member_id;

  await sql`
    WITH cancelled_dep AS (
      UPDATE public.samity_deposits
      SET 
        status = 'cancelled',
        deleted_at = now(),
        updated_at = now()
      WHERE id = ${depositId} AND tenant_id = ${tenantId}
      RETURNING *
    )
    UPDATE public.samity_members
    SET 
      balance = GREATEST(0, COALESCE(balance, 0) - ${amount}),
      total_deposited = GREATEST(0, COALESCE(total_deposited, 0) - ${amount}),
      updated_at = now()
    WHERE id = ${memberId} AND tenant_id = ${tenantId};
  `;

  invalidateQueryCache(tenantId);

  return {
    success: true,
    command: 'CANCEL_RECEIPT',
    depositId,
    reversedAmount: amount,
    memberId,
    reason,
    executionMs: Date.now() - startTime
  };
}

// ============================================================================
// 2. QUERY SIDE (READS - HIGH THROUGHPUT, AGGREGATED CACHED READS)
// ============================================================================

/**
 * Query: Dashboard Executive Metrics (Members count, deposits sum, today's collection)
 */
export async function executeDashboardMetricsQuery({ tenantId = 'tenant_main' }) {
  const cacheKey = `dashboard_metrics_${tenantId}`;
  const cached = getCachedResult(cacheKey);
  if (cached) return { ...cached, isCached: true };

  const sql = getNeonSql();
  const startTime = Date.now();

  const rows = await sql`
    SELECT
      (SELECT COUNT(*) FROM public.samity_members WHERE tenant_id = ${tenantId} AND deleted_at IS NULL) as total_members,
      (SELECT COALESCE(SUM(balance), 0) FROM public.samity_members WHERE tenant_id = ${tenantId} AND deleted_at IS NULL) as total_member_balance,
      (SELECT COUNT(*) FROM public.samity_deposits WHERE tenant_id = ${tenantId} AND deleted_at IS NULL) as total_deposits_count,
      (SELECT COALESCE(SUM(amount), 0) FROM public.samity_deposits WHERE tenant_id = ${tenantId} AND deleted_at IS NULL) as total_deposits_volume,
      (SELECT COUNT(*) FROM public.samity_deposits WHERE tenant_id = ${tenantId} AND created_at >= CURRENT_DATE AND deleted_at IS NULL) as today_deposits_count,
      (SELECT COALESCE(SUM(amount), 0) FROM public.samity_deposits WHERE tenant_id = ${tenantId} AND created_at >= CURRENT_DATE AND deleted_at IS NULL) as today_deposits_volume;
  `;

  const data = {
    totalMembers: parseInt(rows[0]?.total_members || 0, 10),
    totalMemberBalance: parseFloat(rows[0]?.total_member_balance || 0),
    totalDepositsCount: parseInt(rows[0]?.total_deposits_count || 0, 10),
    totalDepositsVolume: parseFloat(rows[0]?.total_deposits_volume || 0),
    todayDepositsCount: parseInt(rows[0]?.today_deposits_count || 0, 10),
    todayDepositsVolume: parseFloat(rows[0]?.today_deposits_volume || 0),
    executionMs: Date.now() - startTime,
    timestamp: new Date().toISOString()
  };

  setCachedResult(cacheKey, data);
  return { ...data, isCached: false };
}

/**
 * Query: Member Directory (Fast Paginated Query with Search Filter)
 */
export async function executeMemberDirectoryQuery({ tenantId = 'tenant_main', search = '', limit = 50, offset = 0 }) {
  const sql = getNeonSql();
  const startTime = Date.now();

  let rows;
  if (search) {
    const term = `%${search}%`;
    rows = await sql`
      SELECT id, account_number, name, phone, nid, balance, status, created_at
      FROM public.samity_members
      WHERE tenant_id = ${tenantId} AND deleted_at IS NULL
        AND (name ILIKE ${term} OR phone ILIKE ${term} OR account_number ILIKE ${term})
      ORDER BY name ASC
      LIMIT ${limit} OFFSET ${offset};
    `;
  } else {
    rows = await sql`
      SELECT id, account_number, name, phone, nid, balance, status, created_at
      FROM public.samity_members
      WHERE tenant_id = ${tenantId} AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset};
    `;
  }

  return {
    members: rows,
    count: rows.length,
    executionMs: Date.now() - startTime
  };
}

/**
 * Unified CQRS Command Dispatcher
 */
export async function dispatchCqrsCommand(commandName, payload, options = {}) {
  switch (commandName) {
    case 'RECORD_DEPOSIT':
      return await executeDepositCommand({ deposit: payload, ...options });
    case 'CREATE_MEMBER':
      return await executeMemberCreateCommand({ member: payload, ...options });
    case 'CANCEL_RECEIPT':
      return await executeCancelReceiptCommand({ depositId: payload.depositId, ...options });
    default:
      throw new Error(`UNKNOWN_COMMAND: ${commandName}`);
  }
}

/**
 * Unified CQRS Query Dispatcher
 */
export async function dispatchCqrsQuery(queryName, params = {}) {
  switch (queryName) {
    case 'DASHBOARD_METRICS':
      return await executeDashboardMetricsQuery(params);
    case 'MEMBER_DIRECTORY':
      return await executeMemberDirectoryQuery(params);
    default:
      throw new Error(`UNKNOWN_QUERY: ${queryName}`);
  }
}
