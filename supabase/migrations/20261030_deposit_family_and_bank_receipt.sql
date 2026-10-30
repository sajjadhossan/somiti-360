-- Migration: Member Deposit System Upgrade with Family Depositor, Bank Fields, Image Metadata & Verification Logs
-- For PostgreSQL / Supabase in Somiti 360

-- 1. Alter samity_deposits to ensure all enterprise depositor & bank receipt columns exist
ALTER TABLE IF EXISTS samity_deposits 
  ADD COLUMN IF NOT EXISTS depositor_type VARCHAR(50) DEFAULT 'self', -- 'self', 'family_member', 'authorized_person'
  ADD COLUMN IF NOT EXISTS depositor_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS depositor_relation VARCHAR(100) DEFAULT 'সদস্য নিজে',
  ADD COLUMN IF NOT EXISTS depositor_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS depositor_whatsapp VARCHAR(50),
  ADD COLUMN IF NOT EXISTS depositor_nid VARCHAR(50),
  ADD COLUMN IF NOT EXISTS depositor_address TEXT,
  ADD COLUMN IF NOT EXISTS bank_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS bank_branch VARCHAR(150),
  ADD COLUMN IF NOT EXISTS bank_account_no VARCHAR(100),
  ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS bank_receipt_no VARCHAR(100),
  ADD COLUMN IF NOT EXISTS bank_receipt_date DATE,
  ADD COLUMN IF NOT EXISTS bank_receipt_image_url TEXT,
  ADD COLUMN IF NOT EXISTS bank_receipt_thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS bank_receipt_original_size_kb INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bank_receipt_compressed_size_kb INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS short_verification_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS qr_data_url TEXT,
  ADD COLUMN IF NOT EXISTS audit_log JSONB DEFAULT '[]'::jsonb;

-- 2. Indexes for instant lookup & verification performance
CREATE INDEX IF NOT EXISTS idx_samity_deposits_short_code ON samity_deposits(short_verification_code);
CREATE INDEX IF NOT EXISTS idx_samity_deposits_tenant_id ON samity_deposits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_samity_deposits_member_id ON samity_deposits(member_id);
CREATE INDEX IF NOT EXISTS idx_samity_deposits_receipt_no ON samity_deposits(receipt_no);

-- 3. Dedicated Verification Log Table for QR scans and Manual Short Code lookups
CREATE TABLE IF NOT EXISTS receipt_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(100) NOT NULL,
  deposit_id VARCHAR(100),
  short_code VARCHAR(50) NOT NULL,
  verification_status VARCHAR(50) DEFAULT 'valid', -- 'valid', 'cancelled', 'expired', 'not_found'
  ip_address VARCHAR(100),
  user_agent TEXT,
  verification_source VARCHAR(50) DEFAULT 'qr_scan', -- 'qr_scan', 'manual_code'
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receipt_verif_logs_short_code ON receipt_verification_logs(short_code);
CREATE INDEX IF NOT EXISTS idx_receipt_verif_logs_tenant_id ON receipt_verification_logs(tenant_id);
