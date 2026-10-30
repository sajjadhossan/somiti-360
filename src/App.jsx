import React, { useState, useEffect, Component, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SamityManagementHub } from './components/samity/SamityManagementHub';
import { SomitiAuthView } from './components/auth/SomitiAuthView';
import { PublicVerificationPortal } from './components/samity/PublicVerificationPortal';
import { EnterpriseOfflineBanner } from './components/samity/EnterpriseOfflineBanner';
import { subscribeDevicePresence, getOnlineDevicesList } from './services/somitiCloudSyncService';
import { getPendingQueueCount } from './services/somitiOfflineStore';
import { ShieldCheck, RefreshCw, AlertTriangle, LogOut, Globe, Sun, Moon, Palette, Check, WifiOff, Database, MessageSquare } from 'lucide-react';

// Lazy-loaded heavy modal views for optimal bundle splitting
const SamityDocVerificationView = lazy(() => import('./components/samity/SamityDocVerificationView').then(m => ({ default: m.SamityDocVerificationView })));
const DeviceMeshStatusModal = lazy(() => import('./components/samity/DeviceMeshStatusModal').then(m => ({ default: m.DeviceMeshStatusModal })));
const SyncConflictResolutionModal = lazy(() => import('./components/samity/SyncConflictResolutionModal').then(m => ({ default: m.SyncConflictResolutionModal })));

// Error Boundary to prevent any blank screen
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Samity 360 Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#070b12', color: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#f87171' }}>
            <AlertTriangle size={32} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>সাময়িক ত্রুটি পরিলক্ষিত হয়েছে</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '420px', marginBottom: '20px' }}>
            অ্যাপ্লিকেশনের কোনো ডেটা লোড হতে সমস্যা হয়েছে। নিচের বাটনে চাপ দিয়ে রিলোড করুন।
          </p>
          <pre style={{ fontSize: '0.75rem', color: '#fca5a5', background: 'rgba(127, 29, 29, 0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(185, 28, 28, 0.4)', maxWidth: '500px', overflow: 'auto', marginBottom: '20px' }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', background: '#10b981', color: '#090d16', fontWeight: '800', cursor: 'pointer', border: 'none', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}
          >
            <RefreshCw size={16} />
            <span>অ্যাপ্লিকেশন রিলোড করুন</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const THEME_OPTIONS = [
  { id: 'dark', nameBn: 'ডার্ক নেভি (ডিফল্ট)', nameEn: 'Dark Navy (Default)', color: '#0f172a', icon: '🌙' },
  { id: 'light', nameBn: 'ডে লাইট (পরিচ্ছন্ন)', nameEn: 'Day Light (Crisp)', color: '#f8fafc', icon: '☀️' },
  { id: 'emerald_matrix', nameBn: 'এমারেল্ড গ্রিন', nameEn: 'Emerald Green', color: '#047857', icon: '🌲' },
  { id: 'luxury_gold', nameBn: 'লাক্সারি গোল্ড', nameEn: 'Luxury Gold', color: '#d97706', icon: '👑' },
  { id: 'cyber_slate', nameBn: 'সাইবার স্লেট', nameEn: 'Cyber Slate', color: '#0284c7', icon: '⚡' },
  { id: 'oled', nameBn: 'ওলেড ব্ল্যাক', nameEn: 'OLED Pure Black', color: '#000000', icon: '🖤' }
];

// Helper style & text evaluators to eliminate nested ternaries
function getMeshButtonBg(isOnline, pendingQueueCount, deviceCount, isLight) {
  if (!isOnline) return 'rgba(245, 158, 11, 0.18)';
  if (pendingQueueCount > 0) return 'rgba(168, 85, 247, 0.2)';
  if (deviceCount > 1) return isLight ? '#dcfce7' : 'rgba(16, 185, 129, 0.25)';
  return isLight ? '#f0fdf4' : 'rgba(16, 185, 129, 0.15)';
}

function getMeshButtonColor(isOnline, pendingQueueCount, isLight) {
  if (!isOnline) return '#f59e0b';
  if (pendingQueueCount > 0) return '#c084fc';
  if (isLight) return '#15803d';
  return '#34d399';
}

function getMeshButtonBorder(isOnline, pendingQueueCount, deviceCount, isLight) {
  if (!isOnline) return '1.5px solid #f59e0b';
  if (pendingQueueCount > 0) return '1.5px solid #a855f7';
  if (deviceCount > 1) return '1.5px solid #10b981';
  return isLight ? '1.5px solid #86efac' : '1px solid rgba(16, 185, 129, 0.4)';
}

function getMeshButtonLabel(isOnline, pendingQueueCount, deviceCount, lang) {
  const isEn = lang === 'en';
  if (!isOnline) {
    return isEn ? 'Offline (IndexedDB Ready)' : 'অফলাইন (IndexedDB সক্রিয়)';
  }
  if (pendingQueueCount > 0) {
    return isEn ? `Pending Queue (${pendingQueueCount})` : `পেন্ডিং কিউ (${pendingQueueCount})`;
  }
  if (deviceCount > 1) {
    return isEn ? `4 Platforms (${deviceCount} Online) ⚡` : `৪টি প্ল্যাটফর্ম (${deviceCount}টি অনলাইন) ⚡`;
  }
  return isEn ? '4 Platforms Synced ⚡' : '৪টি প্ল্যাটফর্ম সিঙ্কড ⚡';
}

function getDayNightButtonTitle(isLight, lang) {
  const isEn = lang === 'en';
  if (isLight) {
    return isEn ? 'Switch to Night Mode' : 'নাইট মোডে যান';
  }
  return isEn ? 'Switch to Day Mode' : 'ডে মোডে যান';
}

function getDayNightButtonLabel(isLight, lang) {
  const isEn = lang === 'en';
  if (isLight) {
    return isEn ? 'Night' : 'নাইট মোড';
  }
  return isEn ? 'Day' : 'ডে মোড';
}

function getVerifyButtonBg(isVerifyActive, isLight) {
  if (isVerifyActive) return 'rgba(16, 185, 129, 0.2)';
  return isLight ? '#f1f5f9' : 'rgba(30, 41, 59, 0.9)';
}

// Subcomponent: Executive Header Brand & User Profile
function ExecutiveHeaderBrand({ isLight, lang, user, onLogout }) {
  const isEn = lang === 'en';
  return (
    <div className="somiti-brand-profile-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          title="Somiti 360 Master Logo"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: isLight ? '#ffffff' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(15, 23, 42, 0.95))',
            border: isLight ? '1.5px solid #059669' : '1.5px solid rgba(45, 212, 191, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: '2px',
            boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.06)' : '0 4px 14px rgba(0,0,0,0.3)',
            cursor: 'pointer'
          }}
        >
          <img
            src="/somiti-emblem.png"
            alt="Somiti 360 Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => { e.currentTarget.src = '/Somiti_360_Official_Logo.png'; }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: isLight ? '#0f172a' : '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              {isEn ? 'Somiti 360' : 'সমিতি ৩৬০'}
            </h1>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: '800',
                background: isLight ? '#e0f2fe' : 'rgba(16, 185, 129, 0.15)',
                color: isLight ? '#0369a1' : '#34d399',
                border: isLight ? '1px solid #bae6fd' : '1px solid rgba(16, 185, 129, 0.3)',
                padding: '1px 6px',
                borderRadius: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
              }}
            >
              PRO v1.0.15
            </span>
          </div>
          <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: isLight ? '#475569' : '#94a3b8', fontWeight: '700' }}>
            {isEn ? 'Smart Cooperative & Savings ERP' : 'হিসাব ও ব্যবস্থাপনা প্ল্যাটফর্ম'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '900', color: isLight ? '#0f172a' : '#f8fafc', lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '11px' }}>👑</span>
            {user?.name || (isEn ? 'Sajjad Hossan' : 'সাজ্জাদ হোসেন')}
          </span>
          <span style={{ fontSize: '0.64rem', fontWeight: '800', color: isLight ? '#059669' : '#34d399' }}>
            {isEn ? 'Head Admin' : 'প্রধান এডমিন'}
          </span>
        </div>

        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '9px',
            background: isLight ? 'rgba(5, 150, 105, 0.12)' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(15, 23, 42, 0.95))',
            border: isLight ? '1.5px solid #059669' : '1.5px solid rgba(45, 212, 191, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isLight ? '#059669' : '#34d399',
            fontWeight: '900',
            fontSize: '0.75rem',
            textTransform: 'uppercase'
          }}
        >
          {user?.name ? user.name[0] : 'S'}
        </div>

        <button
          onClick={onLogout}
          title={isEn ? 'Logout' : 'লগআউট করুন'}
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '5px 8px',
            fontSize: '0.72rem',
            fontWeight: '800',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
        >
          <LogOut size={13} />
          <span style={{ display: 'inline' }}>{isEn ? 'Logout' : 'লগআউট'}</span>
        </button>
      </div>
    </div>
  );
}

// Subcomponent: Executive Touch-Swipeable Control Pill Track
function ExecutiveControlsTrack({
  lang,
  setLang,
  theme,
  setTheme,
  toggleTheme,
  isLight,
  isOnline,
  pendingQueueCount,
  onlineDevices,
  setIsDeviceMeshModalOpen,
  viewMode,
  setViewMode,
  chatCount,
  isThemeDropdownOpen,
  setIsThemeDropdownOpen
}) {
  const isEn = lang === 'en';
  const meshBg = getMeshButtonBg(isOnline, pendingQueueCount, onlineDevices.length, isLight);
  const meshColor = getMeshButtonColor(isOnline, pendingQueueCount, isLight);
  const meshBorder = getMeshButtonBorder(isOnline, pendingQueueCount, onlineDevices.length, isLight);
  const meshLabel = getMeshButtonLabel(isOnline, pendingQueueCount, onlineDevices.length, lang);
  const dayNightTitle = getDayNightButtonTitle(isLight, lang);
  const verifyBg = getVerifyButtonBg(viewMode === 'verify', isLight);

  return (
    <div className="somiti-controls-track">
      {/* 0. Live Cross-Platform Device Mesh Status Button */}
      <button
        onClick={() => setIsDeviceMeshModalOpen(true)}
        title={isEn ? 'Cross-Platform Mesh Status' : '৪টি প্ল্যাটফর্ম লাইভ সিঙ্ক স্ট্যাটাস (APK, Web, PC, Mac)'}
        style={{
          background: meshBg,
          color: meshColor,
          border: meshBorder,
          borderRadius: '9px',
          padding: '6px 11px',
          fontSize: '0.74rem',
          fontWeight: '800',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: onlineDevices.length > 1 ? '0 0 12px rgba(16, 185, 129, 0.4)' : '0 2px 6px rgba(16, 185, 129, 0.15)'
        }}
      >
        {!isOnline ? (
          <WifiOff size={13} color="#f59e0b" />
        ) : pendingQueueCount > 0 ? (
          <Database size={13} color="#c084fc" />
        ) : (
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
        )}
        <span>{meshLabel}</span>
      </button>

      {/* 1. Day / Night Toggle Button */}
      <button
        onClick={toggleTheme}
        title={dayNightTitle}
        style={{
          background: isLight ? '#f1f5f9' : 'rgba(30, 41, 59, 0.9)',
          color: isLight ? '#0f172a' : '#f8fafc',
          border: isLight ? '1.5px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '9px',
          padding: '6px 10px',
          fontSize: '0.76rem',
          fontWeight: '800',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
        }}
      >
        {isLight ? <Moon size={14} color="#4f46e5" /> : <Sun size={14} color="#fbbf24" />}
        <span>{getDayNightButtonLabel(isLight, lang)}</span>
      </button>

      {/* 2. Multi-Theme Palette Selector */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={() => setIsThemeDropdownOpen(prev => !prev)}
          title={isEn ? 'Choose Theme Color' : 'থিম কালার পছন্দ করুন'}
          style={{
            background: isLight ? '#f1f5f9' : 'rgba(30, 41, 59, 0.9)',
            color: isLight ? '#0f172a' : '#f8fafc',
            border: isLight ? '1.5px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '9px',
            padding: '6px 10px',
            fontSize: '0.76rem',
            fontWeight: '800',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
          }}
        >
          <Palette size={14} color={isLight ? '#059669' : '#34d399'} />
          <span>{isEn ? 'Theme' : 'থিম'}</span>
        </button>

        {isThemeDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              zIndex: 100,
              minWidth: '220px',
              background: isLight ? '#ffffff' : '#0f172a',
              border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '6px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            {THEME_OPTIONS.map(opt => {
              const isSelected = theme === opt.id;
              let itemBg = 'transparent';
              if (isSelected) {
                itemBg = isLight ? '#e0f2fe' : 'rgba(16, 185, 129, 0.18)';
              }
              let itemColor = isLight ? '#0f172a' : '#cbd5e1';
              if (isSelected) {
                itemColor = isLight ? '#0284c7' : '#34d399';
              }
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsThemeDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    background: itemBg,
                    color: itemColor,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.76rem',
                    fontWeight: isSelected ? '800' : '600',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{opt.icon}</span>
                    <span>{isEn ? opt.nameEn : opt.nameBn}</span>
                  </span>
                  {isSelected && <Check size={14} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Bilingual Language Switcher */}
      <button
        onClick={() => {
          const next = lang === 'en' ? 'bn' : 'en';
          if (setLang) setLang(next);
        }}
        title={isEn ? 'বাংলা ভাষায় পরিবর্তন করুন' : 'Switch to English'}
        style={{
          background: isLight ? '#f1f5f9' : 'rgba(30, 41, 59, 0.9)',
          color: isLight ? '#0f172a' : '#f8fafc',
          border: isLight ? '1.5px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '9px',
          padding: '6px 12px',
          fontSize: '0.76rem',
          fontWeight: '800',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
        }}
      >
        <Globe size={14} color={isLight ? '#2563eb' : '#38bdf8'} />
        <span>{isEn ? '🇧🇩 বাংলা' : '🇬🇧 English'}</span>
      </button>

      {/* 4. Verification Portal Button */}
      <button
        onClick={() => setViewMode(viewMode === 'verify' ? 'hub' : 'verify')}
        style={{
          background: verifyBg,
          color: isLight ? '#0f172a' : '#f8fafc',
          border: isLight ? '1.5px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '9px',
          padding: '6px 12px',
          fontSize: '0.76rem',
          fontWeight: '800',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
        }}
      >
        <ShieldCheck size={14} color={isLight ? '#059669' : '#34d399'} />
        <span>{isEn ? 'Verification' : 'ভেরিফিকেশন'}</span>
      </button>

      {/* 5. Internal Staff Chat & Notice Board Button */}
      <button
        onClick={() => {
          window.dispatchEvent(new CustomEvent('hk360_open_internal_chat'));
        }}
        title={isEn ? 'Internal Staff Chat & Notices' : 'অভ্যন্তরীণ স্টাফ চ্যাট ও জরুরি নোটিশ বোর্ড'}
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(139, 92, 246, 0.22))',
          color: isLight ? '#4f46e5' : '#a78bfa',
          border: isLight ? '1.5px solid #c7d2fe' : '1px solid rgba(167, 139, 250, 0.45)',
          borderRadius: '9px',
          padding: '6px 12px',
          fontSize: '0.76rem',
          fontWeight: '800',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)'
        }}
      >
        <MessageSquare size={14} color={isLight ? '#4f46e5' : '#c084fc'} />
        <span>{isEn ? 'Internal Chat' : 'অভ্যন্তরীণ চ্যাট'}</span>
        {chatCount > 0 && (
          <span
            style={{
              background: '#ef4444',
              color: '#fff',
              fontSize: '0.62rem',
              fontWeight: '900',
              padding: '1px 5px',
              borderRadius: '10px',
              lineHeight: 1
            }}
          >
            {chatCount}
          </span>
        )}
      </button>
    </div>
  );
}

function MainView() {
  const { lang = 'bn', setLang, theme = 'dark', setTheme, toggleTheme, user, logout, authLoading, isAuthenticated } = useApp();

  // Synchronous URL verification parameter extraction (Public Instant Verification)
  const [verifyData, setVerifyData] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname || '';
        const params = new URLSearchParams(window.location.search);

        // 0. New standard ultra-short URL: /verify?c=... or ?verify=... or /verify
        if (path === '/verify' || path === '/verify/' || params.get('c') || params.get('r') || params.get('code')) {
          const allParams = Object.fromEntries(params.entries());
          const codeParam = params.get('c') || params.get('code') || '';
          const receiptParam = params.get('r') || params.get('receipt_no') || '';
          const typeParam = params.get('t') || params.get('verify') || 'receipt';
          return {
            ...allParams,
            type: typeParam,
            code: codeParam,
            receipt_no: receiptParam,
            doc_id: codeParam || receiptParam,
            memberName: params.get('n') || '',
            depositorName: params.get('m') || '',
            amount: params.get('a') || '0',
            date: params.get('d') || '',
            monthYear: params.get('p') || '',
            samity: params.get('s') || ''
          };
        }

        // 1. Direct path load: /verify/:type/:id or /verify/code/:code
        if (path.includes('/verify/')) {
          const parts = path.split('/verify/')[1]?.split('?')[0]?.split('/') || [];
          const docType = parts[0] || params.get('verify') || 'receipt';
          const docId = parts[1] ? decodeURIComponent(parts[1]) : (params.get('doc_id') || params.get('receipt_no') || params.get('code') || '');
          const allParams = Object.fromEntries(params.entries());
          return {
            ...allParams,
            type: docType,
            doc_id: docId,
            token: params.get('token') || allParams.data || ''
          };
        }

        // 2. Query string format
        if (params.get('verify') || params.get('ref') || params.get('title') || params.get('receipt_no') || params.get('doc_verify') || params.get('code')) {
          const allParams = Object.fromEntries(params.entries());
          return {
            ...allParams,
            type: params.get('verify') || allParams.t || 'samity_doc',
            doc_id: params.get('doc_id') || params.get('receipt_no') || params.get('code') || ''
          };
        }
      }
    } catch (e) {
      console.warn('URL search params parsing ignored:', e);
    }
    return null;
  });

  const [viewMode, setViewMode] = useState(() => (verifyData ? 'verify' : 'hub'));
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isDeviceMeshModalOpen, setIsDeviceMeshModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [onlineDevices, setOnlineDevices] = useState(() => getOnlineDevicesList());
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [pendingQueueCount, setPendingQueueCount] = useState(0);
  const [chatCount, setChatCount] = useState(() => {
    try {
      const raw = localStorage.getItem('hk360_samity_hub_data');
      if (raw) {
        const d = JSON.parse(raw);
        return (d.chatMessages || []).length;
      }
    } catch {}
    return 0;
  });

  useEffect(() => {
    const unsub = subscribeDevicePresence((list) => {
      if (Array.isArray(list)) setOnlineDevices(list);
    });

    const updateNetwork = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);

    getPendingQueueCount().then(c => setPendingQueueCount(c)).catch(() => {});
    const handleQueueChange = (e) => {
      if (e?.detail?.count !== undefined) {
        setPendingQueueCount(e.detail.count);
      } else {
        getPendingQueueCount().then(c => setPendingQueueCount(c)).catch(() => {});
      }
    };
    window.addEventListener('somiti_offline_queue_changed', handleQueueChange);

    const handleDataUpdate = (e) => {
      const d = e?.detail;
      if (d && Array.isArray(d.chatMessages)) {
        setChatCount(d.chatMessages.length);
      }
    };
    window.addEventListener('hk360_samity_updated', handleDataUpdate);

    return () => {
      unsub();
      window.removeEventListener('online', updateNetwork);
      window.removeEventListener('offline', updateNetwork);
      window.removeEventListener('somiti_offline_queue_changed', handleQueueChange);
      window.removeEventListener('hk360_samity_updated', handleDataUpdate);
    };
  }, []);

  const isLight = theme === 'light' || theme === 'nordic_clean';

  // Listen to popstate or navigation changes & initial route check
  useEffect(() => {
    const checkVerificationRoute = () => {
      try {
        if (typeof window !== 'undefined') {
          const path = window.location.pathname || '';
          const params = new URLSearchParams(window.location.search);

          // 0. New standard ultra-short URL: /verify?c=... or ?verify=... or /verify
          if (path === '/verify' || path === '/verify/' || params.get('c') || params.get('r') || params.get('code')) {
            const allParams = Object.fromEntries(params.entries());
            const codeParam = params.get('c') || params.get('code') || '';
            const receiptParam = params.get('r') || params.get('receipt_no') || '';
            const typeParam = params.get('t') || params.get('verify') || 'receipt';
            setVerifyData({
              ...allParams,
              type: typeParam,
              code: codeParam,
              receipt_no: receiptParam,
              doc_id: codeParam || receiptParam,
              memberName: params.get('n') || '',
              depositorName: params.get('m') || '',
              amount: params.get('a') || '0',
              date: params.get('d') || '',
              monthYear: params.get('p') || '',
              samity: params.get('s') || ''
            });
            setViewMode('verify');
            return;
          }

          // 1. RESTful Path Format: /verify/:documentType/:documentId?token=...
          if (path.includes('/verify/')) {
            const parts = path.split('/verify/')[1]?.split('?')[0]?.split('/') || [];
            const docType = parts[0] || params.get('verify') || 'receipt';
            const docId = parts[1] ? decodeURIComponent(parts[1]) : (params.get('doc_id') || params.get('receipt_no') || params.get('code') || '');
            const allParams = Object.fromEntries(params.entries());
            setVerifyData({
              ...allParams,
              type: docType,
              doc_id: docId,
              token: params.get('token') || allParams.data || ''
            });
            setViewMode('verify');
            return;
          }

          // 2. Query String Format: ?verify=receipt&doc_id=...
          if (params.get('verify') || params.get('ref') || params.get('title') || params.get('receipt_no') || params.get('doc_verify')) {
            const allParams = Object.fromEntries(params.entries());
            setVerifyData({
              ...allParams,
              type: params.get('verify') || allParams.t || 'samity_doc',
              doc_id: params.get('doc_id') || params.get('receipt_no') || ''
            });
            setViewMode('verify');
            return;
          }

          setViewMode('hub');
          setVerifyData(null);
        }
      } catch (e) {
        console.warn('Popstate params parsing error:', e);
      }
    };

    checkVerificationRoute();
    window.addEventListener('popstate', checkVerificationRoute);
    return () => window.removeEventListener('popstate', checkVerificationRoute);
  }, []);

  // 1. PUBLIC QR DOCUMENT VERIFICATION VIEW (Instant, Universal, Zero-Login Gate)
  if (viewMode === 'verify' && verifyData) {
    return (
      <Suspense fallback={
        <div style={{ minHeight: '100vh', background: '#070b12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RefreshCw size={24} color="#10b981" className="animate-spin" />
        </div>
      }>
        <SamityDocVerificationView 
          verifyData={verifyData} 
          onBackToApp={() => {
            setViewMode('hub');
            setVerifyData(null);
            if (typeof window !== 'undefined' && window.history.pushState) {
              window.history.pushState({}, '', window.location.pathname);
            }
          }} 
        />
      </Suspense>
    );
  }

  // ====================================================================
  // 0. ABSOLUTE ZERO-AUTH VERIFICATION BYPASS (Rule 1 & Rule 3)
  // MUST RUN BEFORE authLoading, isAuthenticated, or Login checks!
  // ====================================================================
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isDirectVerifyScan =
    viewMode === 'verify' ||
    searchParams.get('v') === '1' ||
    Boolean(searchParams.get('c')) ||
    Boolean(searchParams.get('code')) ||
    Boolean(searchParams.get('verify')) ||
    Boolean(searchParams.get('r')) ||
    currentPath === '/verify' ||
    currentPath.startsWith('/verify/');

  if (isDirectVerifyScan) {
    const activeParams = verifyData || Object.fromEntries(searchParams.entries());
    return (
      <PublicVerificationPortal
        initialParams={activeParams}
        onBackToApp={() => {
          setViewMode('hub');
          setVerifyData(null);
          if (typeof window !== 'undefined' && window.history.pushState) {
            window.history.pushState({}, '', '/');
          }
        }}
      />
    );
  }

  // Loading Session State
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #070b14)', color: 'var(--text-main, #f8fafc)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <RefreshCw size={24} color="#10b981" className="animate-spin" />
        </div>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 4px', color: '#fff' }}>সমিতি ৩৬০</h3>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>নিরাপদ সেশন যাচাই করা হচ্ছে...</p>
      </div>
    );
  }

  // Strict Authentication Gate (Rule 7)
  if (!isAuthenticated) {
    return (
      <SomitiAuthView
        onAuthSuccess={() => {}}
        onOpenPublicVerification={() => setViewMode('verify')}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #070b12)', color: 'var(--text-main, #f8fafc)', display: 'flex', flexDirection: 'column', paddingBottom: 'env(safe-area-inset-bottom, 0px)', fontFamily: "'Inter', 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif" }}>
      {/* ==================================================================== */}
      {/* EXECUTIVE TOP HEADER BAR (Compact 38px Logo, Pixel-Perfect, High Contrast) */}
      {/* ==================================================================== */}
      {/* Mobile-First Executive Responsive Stylesheet */}
      <style>{`
        .somiti-top-header {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(16px);
          padding-top: max(8px, env(safe-area-inset-top, 8px));
          padding-right: max(12px, env(safe-area-inset-right, 12px));
          padding-bottom: 8px;
          padding-left: max(12px, env(safe-area-inset-left, 12px));
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.2s ease;
        }
        @media (min-width: 992px) {
          .somiti-top-header {
            flex-direction: row;
            align-items: center;
            justifyContent: space-between;
            gap: 12px;
            padding-bottom: 10px;
          }
        }
        .somiti-brand-profile-row {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          width: 100%;
          gap: 10px;
        }
        @media (min-width: 992px) {
          .somiti-brand-profile-row {
            width: auto;
            justify-content: flex-start;
            gap: 16px;
          }
        }
        .somiti-controls-track {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          white-space: nowrap;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          padding: 3px 2px 4px 2px;
          width: 100%;
        }
        .somiti-controls-track::-webkit-scrollbar {
          display: none;
        }
        @media (min-width: 992px) {
          .somiti-controls-track {
            width: auto;
            overflow-x: visible;
            flex-wrap: wrap;
            justify-content: flex-end;
          }
        }
      `}</style>

      {/* ==================================================================== */}
      {/* EXECUTIVE TOP HEADER BAR (Mobile APK Touch-Optimized & Modernized) */}
      {/* ==================================================================== */}
      <header
        className="somiti-top-header"
        style={{
          background: isLight ? '#ffffff' : 'rgba(9, 13, 22, 0.95)',
          borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.04)' : '0 4px 20px rgba(0,0,0,0.3)'
        }}
      >
        <ExecutiveHeaderBrand
          isLight={isLight}
          lang={lang}
          user={user}
          onLogout={logout}
        />

        <ExecutiveControlsTrack
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          toggleTheme={toggleTheme}
          isLight={isLight}
          isOnline={isOnline}
          pendingQueueCount={pendingQueueCount}
          onlineDevices={onlineDevices}
          setIsDeviceMeshModalOpen={setIsDeviceMeshModalOpen}
          viewMode={viewMode}
          setViewMode={setViewMode}
          chatCount={chatCount}
          isThemeDropdownOpen={isThemeDropdownOpen}
          setIsThemeDropdownOpen={setIsThemeDropdownOpen}
        />
      </header>

      {/* Enterprise Offline-First Status Banner & Sync Controls */}
      <EnterpriseOfflineBanner
        isOnline={isOnline}
        pendingCount={pendingQueueCount}
        isLight={isLight}
        lang={lang}
        onOpenConflictModal={() => setIsConflictModalOpen(true)}
      />

      <main style={{ flex: 1, width: '100%' }}>
        <SamityManagementHub />
      </main>

      {/* Cross-Platform Device Mesh Status & Telegram Timestamp Modal */}
      {isDeviceMeshModalOpen && (
        <Suspense fallback={null}>
          <DeviceMeshStatusModal
            isOpen={isDeviceMeshModalOpen}
            onClose={() => setIsDeviceMeshModalOpen(false)}
            isLight={isLight}
            t={(bn, en) => (lang === 'en' && en ? en : bn)}
          />
        </Suspense>
      )}

      {/* Enterprise Sync Conflict Resolution Dialog */}
      {isConflictModalOpen && (
        <Suspense fallback={null}>
          <SyncConflictResolutionModal
            isOpen={isConflictModalOpen}
            onClose={() => setIsConflictModalOpen(false)}
            isLight={isLight}
            lang={lang}
          />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainView />
      </AppProvider>
    </ErrorBoundary>
  );
}
