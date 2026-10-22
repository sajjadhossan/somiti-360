import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCachedAuthUser, signOutUser, subscribeToAuthState } from '../services/somitiAuthService';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('somiti360_lang') || 'bn';
  });

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
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(prev => (prev?.id === toastMessage?.id ? null : prev));
    }, 3500);
  };

  const value = {
    lang,
    setLang,
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 border border-teal-500/40 text-teal-300 px-4 py-3 rounded-xl shadow-2xl shadow-teal-500/20 animate-fade-in text-sm font-medium">
          <span>{toastMessage.message}</span>
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
