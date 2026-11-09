import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCachedAuthUser, signOutUser, subscribeToAuthState } from '../services/somitiAuthService';
import { CheckCircle2, AlertCircle, X, Sparkles, AlertTriangle } from 'lucide-react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('somiti360_lang') || 'bn';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('somiti360_theme') || localStorage.getItem('hisabkitab_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('somiti360_theme', theme);
    localStorage.setItem('hisabkitab_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light' || theme === 'nordic_clean') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    } else {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' || prev === 'nordic_clean') ? 'dark' : 'light');
  };

  const [toastMessage, setToastMessage] = useState(null);

  // Authentication State
  const [user, setUser] = useState(() => getCachedAuthUser());
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((authUser) => {
      setUser(authUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOutUser();
    setUser(null);
  };

  const [businessSettings, setBusinessSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('somiti360_settings');
      return saved ? JSON.parse(saved) : {
        companyName: 'সমিতি ৩৬০',
        phone: '',
        address: '',
        companyLogo: ''
      };
    } catch {
      return {
        companyName: 'সমিতি ৩৬০',
        phone: '',
        address: '',
        companyLogo: ''
      };
    }
  });

  useEffect(() => {
    localStorage.setItem('somiti360_lang', lang);
  }, [lang]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToastMessage({ message, type, id });
    setTimeout(() => {
      setToastMessage(prev => (prev?.id === id ? null : prev));
    }, 2800);
  };

  const value = {
    lang,
    setLang,
    theme,
    setTheme,
    toggleTheme,
    showToast,
    businessSettings,
    setBusinessSettings,
    user,
    setUser,
    isAuthenticated: Boolean(user),
    authLoading,
    logout
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {toastMessage && (
        <div
          onClick={() => setToastMessage(null)}
          title="ক্লিক করে বন্ধ করুন (Click to dismiss)"
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 99999,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background:
              toastMessage.type === 'error'
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.96), rgba(153, 27, 27, 0.96))'
                : toastMessage.type === 'success'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.96), rgba(6, 95, 70, 0.96))'
                : toastMessage.type === 'warning'
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.96), rgba(180, 83, 9, 0.96))'
                : 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.96))',
            border:
              toastMessage.type === 'error'
                ? '1.5px solid #f87171'
                : toastMessage.type === 'success'
                ? '1.5px solid #34d399'
                : toastMessage.type === 'warning'
                ? '1.5px solid #fbbf24'
                : '1.5px solid rgba(45, 212, 191, 0.65)',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '12px',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.2)',
            fontSize: '0.85rem',
            fontWeight: '800',
            maxWidth: 'min(480px, calc(100vw - 32px))',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease'
          }}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle size={17} color="#ffffff" style={{ flexShrink: 0 }} />
          ) : toastMessage.type === 'success' ? (
            <CheckCircle2 size={17} color="#ffffff" style={{ flexShrink: 0 }} />
          ) : toastMessage.type === 'warning' ? (
            <AlertTriangle size={17} color="#ffffff" style={{ flexShrink: 0 }} />
          ) : (
            <Sparkles size={17} color="#2dd4bf" style={{ flexShrink: 0 }} />
          )}
          <span style={{ flex: 1, lineHeight: 1.35 }}>{toastMessage.message}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setToastMessage(null);
            }}
            title="Dismiss"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              padding: 0,
              flexShrink: 0,
              marginLeft: '4px'
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    return {
      lang: 'bn',
      setLang: () => {},
      theme: 'dark',
      setTheme: () => {},
      toggleTheme: () => {},
      showToast: () => {},
      businessSettings: { companyName: 'সমিতি ৩৬০', phone: '', address: '', companyLogo: '' },
      user: null,
      isAuthenticated: false,
      authLoading: false,
      logout: () => {}
    };
  }
  return context;
};

export default AppContext;
