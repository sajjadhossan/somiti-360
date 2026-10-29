import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ygigujzrnghxtcwykhjo.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnaWd1anpybmdoeHRjd3lraGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDUwMDUsImV4cCI6MjA1OTA4MTAwNX0.uFk-rN_sM7V679hYVl08R1j17uFjK50M5h7K6wR4vP8';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { documentType, documentId, token } = req.query;

  if (!documentId) {
    return res.status(400).json({
      success: false,
      errorCode: 'MISSING_DOCUMENT_ID',
      message: 'Document ID is required.'
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Fetch document by id or document_number
    const { data: doc, error } = await supabase
      .from('documents')
      .select('*')
      .or(`id.eq.${documentId},document_number.eq.${documentId}`)
      .maybeSingle();

    if (error) {
      console.error('Supabase query error:', error);
    }

    if (!doc) {
      return res.status(404).json({
        success: false,
        isValid: false,
        status: 'not_found',
        message: 'ডকুমেন্টটি কেন্দ্রীয় ক্লাউড ডাটাবেজে পাওয়া যায়নি।'
      });
    }

    const isCancelled = doc.status === 'cancelled';
    const isExpired = doc.status === 'expired';

    // Log verification audit asynchronously
    try {
      await supabase.from('document_verifications').insert({
        document_id: doc.id,
        document_number: doc.document_number,
        verification_status: isCancelled ? 'cancelled' : 'valid',
        ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
        user_agent: req.headers['user-agent'] || 'unknown',
        verified_at: new Date().toISOString()
      });
    } catch (_) {}

    return res.status(200).json({
      success: true,
      isValid: !isCancelled && !isExpired,
      status: doc.status || 'valid',
      data: {
        documentId: doc.id,
        documentNumber: doc.document_number,
        documentType: doc.document_type || documentType || 'receipt',
        title: doc.title,
        samityId: doc.samity_id,
        samityName: doc.metadata?.samityName || 'স্বপ্নছোঁয়া সমবায় সমিতি',
        issueDate: doc.issue_date,
        recipientName: doc.recipient_name,
        amount: doc.amount,
        currency: doc.currency || 'BDT',
        status: doc.status,
        cancellationReason: doc.cancellation_reason || null,
        cancelledAt: doc.cancelled_at || null,
        metadata: doc.metadata || {},
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Verify API error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server verification error',
      error: err.message
    });
  }
}

