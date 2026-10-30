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

  const { conflictId, choice, resolvedPayload, resolvedBy = 'admin' } = req.body || {};

  if (!conflictId || !choice) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'conflictId and choice (keep_server | keep_local | merged) are required' }
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Update server table if local or merged choice is approved
    if ((choice === 'keep_local' || choice === 'merged') && resolvedPayload) {
      const entityType = resolvedPayload.entityType || 'deposit';
      let table = 'samity_deposits';
      if (entityType === 'member') table = 'samity_members';
      else if (entityType === 'expense') table = 'samity_expenses';

      await supabase.from(table).upsert({
        ...resolvedPayload,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    }

    // Mark conflict resolved in sync_conflicts
    await supabase.from('sync_conflicts').update({
      resolution_status: 'resolved',
      resolution_choice: choice,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', conflictId).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'কনফ্লিক্ট সফলভাবে সমাধান করা হয়েছে (Conflict successfully resolved)',
      data: {
        conflictId,
        choice,
        resolvedBy,
        resolvedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'CONFLICT_RESOLVE_FAILED', message: err.message }
    });
  }
}
