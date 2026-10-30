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

/**
 * Check a tenant's subscription status, expiration, and remaining days
 */
export const checkTenantSubscriptionStatus = (tenantId = null) => {
  const targetId = tenantId || getActiveWorkspaceId();
  const tenant = getTenantById(targetId);
  if (!tenant) return { isValid: true, status: 'active', daysLeft: 999 };
  if (tenant.isOwnSamity) return { isValid: true, status: 'active', daysLeft: 99999, isOwn: true };

  const today = new Date().toISOString().split('T')[0];
  const validUntil = tenant.validUntil || '2099-12-31';
  const isSuspended = tenant.status === 'suspended';
  const isExpired = validUntil < today;

  const diffTime = new Date(validUntil).getTime() - new Date(today).getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    isValid: !isSuspended && !isExpired,
    status: isSuspended ? 'suspended' : isExpired ? 'expired' : 'active',
    isSuspended,
    isExpired,
    daysLeft,
    isExpiringSoon: daysLeft <= 15 && daysLeft >= 0,
    validUntil,
    tenant
  };
};

/**
 * Extend tenant subscription validity (Super Admin 1-Click Action)
 */
export const extendTenantSubscription = (tenantId, daysToAdd = 365) => {
  const tenants = getTenantsList();
  const idx = tenants.findIndex(t => t.id === tenantId);
  if (idx === -1) return null;

  const currentValid = tenants[idx].validUntil ? new Date(tenants[idx].validUntil) : new Date();
  const baseDate = currentValid.getTime() > Date.now() ? currentValid : new Date();
  baseDate.setDate(baseDate.getDate() + daysToAdd);

  tenants[idx].validUntil = baseDate.toISOString().split('T')[0];
  tenants[idx].status = 'active';
  tenants[idx].updatedAt = new Date().toISOString();

  saveTenantsList(tenants);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('somiti_subscription_renewed', {
      detail: { tenantId, validUntil: tenants[idx].validUntil }
    }));
  }

  return tenants[idx];
};
// ============================================================================
// 8-CATEGORY A-TO-Z GRANULAR FEATURE SWITCHBOARD (43 SUB-FEATURES)
// Master Control for Super Admin & Cascading Sub-Control for Samity Admin
// ============================================================================

export const GRANULAR_FEATURE_CATEGORIES = [
  {
    id: 'field_collection',
    nameBn: 'মাঠকর্মী ও কালেকশন অপারেশনস',
    nameEn: 'Field Collection & Operations',
    descBn: 'মাঠপর্যায়ে নগদ চাঁদা ও কিস্তি আদায়, মাঠকর্মীর কালেকশন শিট ও ডিজিটাল রশিদ',
    icon: 'Navigation',
    parentModule: 'savings',
    features: [
      {
        id: 'field_cash_collect',
        nameBn: 'মাঠপর্যায়ে নগদ টাকা আদায়',
        nameEn: 'Field Cash Collection',
        descBn: 'অনলাইন ও অফলাইনে সরাসরি সদস্যদের কাছ থেকে নগদ টাকা গ্রহণ',
        defaultEnabled: true,
      },
      {
        id: 'field_slip_print',
        nameBn: 'কালেকশন রশিদ ও মানি রিসিট প্রদান',
        nameEn: 'Instant Money Receipt Print',
        descBn: 'টাকা আদায়ের সাথে সাথে থার্মাল প্রিন্ট বা ডিজিটাল রিসিট প্রদান',
        defaultEnabled: true,
      },
      {
        id: 'field_sms_notify',
        nameBn: 'আদায়ের সাথে সাথে গ্রাহককে এসএমএস নোটিফিকেশন',
        nameEn: 'Instant SMS on Collection',
        descBn: 'টাকা জমা হওয়ার সাথে সাথে সদস্যের ফোনে অটোমেটিক এসএমএস পাঠানো',
        defaultEnabled: false,
      },
      {
        id: 'field_daily_sheet',
        nameBn: 'মাঠকর্মীর নিজস্ব দৈনিক আদায়ের সামারি শিট',
        nameEn: 'Field Officer Daily Collection Sheet',
        descBn: 'দিনের শুরুতে টার্গেট ও দিনশেষে মোট জমার পূর্ণাঙ্গ হিসাব বিবরণী',
        defaultEnabled: true,
      },
      {
        id: 'field_member_onboard',
        nameBn: 'মাঠ থেকে সরাসরি নতুন সদস্য নিবন্ধন',
        nameEn: 'Field Member Onboarding',
        descBn: 'মাঠে গিয়ে নতুন গ্রাহকের আবেদন ও প্রাথমিক তথ্য ফরম পূরণ',
        defaultEnabled: true,
      },
      {
        id: 'field_fine_reschedule',
        nameBn: 'কিস্তি রিশিডিউল ও জরিমানা নির্ধারণ ক্ষমতা',
        nameEn: 'Fine Assessment & Reschedule',
        descBn: 'মাঠপর্যায়ে কিস্তি পরিবর্তনের সুপারিশ ও বিলম্ব ফি প্রয়োগ',
        defaultEnabled: false,
      }
    ]
  },
  {
    id: 'member_portal',
    nameBn: 'সদস্য পোর্টাল ও সেলফ-সার্ভিস',
    nameEn: 'Member Portal & Self-Service',
    descBn: 'সাধারণ সমবায়ী সদস্যরা মোবাইল অ্যাপে লগইন করে যা যা দেখতে ও করতে পারবে',
    icon: 'Users',
    parentModule: 'members',
    features: [
      {
        id: 'member_view_savings',
        nameBn: 'সদস্যের নিজস্ব সঞ্চয় ও জমার ব্যালেন্স দেখা',
        nameEn: 'View Personal Savings Balance',
        descBn: 'সদস্য তার মোট জমার পরিমাণ ও মাসিক ট্রানজেকশন দেখতে পারবে',
        defaultEnabled: true,
      },
      {
        id: 'member_view_loan',
        nameBn: 'সদস্যের নিজস্ব লোন বকেয়া ও কিস্তি বিবরণী',
        nameEn: 'View Personal Loan & Dues',
        descBn: 'ঋণের কিস্তি কয়টি বাকি এবং আগামী কিস্তির তারিখ প্রদর্শন',
        defaultEnabled: true,
      },
      {
        id: 'member_download_passbook',
        nameBn: 'ডিজিটাল পাসবই (Passbook) ডাউনলোড',
        nameEn: 'Download Digital Passbook',
        descBn: 'সদস্য নিজে তার পাসবইয়ের হিসাব বিবরণী পিডিএফ আকারে সেভ করতে পারবে',
        defaultEnabled: true,
      },
      {
        id: 'member_request_deposit',
        nameBn: 'অনলাইনে সঞ্চয় বা কিস্তির জমা রিকোয়েস্ট',
        nameEn: 'Online Deposit Intent Request',
        descBn: 'মোবাইল ব্যাংকিংয়ের ট্রানজেকশন আইডি দিয়ে জমার রিকোয়েস্ট পাঠানো',
        defaultEnabled: false,
      },
      {
        id: 'member_apply_loan',
        nameBn: 'সদস্য নিজে অ্যাপ থেকে ঋণের জন্য আবেদন করা',
        nameEn: 'Apply for Loan via App',
        descBn: 'প্রয়োজনীয় নথিপত্র ও জামিনদার উল্লেখ করে নতুন লোন আবেদন দাখিল',
        defaultEnabled: false,
      },
      {
        id: 'member_view_notices',
        nameBn: 'সমিতির সাধারণ নোটিশ বোর্ড ও রেজোলিউশন দর্শন',
        nameEn: 'View Public Notices & Minutes',
        descBn: 'বার্ষিক সাধারণ সভা বা ছুটির নোটিশ সরাসরি মেম্বার পোর্টালে দেখা',
        defaultEnabled: true,
      },
      {
        id: 'member_request_profile_edit',
        nameBn: 'নমিনি ও ব্যক্তিগত তথ্য সংশোধনের আবেদন',
        nameEn: 'Request Profile & Nominee Update',
        descBn: 'মোবাইল নম্বর বা নমিনির তথ্য পরিবর্তনের জন্য অ্যাডমিনকে রিকোয়েস্ট পাঠানো',
        defaultEnabled: true,
      }
    ]
  },
  {
    id: 'savings_deposits',
    nameBn: 'সঞ্চয় ও আমানত হিসাব স্কিম',
    nameEn: 'Savings Schemes & Deposits',
    descBn: 'দৈনিক, ডিপিএস, এফডিআর ও বাৎসরিক লভ্যাংশ বণ্টন ক্যালকুলেটর',
    icon: 'Wallet',
    parentModule: 'savings',
    features: [
      {
        id: 'savings_daily',
        nameBn: 'দৈনিক সাধারণ সঞ্চয় (Daily Savings)',
        nameEn: 'Daily General Savings',
        descBn: 'প্রতিদিন নগদ জমা গ্রহণ ও নিয়মিত ব্যালেন্স আপডেট',
        defaultEnabled: true,
      },
      {
        id: 'savings_dps',
        nameBn: 'সাপ্তাহিক ও মাসিক ডিপিএস (DPS Schemes)',
        nameEn: 'Weekly & Monthly DPS Schemes',
        descBn: 'নির্দিষ্ট মেয়াদি কিস্তিভিত্তিক ডিপিএস অ্যাকাউন্ট পরিচালনা',
        defaultEnabled: true,
      },
      {
        id: 'savings_fdr',
        nameBn: 'এককালীন স্থায়ী আমানত (FDR / Fixed Deposit)',
        nameEn: 'Fixed Term Deposits (FDR)',
        descBn: 'স্থায়ী আমানত চুক্তি, লাভ প্রদান ও সার্টিফিকেট তৈরি',
        defaultEnabled: true,
      },
      {
        id: 'savings_withdraw',
        nameBn: 'সঞ্চয় উত্তোলন (Withdrawal) ও সমাপনী চেক',
        nameEn: 'Savings Withdrawal & Account Close',
        descBn: 'সদস্যের জমার টাকা উত্তোলন ভাউচার ও চূড়ান্ত হিসাব নিষ্পত্তি',
        defaultEnabled: true,
      },
      {
        id: 'savings_profit_distribute',
        nameBn: 'বাৎসরিক লভ্যাংশ ও মুনাফা বণ্টন ক্যালকুলেটর',
        nameEn: 'Annual Profit Distribution Calculator',
        descBn: 'সকল সদস্যের গড় সঞ্চয়ের ওপর বার্ষিক মুনাফা স্বয়ংক্রিয় গণনা',
        defaultEnabled: true,
      },
      {
        id: 'savings_waive_fee',
        nameBn: 'বিলম্ব ফি ও জরিমানা মওকুফ করার ক্ষমতা',
        nameEn: 'Waive Penalty & Late Fees',
        descBn: 'বিলম্বিত কিস্তির জরিমানা বা চার্জ বিশেষ বিবেচনায় শূন্য করা',
        defaultEnabled: false,
      }
    ]
  },
  {
    id: 'microloan_ops',
    nameBn: 'ক্ষুদ্রঋণ ও বিনিয়োগ অপারেশনস',
    nameEn: 'Microloan & Credit Management',
    descBn: 'ঋণ প্রস্তাব যাচাই, অনুমোদন, কিস্তি শিডিউল ও খেলাপি ঋণ নিয়ন্ত্রণ',
    icon: 'TrendingUp',
    parentModule: 'microloan',
    features: [
      {
        id: 'loan_proposal_create',
        nameBn: 'নতুন ঋণ প্রস্তাব ও ফাইল তৈরি',
        nameEn: 'Create Loan Proposal File',
        descBn: 'গ্রাহকের ঋণ আবেদন, জামিনদার যাচাই ও নথিপত্র যুক্ত করা',
        defaultEnabled: true,
      },
      {
        id: 'loan_disbursement_approve',
        nameBn: 'ঋণ অনুমোদন ও অর্থ বিতরণ (Disbursement)',
        nameEn: 'Loan Approval & Cash Disbursement',
        descBn: 'কার্যনির্বাহী কমিটির সুপারিশে ঋণ পাশ ও নগদ টাকা ছাড় করা',
        defaultEnabled: true,
      },
      {
        id: 'loan_schedule_generate',
        nameBn: 'দৈনিক, সাপ্তাহিক ও মাসিক কিস্তি শিডিউল তৈরি',
        nameEn: 'Generate Repayment Schedule',
        descBn: 'সুদ বা সার্ভিস চার্জসহ প্রতিটি কিস্তির সুনির্দিষ্ট তারিখ শিডিউল',
        defaultEnabled: true,
      },
      {
        id: 'loan_defaulter_notice',
        nameBn: 'ঋণখেলাপি ও বকেয়া আদায়ের তাগাদা নোটিশ জারি',
        nameEn: 'Issue Defaulter Legal Notice',
        descBn: 'মেয়াদোত্তীর্ণ ঋণের জন্য আনুষ্ঠানিক তাগাদাপত্র ও লিগ্যাল নোটিশ তৈরি',
        defaultEnabled: true,
      },
      {
        id: 'loan_restructure',
        nameBn: 'ঋণের মেয়াদ বৃদ্ধি ও কিস্তি পুনর্বিন্যাস (Restructure)',
        nameEn: 'Loan Restructure & Term Extension',
        descBn: 'বিশেষ বিবেচনায় কিস্তির সংখ্যা বাড়ানো বা টাকার পরিমাণ কমানো',
        defaultEnabled: false,
      }
    ]
  },
  {
    id: 'cash_banking',
    nameBn: 'ক্যাশ, ভাউচার ও ব্যাংকিং',
    nameEn: 'Cash, Vouchers & Treasury',
    descBn: 'অফিস খরচ, ডেবিট ভাউচার, ব্যাংকে জমা-উত্তোলন ও রিজার্ভ ফান্ড',
    icon: 'Building2',
    parentModule: 'expenses',
    features: [
      {
        id: 'cash_expense_entry',
        nameBn: 'দৈনন্দিন অফিস খরচ ও বিল ভাউচার এন্ট্রি',
        nameEn: 'Daily Expense & Voucher Entry',
        descBn: 'অফিস ভাড়া, আপ্যায়ন, কর্মচারী বেতন ও পরিচালনা ব্যয়ের ভাউচার',
        defaultEnabled: true,
      },
      {
        id: 'cash_expense_approve',
        nameBn: 'খরচের ভাউচার চূড়ান্ত অনুমোদন (Expense Approval)',
        nameEn: 'Final Expense Voucher Approval',
        descBn: 'ক্যাশ বা ব্যাংক থেকে টাকা ছাড়ের পূর্বে ঊর্ধ্বতন কর্তৃপক্ষের অনুমোদন',
        defaultEnabled: true,
      },
      {
        id: 'bank_deposit_withdraw',
        nameBn: 'ব্যাংক একাউন্টে টাকা জমা ও উত্তোলন হিসাব',
        nameEn: 'Bank Account Deposit & Withdrawal',
        descBn: 'সমিতির বিভিন্ন বাণিজ্যিক ব্যাংকের লেনদেন খতিয়ান',
        defaultEnabled: true,
      },
      {
        id: 'bank_fund_transfer',
        nameBn: 'অভ্যন্তরীণ রিজার্ভ ও জরুরি ফান্ড ট্রান্সফার',
        nameEn: 'Reserve & Emergency Fund Transfer',
        descBn: 'সাধারণ তহবিল থেকে আপদকালীন বা কল্যাণ তহবিলে স্থানান্তর',
        defaultEnabled: true,
      },
      {
        id: 'cash_daily_closing',
        nameBn: 'প্রারম্ভিক ক্যাশ ও দিনশেষে ক্যাশ ক্লোজিং ব্যালেন্স',
        nameEn: 'Daily Cash Opening & Closing',
        descBn: 'প্রতিদিন সকালের ক্যাশ ও সন্ধ্যার ক্যাশ কাউন্টারের পূর্ণাঙ্গ মিলকরণ',
        defaultEnabled: true,
      }
    ]
  },
  {
    id: 'audit_reports',
    nameBn: 'অডিট, লেজার ও ডকুমেন্টেশন',
    nameEn: 'Audit, Ledger & Reports',
    descBn: 'ক্যাশ বই, ব্যালেন্স শিট, কিউআর ভেরিফিকেশন ও এক্সেল এক্সপোর্ট',
    icon: 'PieChart',
    parentModule: 'audit_reports',
    features: [
      {
        id: 'report_cashbook_ledger',
        nameBn: 'দৈনিক ক্যাশ বই ও সাধারণ খতিয়ান দর্শন',
        nameEn: 'Daily Cashbook & General Ledger',
        descBn: 'যেকোনো তারিখের মোট আয়, মোট ব্যয় ও চূড়ান্ত উদ্বৃত্ত দেখা',
        defaultEnabled: true,
      },
      {
        id: 'report_income_balance_sheet',
        nameBn: 'বার্ষিক লাভ-ক্ষতি ও ব্যালেন্স শিট তৈরি',
        nameEn: 'Income Statement & Balance Sheet',
        descBn: 'সমবায় অধিদপ্তরের ফরম্যাট অনুযায়ী আর্থিক বিবরণী প্রণয়ন',
        defaultEnabled: true,
      },
      {
        id: 'report_excel_export',
        nameBn: 'রিপোর্ট এক্সেল (CSV / XLSX) আকারে ডাউনলোড',
        nameEn: 'Export Ledger & Lists to Excel',
        descBn: 'কম্পিউটারে এনালাইসিসের জন্য এক ক্লিকে সকল ডাটা এক্সেলে নেওয়া',
        defaultEnabled: true,
      },
      {
        id: 'report_official_pdf',
        nameBn: 'অফিসিয়াল সিল ও সিগনেচারসহ PDF প্রিন্ট',
        nameEn: 'Official PDF with Stamp & Seal',
        descBn: 'সভাপতি ও ক্যাশিয়ারের ডিজিটাল সিলযুক্ত প্রফেশনাল প্রতিবেদন',
        defaultEnabled: true,
      },
      {
        id: 'report_qr_verify_portal',
        nameBn: 'কিউআর কোড অনলাইন ভেরিফিকেশন ও পাবলিক পোর্টাল',
        nameEn: 'Public QR Code Document Verification',
        descBn: 'যেকোনো মোবাইল দিয়ে কিউআর স্ক্যান করে রশিদের সত্যতা যাচাই',
        defaultEnabled: true,
      },
      {
        id: 'report_audit_trail',
        nameBn: 'অডিট ট্রেইল ও অ্যাকশন হিস্ট্রি ট্র্যাকিং',
        nameEn: 'Audit Trail & Activity Log Tracking',
        descBn: 'কোন ইউজার কখন কোন ডেটা এন্ট্রি, এডিট বা পরিবর্তন করেছে তার রেকর্ড',
        defaultEnabled: true,
      }
    ]
  },
  {
    id: 'admin_governance',
    nameBn: 'প্রশাসন, স্টাফ ও ব্যাকআপ ম্যানেজমেন্ট',
    nameEn: 'Governance, Staff & Backups',
    descBn: 'স্টাফ পদায়ন, ডাটাবেজ ব্যাকআপ-রিস্টোর ও লেনদেন এডিট-ডিলিট ক্ষমতা',
    icon: 'ShieldCheck',
    parentModule: 'staff_rbac',
    features: [
      {
        id: 'admin_staff_manage',
        nameBn: 'নতুন স্টাফ ও কমিটি মেম্বার নিয়োগ ও পদায়ন',
        nameEn: 'Staff & Committee Member Assignment',
        descBn: 'অফিসের কর্মীদের ইউজার একাউন্ট তৈরি ও পদবি বণ্টন',
        defaultEnabled: true,
      },
      {
        id: 'admin_edit_transactions',
        nameBn: 'পূর্বের লেনদেন বা রশিদের তথ্য এডিট করার ক্ষমতা',
        nameEn: 'Edit Existing Transaction Records',
        descBn: 'ভুল টাইপিং হলে অ্যাডমিন কর্তৃক লেনদেন সংশোধন',
        defaultEnabled: false,
      },
      {
        id: 'admin_delete_records',
        nameBn: 'অ্যাকাউন্ট বা রেকর্ড সফট-ডিলিট (Soft Delete) ক্ষমতা',
        nameEn: 'Soft-Delete Records & Accounts',
        descBn: 'অনাকাঙ্ক্ষিত এন্ট্রি সিস্টেম থেকে নিরাপদ অডিট রিমুভ করা',
        defaultEnabled: false,
      },
      {
        id: 'admin_database_backup',
        nameBn: 'সম্পূর্ণ ডাটাবেজ ব্যাকআপ (JSON / ZIP) নামানো',
        nameEn: 'Full Database Backup Download',
        descBn: 'কম্পিউটার বা ফোনে অফলাইন ব্যাকআপ ফাইল সংরক্ষণ',
        defaultEnabled: true,
      },
      {
        id: 'admin_database_restore',
        nameBn: 'ব্যাকআপ ফাইল থেকে পূর্বের ডাটা রিস্টোর করা',
        nameEn: 'Restore Database from Backup',
        descBn: 'জরুরি পরিস্থিতিতে সংরক্ষিত ব্যাকআপ ফাইল আপলোড করে ডেটা পুনরুদ্ধার',
        defaultEnabled: false,
      }
    ]
  },
  {
    id: 'automation_comms',
    nameBn: 'স্বয়ংক্রিয় যোগাযোগ ও নোটিফিকেশন',
    nameEn: 'Automation, Alerts & Integrations',
    descBn: 'অটো এসএমএস, হোয়াটসঅ্যাপ মেসেজ ও টেলিগ্রাম বটের মাধ্যমে রিপোর্ট',
    icon: 'Send',
    parentModule: 'sms_gateway',
    features: [
      {
        id: 'comm_sms_gateway',
        nameBn: 'অটোমেটিক বাল্ক এসএমএস গেটওয়ে সার্ভিস',
        nameEn: 'Automated Bulk SMS Gateway',
        descBn: 'বাংলাদেশের যেকোনো টেলিকম অপারেটরে বাংলায় এসএমএস প্রেরণ',
        defaultEnabled: false,
      },
      {
        id: 'comm_whatsapp_alerts',
        nameBn: 'হোয়াটসঅ্যাপে সরাসরি মানি রিসিট ও নোটিশ সেন্ড',
        nameEn: 'WhatsApp Direct Receipt & Notice Dispatch',
        descBn: 'গ্রাহকের হোয়াটসঅ্যাপ নাম্বারে পিডিএফ রিসিট ও রিমাইন্ডার পাঠানো',
        defaultEnabled: false,
      },
      {
        id: 'comm_telegram_bot',
        nameBn: 'টেলিগ্রাম বটের মাধ্যমে দৈনিক আয়ের নোটিফিকেশন',
        nameEn: 'Daily Telegram Executive Summary Bot',
        descBn: 'প্রতিদিন রাত ৯টায় সভাপতি ও পরিচালকের ফোনে অটোমেটিক সামারি পুশ',
        defaultEnabled: false,
      }
    ]
  }
];

// Helper to look up feature metadata by ID
export const getGranularFeatureMeta = (featureId) => {
  for (const cat of GRANULAR_FEATURE_CATEGORIES) {
    const f = cat.features.find(item => item.id === featureId);
    if (f) return { ...f, categoryId: cat.id, categoryNameBn: cat.nameBn, categoryNameEn: cat.nameEn, parentModule: cat.parentModule };
  }
  return null;
};

// Retrieve all granular features state for a specific tenant
export const getTenantGranularFeatures = (tenantId = null) => {
  const targetId = tenantId || getActiveWorkspaceId();
  const tenant = getTenantById(targetId);
  const result = {};

  // Build defaults
  GRANULAR_FEATURE_CATEGORIES.forEach(cat => {
    const isParentModuleOn = tenant?.modules ? tenant.modules[cat.parentModule] !== false : true;
    cat.features.forEach(f => {
      // If tenant explicitly configured this granular feature:
      if (tenant?.granularFeatures && tenant.granularFeatures[f.id] !== undefined) {
        result[f.id] = isParentModuleOn && Boolean(tenant.granularFeatures[f.id]);
      } else {
        // Fallback to default, constrained by parent module
        result[f.id] = isParentModuleOn && f.defaultEnabled;
      }
    });
  });

  return result;
};

// Toggle a specific granular feature for a tenant (Super Admin Master Switch)
export const toggleTenantGranularFeature = (tenantId, featureId, isEnabled) => {
  const tenants = getTenantsList();
  const idx = tenants.findIndex(t => t.id === tenantId);
  if (idx === -1) return false;

  const currentFeatures = tenants[idx].granularFeatures || {};
  const nextState = isEnabled !== undefined ? Boolean(isEnabled) : !currentFeatures[featureId];

  tenants[idx].granularFeatures = {
    ...currentFeatures,
    [featureId]: nextState
  };
  tenants[idx].updatedAt = new Date().toISOString();

  saveTenantsList(tenants);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('somiti_granular_feature_toggled', {
      detail: { tenantId, featureId, isEnabled: nextState }
    }));
  }

  return nextState;
};

// Batch toggle all features in an entire category for a tenant
export const bulkSetCategoryGranularFeatures = (tenantId, categoryId, isEnabled) => {
  const tenants = getTenantsList();
  const idx = tenants.findIndex(t => t.id === tenantId);
  if (idx === -1) return false;

  const category = GRANULAR_FEATURE_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return false;

  const currentFeatures = tenants[idx].granularFeatures || {};
  category.features.forEach(f => {
    currentFeatures[f.id] = Boolean(isEnabled);
  });

  tenants[idx].granularFeatures = currentFeatures;
  tenants[idx].updatedAt = new Date().toISOString();

  saveTenantsList(tenants);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('somiti_granular_feature_toggled', {
      detail: { tenantId, categoryId, isEnabled: Boolean(isEnabled) }
    }));
  }

  return true;
};

// Check if a feature is allowed by the Super Admin for a specific tenant
export const isFeatureAllowedForTenant = (featureId, tenantId = null) => {
  const targetId = tenantId || getActiveWorkspaceId();
  const tenant = getTenantById(targetId);
  if (!tenant) return true;

  const meta = getGranularFeatureMeta(featureId);
  if (!meta) return true;

  // 1. Parent Module Gate
  if (tenant.modules && tenant.modules[meta.parentModule] === false) {
    return false;
  }

  // 2. Granular Feature Gate
  if (tenant.granularFeatures && tenant.granularFeatures[featureId] !== undefined) {
    return Boolean(tenant.granularFeatures[featureId]);
  }

  return meta.defaultEnabled;
};

// ============================================================================
// SAMITY CONTROLLER CASCADING ROLE DELEGATION SYSTEM
// ============================================================================

export const SAMITY_RBAC_STORAGE_PREFIX = 'somiti360_rbac_matrix_';

// Default permissions matrix mapping all 6 roles against granular features
export const DEFAULT_GRANULAR_ROLE_MATRIX = {
  president: {
    // All allowed by default
    field_cash_collect: true,
    field_slip_print: true,
    field_sms_notify: true,
    field_daily_sheet: true,
    field_member_onboard: true,
    field_fine_reschedule: true,
    member_view_savings: true,
    member_view_loan: true,
    member_download_passbook: true,
    member_request_deposit: true,
    member_apply_loan: true,
    member_view_notices: true,
    member_request_profile_edit: true,
    savings_daily: true,
    savings_dps: true,
    savings_fdr: true,
    savings_withdraw: true,
    savings_profit_distribute: true,
    savings_waive_fee: true,
    loan_proposal_create: true,
    loan_disbursement_approve: true,
    loan_schedule_generate: true,
    loan_defaulter_notice: true,
    loan_restructure: true,
    cash_expense_entry: true,
    cash_expense_approve: true,
    bank_deposit_withdraw: true,
    bank_fund_transfer: true,
    cash_daily_closing: true,
    report_cashbook_ledger: true,
    report_income_balance_sheet: true,
    report_excel_export: true,
    report_official_pdf: true,
    report_qr_verify_portal: true,
    report_audit_trail: true,
    admin_staff_manage: true,
    admin_edit_transactions: true,
    admin_delete_records: true,
    admin_database_backup: true,
    admin_database_restore: true,
    comm_sms_gateway: true,
    comm_whatsapp_alerts: true,
    comm_telegram_bot: true,
  },
  secretary: {
    field_cash_collect: true,
    field_slip_print: true,
    field_sms_notify: true,
    field_daily_sheet: true,
    field_member_onboard: true,
    field_fine_reschedule: false,
    member_view_savings: true,
    member_view_loan: true,
    member_download_passbook: true,
    member_request_deposit: true,
    member_apply_loan: true,
    member_view_notices: true,
    member_request_profile_edit: true,
    savings_daily: true,
    savings_dps: true,
    savings_fdr: true,
    savings_withdraw: false,
    savings_profit_distribute: false,
    savings_waive_fee: false,
    loan_proposal_create: true,
    loan_disbursement_approve: false,
    loan_schedule_generate: true,
    loan_defaulter_notice: true,
    loan_restructure: false,
    cash_expense_entry: true,
    cash_expense_approve: false,
    bank_deposit_withdraw: false,
    bank_fund_transfer: false,
    cash_daily_closing: false,
    report_cashbook_ledger: true,
    report_income_balance_sheet: true,
    report_excel_export: true,
    report_official_pdf: true,
    report_qr_verify_portal: true,
    report_audit_trail: true,
    admin_staff_manage: true,
    admin_edit_transactions: false,
    admin_delete_records: false,
    admin_database_backup: true,
    admin_database_restore: false,
    comm_sms_gateway: true,
    comm_whatsapp_alerts: true,
    comm_telegram_bot: false,
  },
  treasurer: {
    field_cash_collect: true,
    field_slip_print: true,
    field_sms_notify: true,
    field_daily_sheet: true,
    field_member_onboard: false,
    field_fine_reschedule: false,
    member_view_savings: true,
    member_view_loan: true,
    member_download_passbook: true,
    member_request_deposit: true,
    member_apply_loan: false,
    member_view_notices: true,
    member_request_profile_edit: false,
    savings_daily: true,
    savings_dps: true,
    savings_fdr: true,
    savings_withdraw: true,
    savings_profit_distribute: true,
    savings_waive_fee: false,
    loan_proposal_create: false,
    loan_disbursement_approve: false,
    loan_schedule_generate: false,
    loan_defaulter_notice: false,
    loan_restructure: false,
    cash_expense_entry: true,
    cash_expense_approve: false,
    bank_deposit_withdraw: true,
    bank_fund_transfer: true,
    cash_daily_closing: true,
    report_cashbook_ledger: true,
    report_income_balance_sheet: true,
    report_excel_export: true,
    report_official_pdf: true,
    report_qr_verify_portal: true,
    report_audit_trail: false,
    admin_staff_manage: false,
    admin_edit_transactions: false,
    admin_delete_records: false,
    admin_database_backup: false,
    admin_database_restore: false,
    comm_sms_gateway: false,
    comm_whatsapp_alerts: true,
    comm_telegram_bot: false,
  },
  field_officer: {
    field_cash_collect: true,
    field_slip_print: true,
    field_sms_notify: true,
    field_daily_sheet: true,
    field_member_onboard: true,
    field_fine_reschedule: false,
    member_view_savings: true,
    member_view_loan: true,
    member_download_passbook: true,
    member_request_deposit: false,
    member_apply_loan: false,
    member_view_notices: true,
    member_request_profile_edit: false,
    savings_daily: true,
    savings_dps: true,
    savings_fdr: false,
    savings_withdraw: false,
    savings_profit_distribute: false,
    savings_waive_fee: false,
    loan_proposal_create: false,
    loan_disbursement_approve: false,
    loan_schedule_generate: false,
    loan_defaulter_notice: false,
    loan_restructure: false,
    cash_expense_entry: false,
    cash_expense_approve: false,
    bank_deposit_withdraw: false,
    bank_fund_transfer: false,
    cash_daily_closing: false,
    report_cashbook_ledger: false,
    report_income_balance_sheet: false,
    report_excel_export: false,
    report_official_pdf: false,
    report_qr_verify_portal: true,
    report_audit_trail: false,
    admin_staff_manage: false,
    admin_edit_transactions: false,
    admin_delete_records: false,
    admin_database_backup: false,
    admin_database_restore: false,
    comm_sms_gateway: false,
    comm_whatsapp_alerts: false,
    comm_telegram_bot: false,
  },
  auditor: {
    field_cash_collect: false,
    field_slip_print: false,
    field_sms_notify: false,
    field_daily_sheet: false,
    field_member_onboard: false,
    field_fine_reschedule: false,
    member_view_savings: true,
    member_view_loan: true,
    member_download_passbook: true,
    member_request_deposit: false,
    member_apply_loan: false,
    member_view_notices: true,
    member_request_profile_edit: false,
    savings_daily: false,
    savings_dps: false,
    savings_fdr: false,
    savings_withdraw: false,
    savings_profit_distribute: false,
    savings_waive_fee: false,
    loan_proposal_create: false,
    loan_disbursement_approve: false,
    loan_schedule_generate: false,
    loan_defaulter_notice: false,
    loan_restructure: false,
    cash_expense_entry: false,
    cash_expense_approve: false,
    bank_deposit_withdraw: false,
    bank_fund_transfer: false,
    cash_daily_closing: false,
    report_cashbook_ledger: true,
    report_income_balance_sheet: true,
    report_excel_export: true,
    report_official_pdf: true,
    report_qr_verify_portal: true,
    report_audit_trail: true,
    admin_staff_manage: false,
    admin_edit_transactions: false,
    admin_delete_records: false,
    admin_database_backup: true,
    admin_database_restore: false,
    comm_sms_gateway: false,
    comm_whatsapp_alerts: false,
    comm_telegram_bot: false,
  },
  general_member: {
    // Only self-service member portal items allowed
    field_cash_collect: false,
    field_slip_print: false,
    field_sms_notify: false,
    field_daily_sheet: false,
    field_member_onboard: false,
    field_fine_reschedule: false,
    member_view_savings: true,
    member_view_loan: true,
    member_download_passbook: true,
    member_request_deposit: true,
    member_apply_loan: true,
    member_view_notices: true,
    member_request_profile_edit: true,
    savings_daily: false,
    savings_dps: false,
    savings_fdr: false,
    savings_withdraw: false,
    savings_profit_distribute: false,
    savings_waive_fee: false,
    loan_proposal_create: false,
    loan_disbursement_approve: false,
    loan_schedule_generate: false,
    loan_defaulter_notice: false,
    loan_restructure: false,
    cash_expense_entry: false,
    cash_expense_approve: false,
    bank_deposit_withdraw: false,
    bank_fund_transfer: false,
    cash_daily_closing: false,
    report_cashbook_ledger: false,
    report_income_balance_sheet: false,
    report_excel_export: false,
    report_official_pdf: false,
    report_qr_verify_portal: true,
    report_audit_trail: false,
    admin_staff_manage: false,
    admin_edit_transactions: false,
    admin_delete_records: false,
    admin_database_backup: false,
    admin_database_restore: false,
    comm_sms_gateway: false,
    comm_whatsapp_alerts: false,
    comm_telegram_bot: false,
  }
};

// Retrieve Samity Controller's delegated permission matrix for a tenant
export const getSamityRolePermissions = (tenantId = null, roleId = null) => {
  const targetId = tenantId || getActiveWorkspaceId();
  try {
    const raw = localStorage.getItem(`${SAMITY_RBAC_STORAGE_PREFIX}${targetId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (roleId) return parsed[roleId] || DEFAULT_GRANULAR_ROLE_MATRIX[roleId] || {};
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse Samity RBAC matrix:', e);
  }
  if (roleId) return DEFAULT_GRANULAR_ROLE_MATRIX[roleId] || {};
  return DEFAULT_GRANULAR_ROLE_MATRIX;
};

// Save Samity Controller's delegated permissions
export const saveSamityRolePermissions = (tenantId = null, roleId, permissions) => {
  const targetId = tenantId || getActiveWorkspaceId();
  const current = getSamityRolePermissions(targetId);
  const updated = {
    ...current,
    [roleId]: permissions
  };
  try {
    localStorage.setItem(`${SAMITY_RBAC_STORAGE_PREFIX}${targetId}`, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('somiti_rbac_matrix_updated', {
        detail: { tenantId: targetId, roleId, permissions }
      }));
    }
  } catch (e) {
    console.error('Failed to save Samity RBAC matrix:', e);
  }
  return updated;
};

// Reset Samity RBAC to defaults
export const resetSamityRolePermissionsToDefault = (tenantId = null) => {
  const targetId = tenantId || getActiveWorkspaceId();
  try {
    localStorage.removeItem(`${SAMITY_RBAC_STORAGE_PREFIX}${targetId}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('somiti_rbac_matrix_updated', {
        detail: { tenantId: targetId, reset: true }
      }));
    }
  } catch (e) {
    console.error('Failed to reset Samity RBAC matrix:', e);
  }
  return DEFAULT_GRANULAR_ROLE_MATRIX;
};

/**
 * DOUBLE-GATE ENTERPRISE PERMISSION CHECK (Cascading Zero-Bypass)
 * Gate 1: Did Super Admin allow this feature in tenant's SaaS license?
 * Gate 2: Did Samity Controller grant this feature to this specific role?
 */
export const canRolePerformAction = (tenantId = null, roleId, featureId) => {
  const targetId = tenantId || getActiveWorkspaceId();

  // 1. GATE 1: Super Admin Master Switch
  const isAllowedBySuperAdmin = isFeatureAllowedForTenant(featureId, targetId);
  if (!isAllowedBySuperAdmin) {
    return {
      allowed: false,
      reason: 'LOCKED_BY_SUPER_ADMIN',
      messageBn: 'সুপার এডমিন কর্তৃক এই ফিচারটি এই সমিতির প্ল্যানে লক করা রয়েছে।',
      messageEn: 'This feature is locked by the Super Admin license for this organization.'
    };
  }

  // 2. GATE 2: Samity Controller Delegation Check
  const samityPermissions = getSamityRolePermissions(targetId, roleId);
  const isGrantedBySamityAdmin = Boolean(samityPermissions[featureId]);

  if (!isGrantedBySamityAdmin) {
    return {
      allowed: false,
      reason: 'DENIED_BY_SAMITY_ADMIN',
      messageBn: 'সমিতি অ্যাডমিন কর্তৃক এই পদের জন্য এই সুবিধার পারমিশন অফ রাখা হয়েছে।',
      messageEn: 'The samity controller has disabled this action for your role.'
    };
  }

  // Granted through both gates
  return {
    allowed: true,
    reason: 'GRANTED',
    messageBn: 'অনুমোদিত',
    messageEn: 'Granted'
  };
};
