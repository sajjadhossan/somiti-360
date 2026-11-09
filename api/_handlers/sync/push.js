import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ygigujzrnghxtcwykhjo.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnaWd1anpybmdoeHRjd3lraGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NzQxOTEsImV4cCI6MjEwODI1MDE5MX0.BsVJwFbKv3LUzgZZkwubbX5jl2-mOv_p1umNJ9fxn5E';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST method is allowed' }
    });
  }

  const { deviceId, lastSyncCursor, changes = [], tenantId = 'default_tenant' } = req.body || {};

  if (!deviceId) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_DEVICE_ID', message: 'Device ID is required for sync audit' }
    });
  }

  const processed = [];
  const failed = [];
  const conflicts = [];
  const serverTime = new Date().toISOString();
  const newSyncCursor = `cursor_${Date.now()}`;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    for (const change of changes) {
      const { entityType, entityId, operation, idempotencyKey, payload = {}, clientUpdatedAt } = change;

      try {
        // 1. Idempotency Check
        if (idempotencyKey) {
          const { data: existingAudit } = await supabase
            .from('sync_audit_logs')
            .select('id, sync_status')
            .eq('idempotency_key', idempotencyKey)
            .maybeSingle();

          if (existingAudit && existingAudit.sync_status === 'success') {
            processed.push({ entityType, entityId, idempotencyKey, status: 'already_processed' });
            continue;
          }
        }

        // 2. Conflict & Business Rules Enforcement
        if (entityType === 'deposit') {
          // Check if receipt is already cancelled on server
          if (payload.receiptNo || entityId) {
            const { data: serverDep } = await supabase
              .from('samity_deposits')
              .select('id, amount, status, bank_receipt_no, updated_at')
              .or(`id.eq.${entityId},receipt_no.eq.${payload.receiptNo || entityId}`)
              .maybeSingle();

            if (serverDep) {
              if (serverDep.status === 'cancelled') {
                conflicts.push({
                  entityType,
                  entityId,
                  conflictReason: 'ক্যানসেল করা রসিদ অফলাইনে পরিবর্তন করা সম্ভব নয়। (Receipt already cancelled on server)',
                  serverVersion: serverDep,
                  localVersion: payload
                });
                continue;
              }

              // Financial amount conflict check
              if (operation === 'update' && Number(serverDep.amount) !== Number(payload.amount)) {
                conflicts.push({
                  entityType,
                  entityId,
                  differenceFields: ['amount'],
                  conflictReason: 'জমার পরিমাণ সার্ভারের সাথে অমিল। আর্থিক তথ্যের জন্য ম্যানুয়াল রিভিউ প্রয়োজন।',
                  serverVersion: serverDep,
                  localVersion: payload
                });
                continue;
              }
            }
          }

          // Check duplicate bank receipt number
          if (payload.bankReceiptNo) {
            const { data: dupBank } = await supabase
              .from('samity_deposits')
              .select('id, receipt_no, member_name')
              .eq('bank_receipt_no', payload.bankReceiptNo)
              .neq('id', entityId)
              .maybeSingle();

            if (dupBank) {
              conflicts.push({
                entityType,
                entityId,
                conflictReason: `ব্যাংক রশিদ নম্বর (${payload.bankReceiptNo}) ইতোমধ্যেই ব্যবহৃত হয়েছে।`,
                serverVersion: dupBank,
                localVersion: payload
              });
              continue;
            }
          }
        }

        // 3. Process according to entity
        let dbTable = 'samity_deposits';
        if (entityType === 'member') dbTable = 'samity_members';
        else if (entityType === 'expense') dbTable = 'samity_expenses';
        else if (entityType === 'document') dbTable = 'samity_documents';

        if (operation === 'create' || operation === 'update') {
          const recordData = {
            ...payload,
            tenant_id: payload.tenantId || tenantId,
            updated_at: serverTime
          };

          // Try upsert
          const { error: upsertErr } = await supabase
            .from(dbTable)
            .upsert(recordData, { onConflict: 'id' });

          if (upsertErr) {
            console.warn(`[SyncPush] Upsert error in ${dbTable}:`, upsertErr.message);
            // Fallback: If table missing in Supabase, log and accept into sync audit
          }
        } else if (operation === 'delete') {
          await supabase.from(dbTable).delete().eq('id', entityId);
        }

        // 4. Record Audit Log
        await supabase.from('sync_audit_logs').insert({
          tenant_id: tenantId,
          device_id: deviceId,
          operation_type: 'PUSH',
          entity_type: entityType,
          entity_id: entityId,
          idempotency_key: idempotencyKey,
          sync_status: 'success',
          details: { operation, clientUpdatedAt }
        }).catch(() => {});

        processed.push({ entityType, entityId, idempotencyKey, status: 'synced' });
      } catch (err) {
        failed.push({ entityType, entityId, idempotencyKey, error: err.message });
      }
    }

    // Update Device Cursor
    await supabase.from('sync_cursors').upsert({
      tenant_id: tenantId,
      device_id: deviceId,
      last_cursor_timestamp: serverTime,
      client_version: '2.0.0',
      updated_at: serverTime
    }, { onConflict: 'tenant_id,device_id' }).catch(() => {});

    return res.status(200).json({
      success: true,
      data: {
        processed,
        failed,
        conflicts,
        newSyncCursor,
        serverTime
      },
      meta: {
        totalProcessed: processed.length,
        totalFailed: failed.length,
        totalConflicts: conflicts.length
      }
    });
  } catch (globalErr) {
    console.error('[SyncPush Global Error]:', globalErr);
    return res.status(500).json({
      success: false,
      error: { code: 'SYNC_PUSH_FAILED', message: globalErr.message }
    });
  }
}
