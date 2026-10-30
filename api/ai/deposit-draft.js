import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ygigujzrnghxtcwykhjo.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnaWd1anpybmdoeHRjd3lraGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDUwMDUsImV4cCI6MjA1OTA4MTAwNX0.uFk-rN_sM7V679hYVl08R1j17uFjK50M5h7K6wR4vP8';

export default async function handler(req, res) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // 1. GET: Fetch active AI deposit drafts (filtered by tenant or member)
  if (req.method === 'GET') {
    try {
      const { tenantId = 'SAMITY-001', memberId, status = 'ai_draft' } = req.query;
      let query = supabase.from('ai_deposit_drafts').select('*').eq('tenant_id', tenantId);

      if (status) query = query.eq('status', status);
      if (memberId) query = query.eq('member_id', memberId);

      const { data: drafts, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.status(200).json({
        success: true,
        count: drafts?.length || 0,
        data: drafts || []
      });
    } catch (getErr) {
      return res.status(500).json({ success: false, message: getErr.message });
    }
  }

  // 2. POST: Save, Confirm, or Reject Draft
  if (req.method === 'POST') {
    try {
      const {
        action = 'save', // 'save', 'confirm', 'reject'
        draftId,
        memberId,
        scanId,
        tenantId = 'SAMITY-001',
        depositData = {},
        confirmedBy = 'Admin'
      } = req.body || {};

      // 4.2 Save AI Draft
      if (action === 'save') {
        const {
          depositorType = 'self',
          depositorName,
          depositorRelationship = 'সদস্য নিজে',
          depositorPhone,
          depositorWhatsapp,
          depositorNid,
          depositDate = new Date().toISOString().split('T')[0],
          depositTime = new Date().toTimeString().slice(0, 5),
          depositType = 'Monthly Subscription',
          depositMethod = 'bank_counter',
          depositAmount = 0,
          bankName = 'ডাচ্-বাংলা ব্যাংক',
          bankBranch = 'মিরপুর শাখা',
          bankAccountName,
          bankAccountNumber,
          bankRoutingNumber,
          bankReceiptNumber,
          bankReceiptDate,
          depositSlipNumber,
          transactionId,
          chequeNumber,
          chequeDate,
          receiptImageDataUrl,
          remarks
        } = depositData;

        const { data: savedDraft, error: saveErr } = await supabase.from('ai_deposit_drafts').insert({
          tenant_id: tenantId,
          member_id: memberId,
          scan_id: scanId || null,
          depositor_type: depositorType,
          depositor_name: depositorName,
          depositor_relationship: depositorRelationship,
          depositor_phone: depositorPhone,
          depositor_whatsapp: depositorWhatsapp,
          depositor_nid: depositorNid,
          deposit_date: depositDate,
          deposit_time: depositTime,
          deposit_type: depositType,
          deposit_method: depositMethod,
          deposit_amount: depositAmount,
          bank_name: bankName,
          bank_branch: bankBranch,
          bank_account_name: bankAccountName,
          bank_account_number: bankAccountNumber,
          bank_routing_number: bankRoutingNumber,
          bank_receipt_number: bankReceiptNumber || `DBBL-${Math.floor(1000 + Math.random() * 9000)}`,
          bank_receipt_date: bankReceiptDate || depositDate,
          deposit_slip_number: depositSlipNumber,
          transaction_id: transactionId,
          cheque_number: chequeNumber,
          cheque_date: chequeDate,
          receipt_image_data_url: receiptImageDataUrl || '',
          remarks: remarks || '',
          status: 'ai_draft',
          created_by: confirmedBy
        }).select().single();

        if (saveErr) {
          return res.status(500).json({ success: false, message: saveErr.message });
        }

        return res.status(201).json({
          success: true,
          message: 'AI ড্রাফট সফলভাবে সংরক্ষিত হয়েছে। মানব যাচাইয়ের অপেক্ষায়।',
          draftId: savedDraft?.id,
          status: 'ai_draft'
        });
      }

      // 4.3 Confirm AI Draft -> Create Final Deposit + Receipt + QR + Short Code
      if (action === 'confirm') {
        if (!draftId) {
          return res.status(400).json({ success: false, message: 'খসড়া আইডি (draftId) প্রয়োজন।' });
        }

        // Fetch draft
        const { data: draft, error: fetchErr } = await supabase
          .from('ai_deposit_drafts')
          .select('*')
          .eq('id', draftId)
          .maybeSingle();

        if (fetchErr || !draft) {
          return res.status(404).json({ success: false, message: 'খসড়া রেকর্ডটি পাওয়া যায়নি।' });
        }

        // Validate rules
        if (Number(draft.deposit_amount) <= 0) {
          return res.status(422).json({ success: false, message: 'জমার পরিমাণ শূন্যের বেশি হওয়া আবশ্যক।' });
        }

        const now = new Date();
        const year = now.getFullYear();
        const shortCode = `S360-${Math.floor(100000 + Math.random() * 900000)}`;
        const receiptNo = `RCPT-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
        const voucherNo = `DEP-${year}-${Math.floor(10000 + Math.random() * 90000)}`;

        // Create Final Deposit in samity_deposits
        const { data: finalDep, error: depErr } = await supabase.from('samity_deposits').insert({
          tenant_id: draft.tenant_id,
          member_id: draft.member_id,
          depositor_type: draft.depositor_type || 'self',
          depositor_name: draft.depositor_name,
          depositor_relation: draft.depositor_relationship || 'সদস্য নিজে',
          depositor_phone: draft.depositor_phone,
          depositor_whatsapp: draft.depositor_whatsapp,
          depositor_nid: draft.depositor_nid,
          deposit_date: draft.deposit_date,
          amount: draft.deposit_amount,
          deposit_type: draft.deposit_type,
          deposit_method: draft.deposit_method,
          bank_name: draft.bank_name,
          bank_branch: draft.bank_branch,
          bank_account_no: draft.bank_account_number,
          bank_receipt_no: draft.bank_receipt_number,
          bank_receipt_date: draft.bank_receipt_date,
          receipt_no: receiptNo,
          voucher_no: voucherNo,
          short_verification_code: shortCode,
          approval_status: 'approved',
          approved_by: confirmedBy,
          approved_at: now.toISOString(),
          ai_scan_id: draft.scan_id,
          ai_draft_id: draft.id
        }).select().single();

        // Update draft status to confirmed
        await supabase.from('ai_deposit_drafts').update({
          status: 'confirmed',
          confirmed_by: confirmedBy,
          confirmed_at: now.toISOString()
        }).eq('id', draftId);

        const verifyUrl = `https://somiti360.vercel.app/verify/receipt/${shortCode}`;

        return res.status(200).json({
          success: true,
          message: 'AI খসড়া ডিপোজিট সফলভাবে অনুমোদিত ও সংরক্ষিত হয়েছে!',
          data: {
            depositId: finalDep?.id || voucherNo,
            receiptNumber: receiptNo,
            voucherNumber: voucherNo,
            shortVerificationCode: shortCode,
            verificationUrl: verifyUrl,
            status: 'approved',
            confirmedAt: now.toISOString()
          }
        });
      }

      // 4.4 Reject AI Draft
      if (action === 'reject') {
        if (!draftId) {
          return res.status(400).json({ success: false, message: 'খসড়া আইডি (draftId) প্রয়োজন।' });
        }

        await supabase.from('ai_deposit_drafts').update({
          status: 'rejected',
          confirmed_by: confirmedBy,
          confirmed_at: new Date().toISOString()
        }).eq('id', draftId);

        return res.status(200).json({
          success: true,
          message: 'AI খসড়া ডিপোজিট বাতিল করা হয়েছে।',
          draftId,
          status: 'rejected'
        });
      }

      return res.status(400).json({ success: false, message: 'অস্বীকৃত action। save, confirm বা reject ব্যবহার করুন।' });

    } catch (postErr) {
      console.error('AI Draft processing error:', postErr);
      return res.status(500).json({ success: false, message: postErr.message });
    }
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
