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

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only GET method is allowed' }
    });
  }

  const { since, entities = 'members,deposits,receipts,expenses,documents', tenantId = 'default_tenant', limit = 200 } = req.query;

  const serverTime = new Date().toISOString();
  const newSyncCursor = `cursor_${Date.now()}`;
  const requestedEntities = entities.split(',').map(e => e.trim());

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const result = {
      success: true,
      members: [],
      deposits: [],
      receipts: [],
      expenses: [],
      documents: [],
      deletedIds: [],
      newSyncCursor,
      serverTime
    };

    // 1. Deposits
    if (requestedEntities.includes('deposits') || requestedEntities.includes('receipts')) {
      let query = supabase.from('samity_deposits').select('*').limit(Number(limit) || 200);
      if (tenantId && tenantId !== 'all') {
        query = query.eq('tenant_id', tenantId);
      }
      if (since && since.startsWith('20')) {
        query = query.gt('updated_at', since);
      }
      const { data: depositsData } = await query;
      if (depositsData) {
        result.deposits = depositsData;
        result.receipts = depositsData.filter(d => d.receipt_no).map(d => ({
          id: d.receipt_no,
          depositId: d.id,
          receiptNo: d.receipt_no,
          amount: d.amount,
          date: d.date,
          status: d.status,
          verificationCode: d.short_verification_code
        }));
      }
    }

    // 2. Members
    if (requestedEntities.includes('members')) {
      let query = supabase.from('samity_members').select('*').limit(Number(limit) || 200);
      if (tenantId && tenantId !== 'all') {
        query = query.eq('tenant_id', tenantId);
      }
      const { data: membersData } = await query;
      if (membersData) result.members = membersData;
    }

    // 3. Expenses
    if (requestedEntities.includes('expenses')) {
      let query = supabase.from('samity_expenses').select('*').limit(Number(limit) || 200);
      if (tenantId && tenantId !== 'all') {
        query = query.eq('tenant_id', tenantId);
      }
      const { data: expensesData } = await query;
      if (expensesData) result.expenses = expensesData;
    }

    // 4. Documents
    if (requestedEntities.includes('documents')) {
      let query = supabase.from('samity_documents').select('*').limit(Number(limit) || 200);
      if (tenantId && tenantId !== 'all') {
        query = query.eq('tenant_id', tenantId);
      }
      const { data: docData } = await query;
      if (docData) result.documents = docData;
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('[SyncPull Error]:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SYNC_PULL_FAILED', message: err.message }
    });
  }
}
