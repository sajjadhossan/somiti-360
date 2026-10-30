import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ygigujzrnghxtcwykhjo.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnaWd1anpybmdoeHRjd3lraGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NzQxOTEsImV4cCI6MjEwODI1MDE5MX0.BsVJwFbKv3LUzgZZkwubbX5jl2-mOv_p1umNJ9fxn5E';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { tenantId = 'default_tenant', deviceId } = req.query;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Check database responsiveness
    const { count: depositCount, error: dbErr } = await supabase
      .from('samity_deposits')
      .select('*', { count: 'exact', head: true });

    let lastDeviceSync = null;
    if (deviceId) {
      const { data: cursor } = await supabase
        .from('sync_cursors')
        .select('*')
        .eq('device_id', deviceId)
        .maybeSingle();
      lastDeviceSync = cursor;
    }

    const { count: conflictCount } = await supabase
      .from('sync_conflicts')
      .select('*', { count: 'exact', head: true })
      .eq('resolution_status', 'unresolved')
      .catch(() => ({ count: 0 }));

    return res.status(200).json({
      success: true,
      data: {
        serverTime: new Date().toISOString(),
        cloudDatabaseOnline: !dbErr,
        tenantId,
        deviceId: deviceId || null,
        lastDeviceSync,
        unresolvedConflicts: conflictCount || 0,
        totalDepositsInCloud: depositCount || 0,
        version: '2.0.0'
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SYNC_STATUS_ERROR', message: err.message }
    });
  }
}
