/**
 * HisabKitab 360 / Somiti 360 - SaaS Multi-Tenant & Module Toggle Service
 * Commercial-grade client licensing, feature toggles and workspace switcher
 */

// Key for persisting registered client tenants
export const TENANTS_STORAGE_KEY = 'somiti360_tenants_registry';
export const ACTIVE_WORKSPACE_KEY = 'somiti360_active_workspace_id';

// Standard 11 Commercial SaaS Modules
export const SAAS_MODULES = [
  {
    id: 'savings',
    nameBn: 'সঞ্চয় ও জমা খতিয়ান',
    nameEn: 'Savings & Deposits Book',
    descBn: 'দৈনিক, সাপ্তাহিক ও মাসিক সঞ্চয় গ্রহণ, রসিদ তৈরি এবং পাসবই হিসাব',
    category: 'fin_core',
    icon: 'Wallet',
    defaultEnabled: true,
  },
  {
    id: 'microloan',
    nameBn: 'ক্ষুদ্রঋণ ও কিস্তি আদায়',
    nameEn: 'Microloan & Installments',
    descBn: 'ঋণ বিতরণ, কিস্তি আদায় শিডিউল, জরিমানা হিসাব ও মুনাফা নির্ধারণ',
    category: 'fin_core',
    icon: 'TrendingUp',
    defaultEnabled: true,
  },
  {
    id: 'members',
    nameBn: 'সদস্য ব্যবস্থাপনা ও পাসবই',
    nameEn: 'Members & Welfare Wing',
    descBn: 'সদস্য ভর্তি, নমিনি তথ্য, আইডি কার্ড জেনারেশন ও মেম্বার পোর্টাল',
    category: 'member_core',
    icon: 'Users',
    defaultEnabled: true,
  },
  {
    id: 'expenses',
    nameBn: 'অফিস খরচ ও ভাউচার খতিয়ান',
    nameEn: 'Office Expenses & Vouchers',
    descBn: 'অফিস পরিচালনা ব্যয়, কর্মচারীদের বেতন ও ডেবিট ভাউচার প্রিন্ট',
    category: 'fin_core',
    icon: 'Receipt',
    defaultEnabled: true,
  },
  {
    id: 'bank_funds',
    nameBn: 'ব্যাংক হিসাব ও রিজার্ভ ফান্ড',
    nameEn: 'Bank Accounts & Funds',
    descBn: 'সমিতির ব্যাংক ডিপোজিট, এফডিআর, শেয়ার মূলধন ও তহবিল লেনদেন',
    category: 'fin_core',
    icon: 'Building2',
    defaultEnabled: true,
  },
  {
    id: 'sms_gateway',
    nameBn: 'স্বয়ংক্রিয় এসএমএস গেটওয়ে',
    nameEn: 'Automated SMS Gateway',
    descBn: 'জমা ও কিস্তি আদায়ের সাথে সাথে সদস্যদের মোবাইলে স্বয়ংক্রিয় এসএমএস',
    category: 'integrations',
    icon: 'Send',
    defaultEnabled: false,
  },
  {
    id: 'whatsapp_alerts',
    nameBn: 'হোয়াটসঅ্যাপ রিমাইন্ডার ও নোটিশ',
    nameEn: 'WhatsApp Alerts & Notice',
    descBn: 'বকেয়া কিস্তির তাগাদা ও মিটিংয়ের নোটিশ সরাসরি হোয়াটসঅ্যাপে প্রেরণ',
    category: 'integrations',
    icon: 'MessageSquare',
    defaultEnabled: false,
  },
  {
    id: 'secretariat',
    nameBn: 'অফিসিয়াল প্যাড ও লিগ্যাল নোটিশ',
    nameEn: 'Official Letterhead & Pad',
    descBn: 'ডিজিটাল সিল ও স্বাক্ষরযুক্ত প্যাড, নোটিশ বোর্ড এবং রেজুলেশন তৈরি',
    category: 'governance',
    icon: 'FileText',
    defaultEnabled: true,
  },
  {
    id: 'qr_verification',
    nameBn: 'ডিজিটাল ভেরিফিকেশন ও কিউআর রসিদ',
    nameEn: 'Instant QR Verification',
    descBn: 'লগইন ছাড়া মোবাইল দিয়ে স্ক্যান করে অনলাইন রসিদ ও নোটিশ যাচাইকরণ',
    category: 'security',
    icon: 'QrCode',
    defaultEnabled: true,
  },
  {
    id: 'audit_reports',
    nameBn: 'সম্পূর্ণ নিরীক্ষা ও বার্ষিক লাভ-ক্ষতি',
    nameEn: 'Audit Trail & Financial Statements',
    descBn: 'ব্যালেন্স শিট, আয়-ব্যয় খতিয়ান, অডিট লগ ও ট্রায়াল ব্যালেন্স রিপোর্ট',
    category: 'governance',
    icon: 'PieChart',
    defaultEnabled: true,
  },
  {
    id: 'staff_rbac',
    nameBn: 'মাঠকর্মী ও ক্যাশিয়ার পারমিশন (RBAC)',
    nameEn: 'Role-Based Access Control',
    descBn: 'ক্যাশিয়ার, মাঠকর্মী ও ম্যানেজারের জন্য আলাদা এক্সেস সীমা নির্ধারণ',
    category: 'security',
    icon: 'ShieldCheck',
    defaultEnabled: true,
  },
];

// Default initial tenants if none exist
const DEFAULT_INITIAL_TENANTS = [
  {
    id: 'tenant_master_headquarters',
    name: 'শাপলা সমবায় সমিতি (হেড অফিস - নিজস্ব)',
    ownerName: 'সাজ্জাদ হোসেন (সুপার এডমিন)',
    ownerEmail: 'hossansajjad1994@gmail.com',
    ownerPhone: '01700000000',
    plan: 'Enterprise Lifetime',
    status: 'active', // 'active' | 'suspended' | 'trial'
    isOwnSamity: true,
    createdAt: '2026-01-01T00:00:00Z',
    validUntil: '2099-12-31',
    modules: {
      savings: true,
      microloan: true,
      members: true,
      expenses: true,
      bank_funds: true,
      sms_gateway: true,
      whatsapp_alerts: true,
      secretariat: true,
      qr_verification: true,
      audit_reports: true,
      staff_rbac: true,
    },
    settings: {
      address: 'ঢাকা, বাংলাদেশ',
      establishedYear: '2020',
      registrationNo: 'SOMITI-DH-2026',
    }
  },
  {
    id: 'tenant_demo_client_1',
    name: 'অগ্রণী সঞ্চয় ও ঋণদান সমবায় সমিতি',
    ownerName: 'মোঃ আব্দুল করিম',
    ownerEmail: 'karim.agrani@gmail.com',
    ownerPhone: '01811223344',
    plan: 'Standard Yearly',
    status: 'active',
    isOwnSamity: false,
    createdAt: '2026-06-15T00:00:00Z',
    validUntil: '2027-06-15',
    modules: {
      savings: true,
      microloan: true,
      members: true,
      expenses: true,
      bank_funds: true,
      sms_gateway: false,
      whatsapp_alerts: false,
      secretariat: true,
      qr_verification: true,
      audit_reports: true,
      staff_rbac: true,
    },
    settings: {
      address: 'মিরপুর ১০, ঢাকা',
      establishedYear: '2022',
      registrationNo: 'SOMITI-DH-9081',
    }
  }
];

/**
 * Retrieve all registered tenant clients
 */
export const getTenantsList = () => {
  try {
    const raw = localStorage.getItem(TENANTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse tenants registry:', e);
  }
  // Initialize with defaults if empty
  saveTenantsList(DEFAULT_INITIAL_TENANTS);
  return DEFAULT_INITIAL_TENANTS;
};

/**
 * Persist tenant clients to storage and dispatch event
 */
export const saveTenantsList = (tenants) => {
  try {
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('somiti_tenants_changed', { detail: { tenants } }));
    }
  } catch (e) {
    console.error('Failed to save tenants registry:', e);
  }
};

/**
 * Retrieve a single tenant by ID
 */
export const getTenantById = (tenantId) => {
  const tenants = getTenantsList();
  return tenants.find(t => t.id === tenantId) || null;
};

/**
 * Get active workspace / tenant ID
 */
export const getActiveWorkspaceId = () => {
  try {
    const saved = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
    if (saved) return saved;
  } catch {}
  return 'tenant_master_headquarters';
};

/**
 * Switch active workspace (e.g. from Super Admin's samity to another client's samity)
 */
export const setActiveWorkspaceId = (tenantId) => {
  try {
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, tenantId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('somiti_workspace_switched', { detail: { tenantId } }));
    }
  } catch (e) {
    console.error('Failed to set active workspace:', e);
  }
};

/**
 * Create a new tenant client
 */
export const createNewTenant = (tenantData) => {
  const tenants = getTenantsList();
  const id = `tenant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  // Default module configuration if not provided
  const initialModules = tenantData.modules || {};
  SAAS_MODULES.forEach(m => {
    if (initialModules[m.id] === undefined) {
      initialModules[m.id] = m.defaultEnabled;
    }
  });

  const newTenant = {
    id,
    name: tenantData.name?.trim() || 'নতুন সমবায় সমিতি',
    ownerName: tenantData.ownerName?.trim() || 'সমিতি পরিচালক',
    ownerEmail: tenantData.ownerEmail?.trim().toLowerCase() || '',
    ownerPhone: tenantData.ownerPhone?.trim() || '',
    plan: tenantData.plan || 'Standard Yearly',
    status: tenantData.status || 'active',
    isOwnSamity: Boolean(tenantData.isOwnSamity),
    createdAt: new Date().toISOString(),
    validUntil: tenantData.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    modules: initialModules,
    settings: {
      address: tenantData.address || '',
      establishedYear: tenantData.establishedYear || new Date().getFullYear().toString(),
      registrationNo: tenantData.registrationNo || '',
      ...(tenantData.settings || {})
    }
  };

  const updated = [newTenant, ...tenants];
  saveTenantsList(updated);
  return newTenant;
};

/**
 * Update an existing tenant client
 */
export const updateTenant = (tenantId, updates) => {
  const tenants = getTenantsList();
  const idx = tenants.findIndex(t => t.id === tenantId);
  if (idx === -1) return null;

  tenants[idx] = {
    ...tenants[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveTenantsList(tenants);
  return tenants[idx];
};

/**
 * Toggle a specific module for a tenant (Feature Toggle Engine)
 */
export const toggleTenantModule = (tenantId, moduleId, isEnabled) => {
  const tenants = getTenantsList();
  const idx = tenants.findIndex(t => t.id === tenantId);
  if (idx === -1) return false;

  const currentModules = tenants[idx].modules || {};
  const nextState = isEnabled !== undefined ? Boolean(isEnabled) : !currentModules[moduleId];

  tenants[idx].modules = {
    ...currentModules,
    [moduleId]: nextState
  };
  tenants[idx].updatedAt = new Date().toISOString();

  saveTenantsList(tenants);

  // Dispatch live notification so running UI components update immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('somiti_module_toggled', {
      detail: { tenantId, moduleId, isEnabled: nextState }
    }));
  }

  return nextState;
};

/**
 * Delete a tenant client
 */
export const deleteTenant = (tenantId) => {
  const tenants = getTenantsList();
  // Prevent deleting the master headquarters
  const target = tenants.find(t => t.id === tenantId);
  if (target?.isOwnSamity) {
    throw new Error('আপনার নিজস্ব মূল সমিতি ডিলিট করা যাবে না।');
  }

  const filtered = tenants.filter(t => t.id !== tenantId);
  saveTenantsList(filtered);

  // If deleted was active, revert to master
  if (getActiveWorkspaceId() === tenantId) {
    setActiveWorkspaceId('tenant_master_headquarters');
  }

  return true;
};

/**
 * Check if a module is enabled for a specific tenant (or current active workspace)
 */
export const isModuleEnabled = (moduleId, tenantId = null) => {
  const targetId = tenantId || getActiveWorkspaceId();
  const tenant = getTenantById(targetId);
  if (!tenant) return true; // Fallback to true if tenant not configured
  if (!tenant.modules) return true;
  return tenant.modules[moduleId] !== false;
};

/**
 * Check if the active session user is Super Admin
 */
export const checkIsSuperAdmin = (user) => {
  if (!user) return true; // In offline/development default to administrative power
  const email = (user.email || '').toLowerCase().trim();
  return email === 'hossansajjad1994@gmail.com' || user.isSuperAdmin === true || user.role === 'super_admin';
};
