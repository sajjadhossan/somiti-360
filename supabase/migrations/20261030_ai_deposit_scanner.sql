-- Migration: AI Deposit Scans and AI Deposit Drafts Tables
-- For PostgreSQL / Supabase in Somiti 360

-- 1. AI Deposit Scans Table (Audit & Multimodal Log)
CREATE TABLE IF NOT EXISTS ai_deposit_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(100) NOT NULL,
  member_id VARCHAR(100),
  user_id VARCHAR(100),
  uploaded_file_id VARCHAR(100),
  user_instruction TEXT,
  ai_model VARCHAR(100) DEFAULT 'gemini-1.5-flash',
  scan_status VARCHAR(50) DEFAULT 'success', -- 'success', 'partial_success', 'unreadable', 'invalid_document', 'duplicate_suspected'
  confidence_score NUMERIC(5,2) DEFAULT 0.90,
  needs_review BOOLEAN DEFAULT TRUE,
  extracted_data_json JSONB DEFAULT '{}'::jsonb,
  document_quality_json JSONB DEFAULT '{}'::jsonb,
  warnings_json JSONB DEFAULT '[]'::jsonb,
  bangla_summary TEXT,
  english_summary TEXT,
  raw_ai_response_hash VARCHAR(128),
  prompt_hash VARCHAR(128),
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_deposit_scans_tenant ON ai_deposit_scans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_deposit_scans_member ON ai_deposit_scans(member_id);

-- 2. AI Deposit Drafts Table (Pre-filled form awaiting Human Confirmation)
CREATE TABLE IF NOT EXISTS ai_deposit_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(100) NOT NULL,
  member_id VARCHAR(100),
  scan_id UUID REFERENCES ai_deposit_scans(id) ON DELETE SET NULL,
  uploaded_file_id VARCHAR(100),
  depositor_type VARCHAR(50) DEFAULT 'self', -- 'self', 'family_member', 'other'
  depositor_name VARCHAR(150),
  depositor_relationship VARCHAR(100) DEFAULT 'সদস্য নিজে',
  depositor_phone VARCHAR(50),
  depositor_whatsapp VARCHAR(50),
  depositor_nid VARCHAR(50),
  deposit_date DATE,
  deposit_time VARCHAR(20),
  deposit_type VARCHAR(100) DEFAULT 'Monthly Subscription',
  deposit_method VARCHAR(50) DEFAULT 'bank_counter',
  deposit_amount NUMERIC(12,2) DEFAULT 0.00,
  bank_name VARCHAR(150),
  bank_branch VARCHAR(150),
  bank_account_name VARCHAR(150),
  bank_account_number VARCHAR(100),
  bank_routing_number VARCHAR(100),
  bank_receipt_number VARCHAR(100),
  bank_receipt_date DATE,
  deposit_slip_number VARCHAR(100),
  transaction_id VARCHAR(100),
  cheque_number VARCHAR(100),
  cheque_date DATE,
  receipt_image_data_url TEXT,
  remarks TEXT,
  status VARCHAR(50) DEFAULT 'ai_draft', -- 'ai_draft', 'confirmed', 'rejected', 'expired'
  created_by VARCHAR(100),
  confirmed_by VARCHAR(100),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_deposit_drafts_tenant ON ai_deposit_drafts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_deposit_drafts_member ON ai_deposit_drafts(member_id);
CREATE INDEX IF NOT EXISTS idx_ai_deposit_drafts_status ON ai_deposit_drafts(status);

-- 3. Add AI references to samity_deposits
ALTER TABLE IF EXISTS samity_deposits
  ADD COLUMN IF NOT EXISTS ai_scan_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS ai_draft_id VARCHAR(100);
