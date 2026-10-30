import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { PublicVerificationView } from './components/samity/PublicVerificationView';
import './index.css';

// -------------------------------------------------------------
// Top-Level Immediate Verification Intercept (Rule 2)
// Never waits for Router, AuthProvider, or Cloud Database checks!
// Renders <PublicVerificationView /> instantly if query contains v=1 or c= or path is /verify
// -------------------------------------------------------------
const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

const isVerificationRequest = searchParams.get('v') === '1' ||
  Boolean(searchParams.get('c')) ||
  Boolean(searchParams.get('code')) ||
  pathname === '/verify' ||
  pathname.startsWith('/verify/');

const rootElement = document.getElementById('root');

if (isVerificationRequest && rootElement) {
  const initialParams = Object.fromEntries(searchParams.entries());
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <PublicVerificationView initialParams={initialParams} />
    </React.StrictMode>
  );
} else if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Register PWA Service Worker for Offline-First Capability
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.info('[PWA] Service Worker registered with scope:', reg.scope);
    }).catch((err) => {
      console.debug('[PWA] Service Worker registration failed:', err);
    });
  });
}
