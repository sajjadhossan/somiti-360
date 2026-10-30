import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Check,
  X,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  UserCheck,
  FileText,
  Wallet,
  Receipt,
  PieChart,
  Trash2,
  Download,
  Eye,
  Sliders,
  ChevronRight
} from 'lucide-react';

export const STANDARD_PERMISSIONS = [
  {
    key: 'member_manage',
    labelBn: 'সদস্য ভর্তি ও তথ্য পরিবর্তন',
    labelEn: 'Member Add & Edit',
    descBn: 'নতুন সদস্যের ফর্ম পূরণ, তথ্য পরিবর্তন ও বাতিল',
    icon: Users
  },
  {
    key: 'collect_deposit',
    labelBn: 'সঞ্চয় ও কিস্তি জমা এন্ট্রি',
    labelEn: 'Collect Deposits & Installments',
    descBn: 'সদস্যদের কাছ থেকে চাঁদা গ্রহণ ও মানি রিসিট ইস্যু',
    icon: Wallet
  },
  {
    key: 'expense_entry',
    labelBn: 'অফিস খরচ ও ভাউচার এন্ট্রি',
    labelEn: 'Expense & Voucher Entry',
    descBn: 'দৈনিক পরিচালন ব্যয় ও ক্রয় ভাউচার তৈরি',
    icon: Receipt
  },
  {
    key: 'loan_approval',
    labelBn: 'ঋণ অনুমোদন ও বিতরণ',
    labelEn: 'Loan Approval & Payout',
    descBn: 'ঋণের আবেদন যাচাই, অনুমোদন ও টাকা প্রদান',
    icon: ShieldCheck
  },
  {
    key: 'reports_view',
    labelBn: 'আর্থিক হিসাব ও রিপোর্ট দেখা',
    labelEn: 'View Financial Reports',
    descBn: 'ব্যালেন্স শিট, দৈনিক খতিয়ান ও লাভ-ক্ষতি রিপোর্ট',
    icon: PieChart
  },
  {
    key: 'backup_export',
    labelBn: 'ডাটা ব্যাকআপ ও এক্সেল ডাউনলোড',
    labelEn: 'Data Backup & Export',
    descBn: 'সকল ডাটা এক্সেল শিট বা ব্যাকআপ ফাইলে ডাউনলোড',
    icon: Download
  },
  {
    key: 'delete_records',
    labelBn: 'রেকর্ড ও সদস্য মুছে ফেলা (Delete)',
    labelEn: 'Delete Transactions & Members',
    descBn: 'জমা, খরচ বা সদস্যের রেকর্ড চিরতরে মুছে ফেলা',
    icon: Trash2
  },
  {
    key: 'notice_create',
    labelBn: 'অফিসিয়াল নোটিশ ও চিঠি তৈরি',
    labelEn: 'Official Notice & Pad',
    descBn: 'সমিতির প্যাডে অফিশিয়াল চিঠি ও নোটিশপত্র জারি',
    icon: FileText
  }
];

export const DEFAULT_ROLE_PERMISSIONS = {
  president: {
    member_manage: true,
    collect_deposit: true,
    expense_entry: true,
    loan_approval: true,
    reports_view: true,
    backup_export: true,
    delete_records: true,
    notice_create: true,
  },
  secretary: {
    member_manage: true,
    collect_deposit: true,
    expense_entry: true,
    loan_approval: false,
    reports_view: true,
    backup_export: true,
    delete_records: false,
    notice_create: true,
  },
  treasurer: {
    member_manage: false,
    collect_deposit: true,
    expense_entry: true,
    loan_approval: false,
    reports_view: true,
    backup_export: false,
    delete_records: false,
    notice_create: false,
  },
  field_officer: {
    member_manage: true,
    collect_deposit: true,
    expense_entry: false,
    loan_approval: false,
    reports_view: false,
    backup_export: false,
    delete_records: false,
    notice_create: false,
  },
  auditor: {
    member_manage: false,
    collect_deposit: false,
    expense_entry: false,
    loan_approval: false,
    reports_view: true,
    backup_export: true,
    delete_records: false,
    notice_create: false,
  },
  general_member: {
    member_manage: false,
    collect_deposit: false,
    expense_entry: false,
    loan_approval: false,
    reports_view: false,
    backup_export: false,
    delete_records: false,
    notice_create: false,
  }
};

export const ROLES_CONFIG = [
  {
    key: 'president',
    titleBn: 'সভাপতি / প্রধান এডমিন (President)',
    titleEn: 'President / Head Admin',
    descBn: 'সমিতির শীর্ষ নীতিনির্ধারক — সকল ক্ষমতাপ্রাপ্ত ও প্রধান নিয়ন্ত্রক',
    color: '#8b5cf6',
    icon: '👑'
  },
  {
    key: 'secretary',
    titleBn: 'সাধারণ সম্পাদক (General Secretary)',
    titleEn: 'General Secretary',
    descBn: 'কার্যনির্বাহী ব্যবস্থাপনা, সদস্য ভর্তি ও নোটিশ বোর্ড পরিচালনা',
    color: '#3b82f6',
    icon: '👔'
  },
  {
    key: 'treasurer',
    titleBn: 'কোষাধ্যক্ষ / ক্যাশিয়ার (Treasurer / Cashier)',
    titleEn: 'Treasurer / Cashier',
    descBn: 'ব্যাংক হিসাব, ক্যাশ ইন হ্যান্ড এবং দৈনিক জমা ও খরচ এন্ট্রি',
    color: '#10b981',
    icon: '💼'
  },
  {
    key: 'field_officer',
    titleBn: 'মাঠকর্মী / কালেক্টর (Field Collector)',
    titleEn: 'Field Officer / Collector',
    descBn: 'মাঠে গিয়ে সদস্যদের কাছ থেকে কিস্তি ও সঞ্চয় সংগ্রহ ও রসিদ তৈরি',
    color: '#f59e0b',
    icon: '🚶'
  },
  {
    key: 'auditor',
    titleBn: 'হিসাব নিরীক্ষক (Auditor / Inspector)',
    titleEn: 'Auditor / Inspector',
    descBn: 'হিসাবের স্বচ্ছতা পর্যবেক্ষণ — শুধুমাত্র রিপোর্ট ও অডিট লগ ভিউয়ার',
    color: '#06b6d4',
    icon: '🔍'
  },
  {
    key: 'general_member',
    titleBn: 'সাধারণ সদস্য (General Member)',
    titleEn: 'General Member',
    descBn: 'সমিতির সদস্য — শুধুমাত্র নিজের পাসবই, জমা স্থিতি ও রসিদ দেখতে পারবে',
    color: '#64748b',
    icon: '👤'
  }
];

/**
 * Global Permission Checker Utility
 */
export const checkRolePermission = (customRolePermissions, roleKey, permissionKey) => {
  if (!roleKey || roleKey === 'president' || roleKey === 'admin') return true;
  const rolePerms = customRolePermissions?.[roleKey] || DEFAULT_ROLE_PERMISSIONS[roleKey];
  if (!rolePerms) return false;
  return rolePerms[permissionKey] === true;
};

export const SamityRolePermissionManagerModal = ({
  isOpen,
  onClose,
  isLight = false,
  lang = 'bn',
  customRolePermissions = {},
  onSaveRolePermissions,
  activeUserRole = 'president',
  onSwitchUserRole
}) => {
  const isEn = lang === 'en';
  const [permissions, setPermissions] = useState(() => {
    return {
      ...DEFAULT_ROLE_PERMISSIONS,
      ...(customRolePermissions || {})
    };
  });
  const [selectedRoleKey, setSelectedRoleKey] = useState('field_officer');
  const [notification, setNotification] = useState(null);

  if (!isOpen) return null;

  const showNotice = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTogglePermission = (roleKey, permKey) => {
    // President always has full rights to prevent lockout
    if (roleKey === 'president') {
      showNotice(isEn ? 'President must retain all administrative permissions' : 'সভাপতির সকল ক্ষমতা বাধ্যতামূলক সংরক্ষিত', 'error');
      return;
    }

    const currentRolePerms = permissions[roleKey] || {};
    const nextVal = !currentRolePerms[permKey];

    const updated = {
      ...permissions,
      [roleKey]: {
        ...currentRolePerms,
        [permKey]: nextVal
      }
    };

    setPermissions(updated);
    if (onSaveRolePermissions) {
      onSaveRolePermissions(updated);
    }

    const perm = STANDARD_PERMISSIONS.find(p => p.key === permKey);
    const role = ROLES_CONFIG.find(r => r.key === roleKey);
    showNotice(
      nextVal
        ? `${role?.titleBn || roleKey}: ${perm?.labelBn} — চালু করা হয়েছে`
        : `${role?.titleBn || roleKey}: ${perm?.labelBn} — বন্ধ করা হয়েছে`
    );
  };

  const handleResetToDefault = () => {
    if (window.confirm(isEn ? 'Reset all permissions to default standard?' : 'সকল পারমিশন কি ডিফল্ট মানে রিসেট করতে চান?')) {
      setPermissions(DEFAULT_ROLE_PERMISSIONS);
      if (onSaveRolePermissions) {
        onSaveRolePermissions(DEFAULT_ROLE_PERMISSIONS);
      }
      showNotice(isEn ? 'Reset to default permissions' : 'ডিফল্ট পারমিশনে রিসেট করা হয়েছে');
    }
  };

  const selectedRole = ROLES_CONFIG.find(r => r.key === selectedRoleKey) || ROLES_CONFIG[0];
  const activeRolePerms = permissions[selectedRoleKey] || {};
  const activeCount = Object.values(activeRolePerms).filter(Boolean).length;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: "'Inter', 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1050px',
        maxHeight: '92vh',
        background: isLight ? '#ffffff' : '#0c1322',
        color: isLight ? '#0f172a' : '#f8fafc',
        borderRadius: '20px',
        border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Toast Notification */}
        {notification && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 100,
            background: notification.type === 'error' ? '#ef4444' : '#10b981',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: '800',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={16} />
            <span>{notification.msg}</span>
          </div>
        )}

        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
          background: isLight ? '#f8fafc' : 'rgba(15, 23, 42, 0.8)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
                  {isEn ? 'Staff & Member Role Permissions (RBAC)' : 'স্টাফ ও সদস্যদের ক্ষমতা নির্ধারণ (RBAC Matrix)'}
                </h2>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  SECURITY & ROLES
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                {isEn
                  ? 'Define which staff or members can collect deposits, add members, or view reports.'
                  : 'সমিতির অ্যাডমিন হিসেবে কোন স্টাফ বা সদস্য কী কাজ করতে পারবে তা টিকচিহ্ন দিয়ে নির্ধারণ করুন।'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleResetToDefault}
              title={isEn ? 'Reset to Default' : 'ডিফল্ট মানে রিসেট'}
              style={{
                background: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)',
                color: isLight ? '#475569' : '#cbd5e1',
                border: 'none',
                borderRadius: '10px',
                padding: '7px 12px',
                fontSize: '0.76rem',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
              <span>{isEn ? 'Reset Default' : 'ডিফল্ট রিসেট'}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)',
                color: isLight ? '#0f172a' : '#cbd5e1',
                border: 'none',
                borderRadius: '12px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Role Simulator Banner (এডমিন দেখতে পারবে অন্যরা কীভাবে দেখে) */}
        <div style={{
          padding: '12px 24px',
          background: isLight ? '#f1f5f9' : 'rgba(30, 41, 59, 0.5)',
          borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={16} color="#3b82f6" />
            <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>
              {isEn ? 'Current Active Session Role:' : 'আপনার বর্তমান সক্রিয় ভূমিকা:'}
            </span>
            <span style={{
              fontSize: '0.76rem',
              fontWeight: '900',
              padding: '2px 8px',
              borderRadius: '8px',
              background: '#3b82f6',
              color: '#ffffff'
            }}>
              {ROLES_CONFIG.find(r => r.key === activeUserRole)?.titleBn || activeUserRole}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8' }}>
              {isEn ? 'Simulate Role View:' : 'অন্যান্য ভূমিকা টেস্ট করুন:'}
            </span>
            <select
              value={activeUserRole}
              onChange={(e) => onSwitchUserRole?.(e.target.value)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                background: isLight ? '#ffffff' : '#1e293b',
                color: isLight ? '#0f172a' : '#f8fafc',
                border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '0.76rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              {ROLES_CONFIG.map(r => (
                <option key={r.key} value={r.key}>
                  {r.icon} {isEn ? r.titleEn : r.titleBn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main 2-Column Layout */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 320px) 1fr',
          overflow: 'hidden'
        }}>
          {/* Left Column: Role Selector List */}
          <div style={{
            borderRight: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: isLight ? '#fafafa' : 'rgba(15, 23, 42, 0.4)'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: isLight ? '#64748b' : '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
              {isEn ? 'Select Role to Configure' : 'পদবি নির্বাচন করুন'}
            </div>

            {ROLES_CONFIG.map(role => {
              const isSelected = selectedRoleKey === role.key;
              const rolePerms = permissions[role.key] || {};
              const enabledCount = Object.values(rolePerms).filter(Boolean).length;

              return (
                <div
                  key={role.key}
                  onClick={() => setSelectedRoleKey(role.key)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isSelected
                      ? (isLight ? '#e0f2fe' : 'rgba(2, 132, 199, 0.18)')
                      : (isLight ? '#ffffff' : 'rgba(30, 41, 59, 0.4)'),
                    border: isSelected
                      ? '1.5px solid #0284c7'
                      : (isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.05)'),
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>{role.icon}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: '900', color: isSelected ? '#0284c7' : (isLight ? '#0f172a' : '#f8fafc') }}>
                        {isEn ? role.titleEn : role.titleBn.split('(')[0].trim()}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      padding: '1px 6px',
                      borderRadius: '6px',
                      background: enabledCount > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: enabledCount > 0 ? '#10b981' : '#ef4444'
                    }}>
                      {enabledCount}/{STANDARD_PERMISSIONS.length}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', lineHeight: 1.3 }}>
                    {isEn ? role.descBn : role.descBn}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Permission Toggles Grid for Selected Role */}
          <div style={{ padding: '20px 24px', overflowY: 'auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.3rem' }}>{selectedRole.icon}</span>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900' }}>
                    {isEn ? selectedRole.titleEn : selectedRole.titleBn}
                  </h3>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                  {selectedRole.descBn}
                </p>
              </div>

              <span style={{
                fontSize: '0.75rem',
                fontWeight: '900',
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                {activeCount} {isEn ? 'Permissions Active' : 'টি পারমিশন কার্যকর'}
              </span>
            </div>

            {/* Permissions Toggles Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px'
            }}>
              {STANDARD_PERMISSIONS.map(perm => {
                const isEnabled = activeRolePerms[perm.key] === true;
                const IconCmp = perm.icon;
                const isLocked = selectedRoleKey === 'president';

                return (
                  <div
                    key={perm.key}
                    onClick={() => handleTogglePermission(selectedRoleKey, perm.key)}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      background: isEnabled
                        ? (isLight ? '#f0fdf4' : 'rgba(16, 185, 129, 0.08)')
                        : (isLight ? '#f8fafc' : 'rgba(30, 41, 59, 0.3)'),
                      border: isEnabled
                        ? '1.5px solid #10b981'
                        : (isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.08)'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      opacity: isLocked ? 0.9 : 1,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, marginRight: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: isEnabled ? '#10b981' : (isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.1)'),
                        color: isEnabled ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <IconCmp size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: '800', color: isEnabled ? (isLight ? '#065f46' : '#34d399') : (isLight ? '#64748b' : '#94a3b8') }}>
                          {isEn ? perm.labelEn : perm.labelBn}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', lineHeight: 1.2 }}>
                          {perm.descBn}
                        </div>
                      </div>
                    </div>

                    {/* Switch Indicator */}
                    <div style={{
                      width: '38px',
                      height: '22px',
                      borderRadius: '12px',
                      background: isEnabled ? '#10b981' : (isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.2)'),
                      position: 'relative',
                      flexShrink: 0,
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        position: 'absolute',
                        top: '2px',
                        left: isEnabled ? '18px' : '2px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
