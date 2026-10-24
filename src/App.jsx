import React, { useState, useEffect, Component } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SamityManagementHub } from './components/samity/SamityManagementHub';
import { SamityDocVerificationView } from './components/samity/SamityDocVerificationView';
import { SomitiAuthView } from './components/auth/SomitiAuthView';
import { DeviceMeshStatusModal } from './components/samity/DeviceMeshStatusModal';
import { Users, ShieldCheck, RefreshCw, AlertTriangle, LogOut, Globe, Sun, Moon, Palette, Check } from 'lucide-react';

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

function MainView() {
  const { lang = 'bn', setLang, theme = 'dark', setTheme, toggleTheme, user, logout, authLoading, isAuthenticated } = useApp();
  const [viewMode, setViewMode] = useState('hub'); // 'hub' | 'verify'
  const [verifyData, setVerifyData] = useState(null);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isDeviceMeshModalOpen, setIsDeviceMeshModalOpen] = useState(false);

  const isLight = theme === 'light' || theme === 'nordic_clean';

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('verify') || params.get('ref') || params.get('title')) {
          setVerifyData({
            ref: params.get('ref'),
            title: params.get('title'),
            samity: params.get('samity'),
            reg: params.get('reg'),
            date: params.get('date'),
            body: params.get('body'),
            hash: params.get('hash')
          });
          setViewMode('verify');
        }
      }
    } catch (e) {
      console.warn('URL search params parsing ignored:', e);
    }
  }, []);

  // Public QR Document Verification View
  if (viewMode === 'verify') {
    return (
      <SamityDocVerificationView 
        verifyData={verifyData} 
        onBackToApp={() => {
          setViewMode('hub');
          if (typeof window !== 'undefined' && window.history.pushState) {
            window.history.pushState({}, '', window.location.pathname);
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
    return <SomitiAuthView onAuthSuccess={() => {}} />;
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
        {/* Tier 1: Brand Emblem & Master User Profile + Logout */}
        <div className="somiti-brand-profile-row">
          {/* Brand Identity */}
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
                  {lang === 'en' ? 'Somiti 360' : 'সমিতি ৩৬০'}
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
                  PRO v1.0
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: isLight ? '#475569' : '#94a3b8', fontWeight: '700' }}>
                {lang === 'en' ? 'Smart Cooperative & Savings ERP' : 'হিসাব ও ব্যবস্থাপনা প্ল্যাটফর্ম'}
              </p>
            </div>
          </div>

          {/* User Profile Chip & Logout (সাজ্জাদ হোসেন - প্রধান এডমিন) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '900', color: isLight ? '#0f172a' : '#f8fafc', lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '11px' }}>👑</span>
                {user?.name || (lang === 'en' ? 'Sajjad Hossan' : 'সাজ্জাদ হোসেন')}
              </span>
              <span style={{ fontSize: '0.64rem', fontWeight: '800', color: isLight ? '#059669' : '#34d399' }}>
                {lang === 'en' ? 'Head Admin' : 'প্রধান এডমিন'}
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
              onClick={logout}
              title={lang === 'en' ? 'Logout' : 'লগআউট করুন'}
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
              <span style={{ display: 'inline' }}>{lang === 'en' ? 'Logout' : 'লগআউট'}</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Executive Touch-Swipeable Control Pill Track (৪টি প্ল্যাটফর্ম, ডে মোড, থিম, ইংলিশ, ভেরিফিকেশন) */}
        <div className="somiti-controls-track">
          {/* 0. Live Cross-Platform Device Mesh Status Button */}
          <button
            onClick={() => setIsDeviceMeshModalOpen(true)}
            title={lang === 'en' ? 'Cross-Platform Mesh Status' : '৪টি প্ল্যাটফর্ম লাইভ সিঙ্ক স্ট্যাটাস (APK, Web, PC, Mac)'}
            style={{
              background: isLight ? '#f0fdf4' : 'rgba(16, 185, 129, 0.15)',
              color: isLight ? '#15803d' : '#34d399',
              border: isLight ? '1.5px solid #86efac' : '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '9px',
              padding: '6px 11px',
              fontSize: '0.74rem',
              fontWeight: '800',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)'
            }}
          >
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span>{lang === 'en' ? '4 Platforms Synced ⚡' : '৪টি প্ল্যাটফর্ম সিঙ্কড ⚡'}</span>
          </button>

          {/* 1. Day / Night Toggle Button */}
          <button
            onClick={toggleTheme}
            title={isLight ? (lang === 'en' ? 'Switch to Night Mode' : 'নাইট মোডে যান') : (lang === 'en' ? 'Switch to Day Mode' : 'ডে মোডে যান')}
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
            <span>{isLight ? (lang === 'en' ? 'Night' : 'নাইট মোড') : (lang === 'en' ? 'Day' : 'ডে মোড')}</span>
          </button>

          {/* 2. Multi-Theme Palette Selector */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setIsThemeDropdownOpen(prev => !prev)}
              title={lang === 'en' ? 'Choose Theme Color' : 'থিম কালার পছন্দ করুন'}
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
              <Palette size={14} color={isLight ? '#059669' : '#2dd4bf'} />
              <span>{lang === 'en' ? 'Themes' : 'থিম'}</span>
            </button>

            {isThemeDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  zIndex: 100,
                  background: isLight ? '#ffffff' : '#0f172a',
                  border: isLight ? '1.5px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '6px',
                  minWidth: '190px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                {THEME_OPTIONS.map(opt => {
                  const isSelected = theme === opt.id;
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
                        background: isSelected ? (isLight ? '#e0f2fe' : 'rgba(16, 185, 129, 0.18)') : 'transparent',
                        color: isSelected ? (isLight ? '#0284c7' : '#34d399') : (isLight ? '#0f172a' : '#cbd5e1'),
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.76rem',
                        fontWeight: isSelected ? '800' : '600',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{opt.icon}</span>
                        <span>{lang === 'en' ? opt.nameEn : opt.nameBn}</span>
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
            title={lang === 'en' ? 'বাংলা ভাষায় পরিবর্তন করুন' : 'Switch to English'}
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
            <span>{lang === 'en' ? '🇧🇩 বাংলা' : '🇬🇧 English'}</span>
          </button>

          {/* 4. Verification Portal Button */}
          <button
            onClick={() => setViewMode(viewMode === 'verify' ? 'hub' : 'verify')}
            style={{
              background: viewMode === 'verify' ? 'rgba(16, 185, 129, 0.2)' : (isLight ? '#f1f5f9' : 'rgba(30, 41, 59, 0.9)'),
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
            <span>{lang === 'en' ? 'Verification' : 'ভেরিফিকেশন'}</span>
          </button>
        </div>
      </header>

      <main style={{ flex: 1, width: '100%' }}>
        <SamityManagementHub />
      </main>

      {/* Cross-Platform Device Mesh Status & Telegram Timestamp Modal */}
      <DeviceMeshStatusModal
        isOpen={isDeviceMeshModalOpen}
        onClose={() => setIsDeviceMeshModalOpen(false)}
        isLight={isLight}
        t={(bn, en) => lang === 'en' ? (en || bn) : bn}
      />
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
