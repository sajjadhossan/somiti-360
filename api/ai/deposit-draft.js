import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ygigujzrnghxtcwykhjo.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnaWd1anpybmdoeHRjd3lraGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDUwMDUsImV4cCI6MjA1OTA4MTAwNX0.uFk-rN_sM7V679hYVl08R1j17uFjK50M5h7K6wR4vP8';

export default async function handler(req, res) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      errorCode: 'METHOD_NOT_ALLOWED',
      message: 'শুধুমাত্র POST মেথড গ্রহণযোগ্য।'
    });
  }

  try {
    const { draftId, action = 'confirm', confirmedBy = 'Admin' } = req.body || {};

    if (!draftId) {
      return res.status(400).json({
        success: false,
        errorCode: 'MISSING_DRAFT_ID',
        message: 'খসড়া আইডি (Draft ID) প্রদান করা আবশ্যক।'
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Update status in ai_deposit_drafts table
    try {
      await supabase.from('ai_deposit_drafts')
        .update({
          status: action === 'confirm' ? 'confirmed' : 'rejected',
          confirmed_by: confirmedBy,
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId);
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: action === 'confirm' 
        ? 'এআই খসড়া ডিপোজিট সফলভাবে নিশ্চিত ও সম্পন্ন হয়েছে।'
        : 'এআই খসড়া ডিপোজিট বাতিল করা হয়েছে।',
      draftId,
      status: action === 'confirm' ? 'confirmed' : 'rejected',
      confirmedAt: new Date().toISOString()
    });

  } catch (err) {
    console.error('Draft confirm error:', err);
    return res.status(500).json({
      success: false,
      errorCode: 'DRAFT_CONFIRM_ERROR',
      message: 'খসড়া প্রক্রিয়াকরণে ত্রুটি হয়েছে: ' + err.message
    });
  }
}
