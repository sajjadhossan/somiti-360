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

  const { deviceId, tenantId = 'default_tenant', items = [] } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'EMPTY_PAYLOAD', message: 'items array is required' }
    });
  }

  const serverTime = new Date().toISOString();
  let successCount = 0;
  let failureCount = 0;
  const errors = [];

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    for (const item of items) {
      try {
        const { entityType = 'deposit', payload = {}, idempotencyKey } = item;
        let table = 'samity_deposits';
        if (entityType === 'member') table = 'samity_members';
        else if (entityType === 'expense') table = 'samity_expenses';

        await supabase.from(table).upsert({
          ...payload,
          tenant_id: payload.tenantId || tenantId,
          updated_at: serverTime
        }, { onConflict: 'id' });

        successCount++;
      } catch (e) {
        failureCount++;
        errors.push({ id: item.idempotencyKey, error: e.message });
      }
    }

    return res.status(200).json({
      success: failureCount === 0,
      data: {
        totalReceived: items.length,
        successCount,
        failureCount,
        errors,
        serverTime
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'BULK_SYNC_ERROR', message: err.message }
    });
  }
}
