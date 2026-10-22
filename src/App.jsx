import React, { useState, useEffect } from 'react';
import { SamityManagementHub } from './components/samity/SamityManagementHub';
import { SamityDocVerificationView } from './components/samity/SamityDocVerificationView';
import { Users, ShieldCheck, RefreshCw } from 'lucide-react';

export default function App() {
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
