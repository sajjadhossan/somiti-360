import React, { useState, useEffect, Component } from 'react';
import { AppProvider } from './context/AppContext';
import { SamityManagementHub } from './components/samity/SamityManagementHub';
import { SamityDocVerificationView } from './components/samity/SamityDocVerificationView';
import { Users, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';

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
        <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">সাময়িক ত্রুটি পরিলক্ষিত হয়েছে</h2>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            অ্যাপ্লিকেশনের কোনো ডেটা লোড হতে সমস্যা হয়েছে। নিচের বাটনে চাপ দিয়ে রিলোড করুন।
          </p>
          <pre className="text-xs text-red-300 bg-red-950/40 p-3 rounded-lg border border-red-900/50 mb-6 max-w-lg overflow-auto">
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition shadow-lg shadow-teal-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>পুনরায় রিলোড করুন</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainView() {
  const [viewMode, setViewMode] = useState('hub'); // 'hub' | 'verify'
  const [verifyData, setVerifyData] = useState(null);

  useEffect(() => {
    // Check if query string contains verify parameters
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
  }, []);

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

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-[#0d1424]/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20 font-bold">
            <Users className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg text-white leading-tight">সমিতি ৩৬০</h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                PRO v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">সমিতি, সমবায় সংস্থা, সঞ্চয় ও ঋণদান ব্যবস্থাপনা প্ল্যাটফর্ম</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'verify' ? 'hub' : 'verify')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">ভেরিফিকেশন পোর্টাল</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full">
        <SamityManagementHub />
      </main>
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
