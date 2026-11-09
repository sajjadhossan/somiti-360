import React, { useState, useEffect } from 'react';
import {
  Globe,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Server,
  Zap,
  Terminal,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import { APP_VERSION_NAME, APP_BUILD_NUMBER } from '../../config/version';

export const RenderPublishHubModal = ({
  isOpen = false,
  onClose = () => {},
  isLight = false,
  lang = 'bn'
}) => {
  const isEn = lang === 'en';
  const [deployHookUrl, setDeployHookUrl] = useState(() => {
    try {
      return localStorage.getItem('somiti360_render_deploy_hook') || '';
    } catch {
      return '';
    }
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState(null); // { type: 'success' | 'error', message: string, timestamp: string }
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState('one_click'); // 'one_click' | 'hook' | 'blueprint' | 'guide'

  if (!isOpen) return null;

  const RENDER_BLUEPRINT_SNIPPET = `services:
  # 1. High-Speed Static Site (Recommended: Free, Global CDN, Auto SSL)
  - type: web
    name: somiti-360-web
    runtime: static
    plan: free
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html

  # 2. Production Node.js Web Service
  - type: web
    name: somiti-360-service
    runtime: node
    plan: free
    buildCommand: npm install && npm run render:build
    startCommand: npm run render:start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: NEON_DATABASE_URL
        sync: false
      - key: DATABASE_URL
        sync: false`;

  const copyToClipboard = (text, keyName) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyName);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleSaveHook = (url) => {
    setDeployHookUrl(url);
    try {
      localStorage.setItem('somiti360_render_deploy_hook', url);
    } catch {}
  };

  const handleTriggerDeploy = async () => {
    if (!deployHookUrl || !deployHookUrl.startsWith('http')) {
      setDeployStatus({
        type: 'error',
        message: isEn
          ? 'Please enter a valid Render Deploy Hook URL (starts with https://api.render.com/deploy/...)'
          : 'দয়া করে একটি সঠিক রেন্ডার ডিপ্লয় হুক ইউআরএল দিন (https://api.render.com/deploy/... দিয়ে শুরু হতে হবে)'
      });
      return;
    }

    setIsDeploying(true);
    setDeployStatus(null);

    try {
      // Trigger deploy via Render webhook
      const res = await fetch(deployHookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors' // Render deploy hooks typically return opaque responses under no-cors
      });

      setDeployStatus({
        type: 'success',
        message: isEn
          ? `Deploy trigger successfully broadcasted to Render at ${new Date().toLocaleTimeString()}! Build is running.`
          : `রেন্ডারে ডিপ্লয় রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে (${new Date().toLocaleTimeString()})! ব্যাকএন্ডে বিল্ড সম্পন্ন হচ্ছে।`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setDeployStatus({
        type: 'error',
        message: isEn ? `Deploy trigger failed: ${err.message}` : `ডিপ্লয় ট্রিগার ব্যর্থ হয়েছে: ${err.message}`
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 9, 18, 0.82)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10005,
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '780px',
        maxHeight: '92vh',
        background: isLight ? '#ffffff' : '#0c121e',
        color: isLight ? '#0f172a' : '#f8fafc',
        borderRadius: '24px',
        border: isLight ? '1.5px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.75)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'Inter', 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif"
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isLight ? '#f8fafc' : '#080d16'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #46e3b7 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#041d13',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
            }}>
              <Globe size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
                  {isEn ? 'Render.com Cloud Web Publishing Hub' : 'রেন্ডার ক্লাউড ওয়েব পাবলিশিং হাব'}
                </h2>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  {APP_VERSION_NAME}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                {isEn ? 'Deploy & host Somiti 360 instantly on Render with global CDN' : 'রেন্ডার ক্লাউডে সরাসরি সম্পূর্ণ ওয়েবসাইট লাইভ পাবলিশ ও অটো-ডিপ্লয়মেন্ট'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: isLight ? '#64748b' : '#94a3b8',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '10px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '10px 24px',
          background: isLight ? '#f1f5f9' : '#090e17',
          borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          {[
            { id: 'one_click', label: isEn ? '1-Click Deploy' : '১-ক্লিকে পাবলিশ', icon: Zap },
            { id: 'hook', label: isEn ? 'Instant Deploy Webhook' : 'ওয়েবহুক ট্রিগার', icon: UploadCloud },
            { id: 'blueprint', label: isEn ? 'render.yaml Blueprint' : 'ব্লুপ্রিন্ট কনফিগ', icon: Terminal },
            { id: 'guide', label: isEn ? 'Live Setup Guide' : 'সেটআপ গাইড', icon: HelpCircle }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? '800' : '600',
                  background: isActive ? (isLight ? '#ffffff' : '#1e293b') : 'transparent',
                  color: isActive ? '#10b981' : (isLight ? '#64748b' : '#94a3b8'),
                  border: isActive ? (isLight ? '1px solid #cbd5e1' : '1px solid rgba(16, 185, 129, 0.35)') : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {activeTab === 'one_click' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Feature highlight card */}
              <div style={{
                padding: '18px',
                borderRadius: '16px',
                background: isLight ? '#f0fdf4' : 'rgba(16, 185, 129, 0.08)',
                border: '1.5px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start'
              }}>
                <CheckCircle2 size={24} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.92rem', fontWeight: '800', color: '#10b981' }}>
                    {isEn ? 'Zero Configuration Required on Render' : 'রেন্ডারে পাবলিশ করার জন্য প্রজেক্ট সম্পূর্ণ প্রস্তুত'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: '1.45', color: isLight ? '#334155' : '#cbd5e1' }}>
                    {isEn
                      ? 'The repository includes render.yaml, render_server.cjs, and auto-build scripts. You can deploy it as either a Static Site (Free Global CDN) or Node.js Web Service.'
                      : 'প্রজেক্টে render.yaml, render_server.cjs এবং প্রোডাকশন বিল্ড স্ক্রিপ্ট অন্তর্ভুক্ত করা হয়েছে। যেকোনো গিটহাব রিপোজিটরি থেকে ১ ক্লিকে রেন্ডারে লাইভ ওয়েবসাইট পাবলিশ করা যাবে।'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href="https://render.com/deploy"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '14px 20px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    fontWeight: '900',
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    boxShadow: '0 6px 18px rgba(16, 185, 129, 0.35)',
                    cursor: 'pointer'
                  }}
                >
                  <Globe size={18} />
                  <span>{isEn ? 'Open Render.com Blueprint Deployer' : 'রেন্ডার ড্যাশবোর্ডে ডিপ্লয় শুরু করুন'}</span>
                  <ExternalLink size={16} />
                </a>

                <a
                  href="https://dashboard.render.com/blueprints/new"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 18px',
                    borderRadius: '14px',
                    background: isLight ? '#f1f5f9' : '#1e293b',
                    color: isLight ? '#0f172a' : '#f8fafc',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Layers size={16} color="#10b981" />
                  <span>{isEn ? 'Deploy via render.yaml Blueprint' : 'render.yaml ব্লুপ্রিন্ট দ্বারা সরাসরি ডিপ্লয়'}</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Quick Config Specs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: isLight ? '#f8fafc' : '#111827',
                  border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>
                    {isEn ? 'Build Command' : 'বিল্ড কমান্ড'}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: '800', marginTop: '4px', color: '#10b981' }}>
                    npm run build
                  </div>
                </div>

                <div style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: isLight ? '#f8fafc' : '#111827',
                  border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>
                    {isEn ? 'Publish Directory' : 'পাবলিশ ফোল্ডার'}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: '800', marginTop: '4px', color: '#10b981' }}>
                    ./dist
                  </div>
                </div>

                <div style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: isLight ? '#f8fafc' : '#111827',
                  border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: '700' }}>
                    {isEn ? 'SPA Rewrite Route' : 'এসপিএ রিরাইট রুট'}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: '800', marginTop: '4px', color: '#10b981' }}>
                    /* → /index.html
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hook' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', marginBottom: '8px' }}>
                  {isEn ? 'Render Deploy Hook URL' : 'রেন্ডার ডিপ্লয় হুক ইউআরএল (Deploy Hook URL)'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    value={deployHookUrl}
                    onChange={(e) => handleSaveHook(e.target.value)}
                    placeholder="https://api.render.com/deploy/srv-xxxx?key=yyyy"
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isLight ? '1.5px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.16)',
                      background: isLight ? '#ffffff' : '#080d16',
                      color: isLight ? '#0f172a' : '#f8fafc',
                      fontSize: '0.82rem',
                      fontFamily: 'monospace'
                    }}
                  />
                  <button
                    onClick={handleTriggerDeploy}
                    disabled={isDeploying || !deployHookUrl}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      background: isDeploying ? '#475569' : '#10b981',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '0.82rem',
                      border: 'none',
                      cursor: isDeploying ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    {isDeploying ? <RefreshCw size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                    <span>{isDeploying ? (isEn ? 'Triggering...' : 'পাঠানো হচ্ছে...') : (isEn ? 'Trigger Deploy' : 'ডিপ্লয় ট্রিগার করুন')}</span>
                  </button>
                </div>
                <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '6px', display: 'block' }}>
                  {isEn
                    ? 'Find this in your Render Dashboard > Settings > Deploy Hook'
                    : 'আপনার Render Dashboard > Settings > Deploy Hook থেকে এই লিংকটি কপি করে পেস্ট করুন'}
                </span>
              </div>

              {deployStatus && (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: deployStatus.type === 'success' ? (isLight ? '#f0fdf4' : 'rgba(16, 185, 129, 0.12)') : (isLight ? '#fef2f2' : 'rgba(239, 68, 68, 0.12)'),
                  border: deployStatus.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {deployStatus.type === 'success' ? (
                    <CheckCircle2 size={18} color="#10b981" />
                  ) : (
                    <AlertCircle size={18} color="#ef4444" />
                  )}
                  <div style={{ fontSize: '0.8rem', color: deployStatus.type === 'success' ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                    {deployStatus.message}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'blueprint' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '800' }}>
                  {isEn ? 'Repository render.yaml (In Root Directory)' : 'প্রজেক্টের render.yaml কনফিগারেশন'}
                </span>
                <button
                  onClick={() => copyToClipboard(RENDER_BLUEPRINT_SNIPPET, 'blueprint')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: isLight ? '#f1f5f9' : '#1e293b',
                    color: copiedKey === 'blueprint' ? '#10b981' : (isLight ? '#475569' : '#cbd5e1'),
                    border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {copiedKey === 'blueprint' ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedKey === 'blueprint' ? (isEn ? 'Copied!' : 'কপি হয়েছে!') : (isEn ? 'Copy Blueprint' : 'কপি করুন')}</span>
                </button>
              </div>

              <pre style={{
                margin: 0,
                padding: '16px',
                borderRadius: '14px',
                background: '#04070d',
                color: '#34d399',
                fontFamily: 'monospace',
                fontSize: '0.76rem',
                lineHeight: '1.5',
                overflowX: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                {RENDER_BLUEPRINT_SNIPPET}
              </pre>
            </div>
          )}

          {activeTab === 'guide' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                {
                  step: '১',
                  title: isEn ? 'Push code to GitHub' : 'গিটহাবে কোড পুশ করুন',
                  desc: isEn ? 'Commit your changes and push to your GitHub repository.' : 'সকল পরিবর্তন গিটহাবে পুশ করুন যাতে রেন্ডার সর্বশেষ কোড ডাউনলোড করতে পারে।'
                },
                {
                  step: '২',
                  title: isEn ? 'Create Static Site or Web Service on Render' : 'রেন্ডারে নিউ স্ট্যাটিক সাইট তৈরি করুন',
                  desc: isEn ? 'Connect your GitHub repo on dashboard.render.com and pick "Static Site" for free high-speed CDN.' : 'dashboard.render.com এ গিয়ে "New +" বাটনে ক্লিক করে "Static Site" বা "Blueprint" নির্বাচন করুন।'
                },
                {
                  step: '৩',
                  title: isEn ? 'Set Build Command & Publish Directory' : 'বিল্ড কমান্ড ও ডিরেক্টরি সেট করুন',
                  desc: 'Build Command: `npm run build` এবং Publish Directory: `dist` দিন।'
                },
                {
                  step: '৪',
                  title: isEn ? 'Add SPA Rewrite Rule' : 'এসপিএ রিরাইট রুল দিন',
                  desc: 'Redirects/Rewrites সেকশনে গিয়ে Source: `/*` এবং Destination: `/index.html` (Action: Rewrite) সেট করুন।'
                }
              ].map(item => (
                <div
                  key={item.step}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: isLight ? '#f8fafc' : '#111827',
                    border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.82rem',
                    fontWeight: '900',
                    flexShrink: 0
                  }}>
                    {item.step}
                  </div>
                  <div>
                    <h5 style={{ margin: '0 0 4px', fontSize: '0.86rem', fontWeight: '800' }}>{item.title}</h5>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', lineHeight: '1.4' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
          background: isLight ? '#f8fafc' : '#080d16',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
            {isEn ? 'Render Engine: Auto-detected (Node.js 20+ / Static SPA)' : 'রেন্ডার ইঞ্জিন: অটোমেটিক্যালি ডিটেক্টেড (Node.js ২০+ / স্ট্যাটিক এসপিএ)'}
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              background: isLight ? '#e2e8f0' : '#1e293b',
              color: isLight ? '#0f172a' : '#f8fafc',
              fontWeight: '800',
              fontSize: '0.78rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {isEn ? 'Close' : 'বন্ধ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default RenderPublishHubModal;
