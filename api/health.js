import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ygigujzrnghxtcwykhjo.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnaWd1anpybmdoeHRjd3lraGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NzQxOTEsImV4cCI6MjEwODI1MDE5MX0.BsVJwFbKv3LUzgZZkwubbX5jl2-mOv_p1umNJ9fxn5E';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const startTime = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { error } = await supabase.from('samity_deposits').select('id', { count: 'exact', head: true }).limit(1);
    dbLatencyMs = Date.now() - startTime;
    if (error) {
      dbStatus = 'degraded';
    }
  } catch (e) {
    dbStatus = 'unavailable';
    dbLatencyMs = Date.now() - startTime;
  }

  return res.status(200).json({
    success: true,
    status: dbStatus === 'healthy' ? 'UP' : 'DEGRADED',
    app: 'Somiti 360',
    version: '2.0.0',
    buildNumber: 20,
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      database: dbStatus,
      databaseLatencyMs: dbLatencyMs,
      realtimeSync: 'operational',
      offlineSupport: 'active'
    }
  });
}
