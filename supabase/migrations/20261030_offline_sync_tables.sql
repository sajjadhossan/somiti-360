-- Migration: Comprehensive Enterprise Offline-First Sync & Conflict Infrastructure
-- For PostgreSQL / Supabase in Somiti 360 v2.0.0

-- 1. Sync Audit Logs Table (Tracks all client push/pull delta activity)
CREATE TABLE IF NOT EXISTS sync_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(100) NOT NULL,
  device_id VARCHAR(100) NOT NULL,
  platform VARCHAR(50) DEFAULT 'web',
  operation_type VARCHAR(50) NOT NULL, -- 'PUSH', 'PULL', 'BULK_SYNC', 'CONFLICT_RESOLVE'
  entity_type VARCHAR(50),
  entity_id VARCHAR(100),
  idempotency_key VARCHAR(120),
  sync_status VARCHAR(50) DEFAULT 'success',
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_audit_logs_tenant ON sync_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sync_audit_logs_idemp ON sync_audit_logs(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_sync_audit_logs_device ON sync_audit_logs(device_id);

-- 2. Persistent Sync Conflicts Table
CREATE TABLE IF NOT EXISTS sync_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(100) NOT NULL,
  device_id VARCHAR(100),
  entity_type VARCHAR(50) NOT NULL, -- 'deposit', 'member', 'expense', 'receipt'
  entity_id VARCHAR(100) NOT NULL,
  server_version JSONB NOT NULL,
  local_version JSONB NOT NULL,
  difference_fields TEXT[] DEFAULT '{}',
  conflict_reason TEXT,
  resolution_status VARCHAR(50) DEFAULT 'unresolved', -- 'unresolved', 'resolved'
  resolution_choice VARCHAR(50), -- 'keep_server', 'keep_local', 'merged'
  resolved_by VARCHAR(100),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_conflicts_tenant ON sync_conflicts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_status ON sync_conflicts(resolution_status);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_entity ON sync_conflicts(entity_type, entity_id);

-- 3. Device Sync Cursors Table (Tracks high-water marks for delta pulls)
CREATE TABLE IF NOT EXISTS sync_cursors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(100) NOT NULL,
  device_id VARCHAR(100) NOT NULL,
  last_cursor_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_version VARCHAR(50) DEFAULT '2.0.0',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_tenant_device UNIQUE (tenant_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_sync_cursors_device ON sync_cursors(device_id);

-- 4. Members Cloud Master Table
CREATE TABLE IF NOT EXISTS samity_members (
  id VARCHAR(100) PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL,
  member_no VARCHAR(50),
  name VARCHAR(150) NOT NULL,
  father_name VARCHAR(150),
  mother_name VARCHAR(150),
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  email VARCHAR(100),
  nid VARCHAR(50),
  address TEXT,
  monthly_share_amount NUMERIC(12,2) DEFAULT 0.00,
  welfare_amount NUMERIC(12,2) DEFAULT 0.00,
  emergency_amount NUMERIC(12,2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'active',
  avatar_url TEXT,
  joined_date DATE,
  version INT DEFAULT 1,
  idempotency_key VARCHAR(120),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_samity_members_tenant ON samity_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_samity_members_phone ON samity_members(phone);

-- 5. Expenses Cloud Master Table
CREATE TABLE IF NOT EXISTS samity_expenses (
  id VARCHAR(100) PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL,
  voucher_no VARCHAR(100),
  payment_method VARCHAR(50) DEFAULT 'cash',
  remarks TEXT,
  receipt_image_url TEXT,
  status VARCHAR(50) DEFAULT 'approved',
  version INT DEFAULT 1,
  idempotency_key VARCHAR(120),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_samity_expenses_tenant ON samity_expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_samity_expenses_date ON samity_expenses(date);

-- 6. Documents & Official Pads Master Table
CREATE TABLE IF NOT EXISTS samity_documents (
  id VARCHAR(100) PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'notice', 'meeting_resolution', 'certificate', 'loan_deed'
  title VARCHAR(250) NOT NULL,
  content TEXT,
  doc_number VARCHAR(100),
  signatory VARCHAR(150),
  status VARCHAR(50) DEFAULT 'published',
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_samity_documents_tenant ON samity_documents(tenant_id);
