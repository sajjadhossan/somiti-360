import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  ShieldCheck,
  Camera,
  Upload,
  Link2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Printer,
  Copy,
  RefreshCw,
  X,
  FileText,
  Award,
  Layers,
  Sparkles,
  Info,
  Globe
} from 'lucide-react';
import {
  createSamityReceiptVerificationUrl,
  createSamityDueNoticeVerificationUrl,
  createSamityOfficialDocVerificationUrl,
  createSamityMembershipCertVerificationUrl,
  createSamityMemberIdCardVerificationUrl,
  createSamityBulkDepositVerificationUrl,
  getGlobalVerificationBaseUrl,
  generateQrDataUrl
} from '../../services/qrService';

export const UniversalQrVerifierModal = ({
  isOpen,
  onClose,
  currentSamity,
  data,
  onUpdateSamitySettings,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState('test'); // 'test' | 'paste' | 'config'
  const [inputUrl, setInputUrl] = useState('');
  const [customDomain, setCustomDomain] = useState(() => {
    return (
      currentSamity?.verificationBaseUrl ||
      (typeof window !== 'undefined' ? localStorage.getItem('hk360_custom_verify_domain') || '' : '')
    );
  });
  const [previewQrMap, setPreviewQrMap] = useState({});
  const [loadingTest, setLoadingTest] = useState(false);

  const activeOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://hisabkitab360.vercel.app';
  const effectiveBaseUrl = getGlobalVerificationBaseUrl(currentSamity);

  // Pre-generate sample QR codes for the 1-click test buttons
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const generateSampleQrs = async () => {
      try {
        const latestDeposit = (data?.deposits || []).find(d => d.samityId === currentSamity.id) || (data?.deposits || [])[0] || {
          id: 'DEP-2026-001',
          receiptNo: 'SM-2026-01-001',
          memberName: 'আব্দুল করিম',
          depositorName: 'আব্দুল করিম',
          memberId: 'SM-001',
          amount: 500,
          depositType: 'মাসিক সঞ্চয়/চাঁদা',
          paymentMonth: 'জানুয়ারি',
          paymentYear: '২০২৬',
          depositMethod: 'নগদ',
          depositDate: new Date().toISOString().split('T')[0]
        };

        const firstMember = (data?.members || []).find(m => m.samityId === currentSamity.id) || (data?.members || [])[0] || {
          id: 'SM-001',
          nameBn: 'আব্দুল করিম',
          nameEn: 'Abdul Karim',
          nidNumber: '19902692012345678',
          joiningDate: '2024-01-01',
          membershipType: 'সাধারণ সদস্য',
          mobile: '01711223344',
          bloodGroup: 'B+',
          nomineeName: 'মোসাঃ খাদিজা বেগম',
          nomineeRelation: 'স্ত্রী'
        };

        const sampleReceiptUrl = createSamityReceiptVerificationUrl(latestDeposit, currentSamity);
        const sampleDueUrl = createSamityDueNoticeVerificationUrl({
          member: firstMember,
          status: { totalDue: 1500, month: 'মার্চ', year: '২০২৬' },
          dueMonthsList: ['জানুয়ারি ২০২৬', 'ফেব্রুয়ারি ২০২৬', 'মার্চ ২০২৬']
        }, currentSamity);
        const sampleCertUrl = createSamityMembershipCertVerificationUrl(firstMember, currentSamity);
        const sampleDocUrl = createSamityOfficialDocVerificationUrl({
          ref: 'সছস/২০২৬/০১',
          title: 'বার্ষিক সাধারণ সভা ও অডিট রেজুলেশন',
          date: new Date().toISOString().split('T')[0]
        }, currentSamity);
        const sampleIdCardUrl = createSamityMemberIdCardVerificationUrl(firstMember, currentSamity);

        const [receiptQr, dueQr, certQr, docQr, idCardQr] = await Promise.all([
          generateQrDataUrl(sampleReceiptUrl, { width: 140, margin: 1 }),
          generateQrDataUrl(sampleDueUrl, { width: 140, margin: 1 }),
          generateQrDataUrl(sampleCertUrl, { width: 140, margin: 1 }),
          generateQrDataUrl(sampleDocUrl, { width: 140, margin: 1 }),
          generateQrDataUrl(sampleIdCardUrl, { width: 140, margin: 1 })
        ]);

        if (isMounted) {
          setPreviewQrMap({
            receipt: { url: sampleReceiptUrl, qr: receiptQr, label: 'জমার রসিদ', code: latestDeposit.receiptNo || 'RCPT-001' },
            due: { url: sampleDueUrl, qr: dueQr, label: 'বকেয়া তাগিদপত্র', code: `DUE-${firstMember.id}` },
            cert: { url: sampleCertUrl, qr: certQr, label: 'সদস্যপদ সনদ', code: `CERT-${firstMember.id}` },
            doc: { url: sampleDocUrl, qr: docQr, label: 'অফিসিয়াল নোটিশ/রেজুলেশন', code: 'DOC-2026' },
            idCard: { url: sampleIdCardUrl, qr: idCardQr, label: 'সদস্য স্মার্ট আইডি কার্ড', code: `ID-${firstMember.id}` }
          });
        }
      } catch (err) {
        console.warn('Could not generate sample QR previews:', err);
      }
    };

    generateSampleQrs();
    return () => { isMounted = false; };
  }, [isOpen, currentSamity, data]);

  if (!isOpen) return null;

  const handleSaveDomain = () => {
    const clean = (customDomain || '').trim();
    if (typeof window !== 'undefined') {
      try {
        if (clean) {
          localStorage.setItem('hk360_custom_verify_domain', clean);
          localStorage.setItem('somiti_live_domain', clean);
        } else {
          localStorage.removeItem('hk360_custom_verify_domain');
          localStorage.removeItem('somiti_live_domain');
        }
      } catch (_) {}
    }

    if (onUpdateSamitySettings) {
      onUpdateSamitySettings(prev => ({
        ...prev,
        verificationBaseUrl: clean
      }));
    }

    showToast?.('✓ লাইভ ভেরিফিকেশন ডোমেন সফলভাবে সংরক্ষিত হয়েছে!', 'success');
  };

  const handleUseCurrentHost = () => {
    if (typeof window !== 'undefined') {
      const current = window.location.origin;
      setCustomDomain(current);
      try {
        localStorage.setItem('hk360_custom_verify_domain', current);
        localStorage.setItem('somiti_live_domain', current);
      } catch (_) {}
      if (onUpdateSamitySettings) {
        onUpdateSamitySettings(prev => ({
          ...prev,
          verificationBaseUrl: current
        }));
      }
      showToast?.(`✓ বর্তমান হোস্ট (${current}) ভেরিফিকেশন ডোমেন হিসেবে সেট করা হয়েছে!`, 'success');
    }
  };

  const handleVerifyInput = (e) => {
    e?.preventDefault?.();
    const raw = (inputUrl || '').trim();
    if (!raw) {
      showToast?.('অনুগ্রহ করে একটি ভেরিফিকেশন লিংক, টোকেন বা রসিদ নং প্রদান করুন', 'error');
      return;
    }

    // If full URL with query
    if (raw.includes('?verify=') || raw.includes('&verify=')) {
      window.open(raw, '_blank');
      return;
    }

    // If starts with /? or ?
    if (raw.startsWith('?') || raw.startsWith('/?')) {
      window.open(`${effectiveBaseUrl}${raw.startsWith('/') ? '' : '/'}${raw}`, '_blank');
      return;
    }

    // If just a receipt number or voucher
    const receiptUrl = `${effectiveBaseUrl}?verify=receipt&receipt_no=${encodeURIComponent(raw)}&samity=${encodeURIComponent(currentSamity.nameBn || 'স্বপ্নছোঁয়া সমবায় সমিতি')}`;
    window.open(receiptUrl, '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 10, 20, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: "'Inter', 'Hind Siliguri', sans-serif"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary, #0f172a)',
          color: '#f8fafc',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          overflowY: 'auto',
          border: '1px solid rgba(45, 212, 191, 0.3)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(20, 184, 166, 0.15)',
          padding: '24px 28px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(20, 184, 166, 0.15)', border: '1.5px solid #14b8a6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={26} color="#2dd4bf" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#fff' }}>
                  ডকুমেন্ট কিউআর কোড ও লাইভ ভেরিফিকেশন হাব
                </h3>
                <span style={{ background: '#065f46', color: '#34d399', fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px', borderRadius: '12px', border: '1px solid #10b981' }}>
                  ✓ সক্রিয় (ACTIVE)
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                প্রিন্ট করা রসিদ, বকেয়া নোটিশ, রেজুলেশন ও সনদপত্রের সত্যতা যাচাই ও স্মার্টফোন ক্যামেরা স্ক্যানার
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#94a3b8', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('test')}
            style={{
              background: activeTab === 'test' ? 'rgba(20, 184, 166, 0.2)' : 'transparent',
              color: activeTab === 'test' ? '#2dd4bf' : '#94a3b8',
              border: activeTab === 'test' ? '1px solid #14b8a6' : '1px solid transparent',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={16} />
            <span>১-ক্লিক লাইভ টেস্ট ইঞ্জিন</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            style={{
              background: activeTab === 'paste' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: activeTab === 'paste' ? '#38bdf8' : '#94a3b8',
              border: activeTab === 'paste' ? '1px solid #38bdf8' : '1px solid transparent',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Link2 size={16} />
            <span>লিংক / রসিদ নং দিয়ে যাচাই</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            style={{
              background: activeTab === 'config' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
              color: activeTab === 'config' ? '#c084fc' : '#94a3b8',
              border: activeTab === 'config' ? '1px solid #a855f7' : '1px solid transparent',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Globe size={16} />
            <span>লাইভ ডোমেন ও মোবাইল ওয়াইফাই কনফিগ</span>
          </button>
        </div>

        {/* TAB 1: 1-CLICK LIVE TEST ENGINE */}
        {activeTab === 'test' && (
          <div>
            <div style={{ background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.25)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={28} color="#2dd4bf" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.82rem', lineHeight: '1.5', color: '#cbd5e1' }}>
                <strong style={{ color: '#fff' }}>সিস্টেম কনফার্মেশন:</strong> আপনার সফটওয়্যারের সকল অফিসিয়াল ডকুমেন্ট (রসিদ, বকেয়া নোটিশ, রেজুলেশন, সনদপত্র) ক্রিপ্টোগ্রাফিক কিউআর কোড দিয়ে সজ্জিত। নিচের যেকোনো বাটনে ক্লিক করে এখনই লাইভ টেস্ট করুন অথবা যেকোনো স্মার্টফোন দিয়ে স্ক্রিনের কিউআর কোড স্ক্যান করুন।
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
              {/* Test Card 1: Receipt */}
              <div style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ background: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', flexShrink: 0, textAlign: 'center' }}>
                  {previewQrMap.receipt?.qr ? (
                    <img src={previewQrMap.receipt.qr} alt="Receipt QR" style={{ width: '84px', height: '84px', display: 'block' }} />
                  ) : (
                    <div style={{ width: '84px', height: '84px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QrCode size={36} color="#0f172a" />
                    </div>
                  )}
                  <span style={{ fontSize: '0.62rem', fontWeight: '800', color: '#0f172a', display: 'block', marginTop: '2px' }}>ক্যামেরায় স্ক্যান করুন</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: '#065f46', color: '#34d399', fontSize: '0.65rem', fontWeight: '800', padding: '1px 6px', borderRadius: '4px' }}>পরিশোধ রসিদ</span>
                    <strong style={{ color: '#f8fafc', fontSize: '0.88rem' }}>জমা রসিদ ভেরিফিকেশন</strong>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '4px 0 10px' }}>
                    কোড: {previewQrMap.receipt?.code || 'SM-001'} • ক্লাউড লেজার সত্যায়িত
                  </div>
                  <button
                    onClick={() => {
                      if (previewQrMap.receipt?.url) window.open(previewQrMap.receipt.url, '_blank');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>সার্টিফিকেট ওপেন করুন</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>

              {/* Test Card 2: Due Notice */}
              <div style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ background: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', flexShrink: 0, textAlign: 'center' }}>
                  {previewQrMap.due?.qr ? (
                    <img src={previewQrMap.due.qr} alt="Due Notice QR" style={{ width: '84px', height: '84px', display: 'block' }} />
                  ) : (
                    <div style={{ width: '84px', height: '84px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QrCode size={36} color="#dc2626" />
                    </div>
                  )}
                  <span style={{ fontSize: '0.62rem', fontWeight: '800', color: '#dc2626', display: 'block', marginTop: '2px' }}>ক্যামেরায় স্ক্যান করুন</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: '#7f1d1d', color: '#fca5a5', fontSize: '0.65rem', fontWeight: '800', padding: '1px 6px', borderRadius: '4px' }}>বকেয়া তাগিদ</span>
                    <strong style={{ color: '#f8fafc', fontSize: '0.88rem' }}>বকেয়া নোটিশ ভেরিফিকেশন</strong>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '4px 0 10px' }}>
                    কোড: {previewQrMap.due?.code || 'DUE-001'} • ডেডলাইন ও পাওনা হিসাব
                  </div>
                  <button
                    onClick={() => {
                      if (previewQrMap.due?.url) window.open(previewQrMap.due.url, '_blank');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>নোটিশ ভেরিফাই করুন</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>

              {/* Test Card 3: Membership Certificate */}
              <div style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ background: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', flexShrink: 0, textAlign: 'center' }}>
                  {previewQrMap.cert?.qr ? (
                    <img src={previewQrMap.cert.qr} alt="Cert QR" style={{ width: '84px', height: '84px', display: 'block' }} />
                  ) : (
                    <div style={{ width: '84px', height: '84px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QrCode size={36} color="#d97706" />
                    </div>
                  )}
                  <span style={{ fontSize: '0.62rem', fontWeight: '800', color: '#d97706', display: 'block', marginTop: '2px' }}>ক্যামেরায় স্ক্যান করুন</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: '#78350f', color: '#fde68a', fontSize: '0.65rem', fontWeight: '800', padding: '1px 6px', borderRadius: '4px' }}>সদস্য সনদ</span>
                    <strong style={{ color: '#f8fafc', fontSize: '0.88rem' }}>সদস্যপদ সনদপত্র ভেরিফিকেশন</strong>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '4px 0 10px' }}>
                    কোড: {previewQrMap.cert?.code || 'CERT-001'} • আইডি ও এনআইডি রেকর্ড
                  </div>
                  <button
                    onClick={() => {
                      if (previewQrMap.cert?.url) window.open(previewQrMap.cert.url, '_blank');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>সনদপত্র টেস্ট করুন</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>

              {/* Test Card 4: Official Letterhead Resolution */}
              <div style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ background: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', flexShrink: 0, textAlign: 'center' }}>
                  {previewQrMap.doc?.qr ? (
                    <img src={previewQrMap.doc.qr} alt="Doc QR" style={{ width: '84px', height: '84px', display: 'block' }} />
                  ) : (
                    <div style={{ width: '84px', height: '84px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QrCode size={36} color="#0284c7" />
                    </div>
                  )}
                  <span style={{ fontSize: '0.62rem', fontWeight: '800', color: '#0284c7', display: 'block', marginTop: '2px' }}>ক্যামেরায় স্ক্যান করুন</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: '#0c4a6e', color: '#7dd3fc', fontSize: '0.65rem', fontWeight: '800', padding: '1px 6px', borderRadius: '4px' }}>অফিসিয়াল নোটিশ</span>
                    <strong style={{ color: '#f8fafc', fontSize: '0.88rem' }}>রেজুলেশন ও সভার কার্যবিবরণী</strong>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '4px 0 10px' }}>
                    কোড: {previewQrMap.doc?.code || 'DOC-2026'} • সিল ও স্বাক্ষর সংরক্ষিত
                  </div>
                  <button
                    onClick={() => {
                      if (previewQrMap.doc?.url) window.open(previewQrMap.doc.url, '_blank');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>রেজুলেশন ভিউ করুন</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>

              {/* Test Card 5: Member Smart ID Card */}
              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1.5px solid rgba(59, 130, 246, 0.35)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ background: '#fff', padding: '6px', borderRadius: '8px', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                  {previewQrMap.idCard?.qr ? (
                    <img src={previewQrMap.idCard.qr} alt="Member ID Card QR" style={{ width: '84px', height: '84px', display: 'block' }} />
                  ) : (
                    <div style={{ width: '84px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QrCode size={36} color="#0f172a" />
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ background: '#1e3a8a', color: '#93c5fd', fontSize: '0.65rem', fontWeight: '800', padding: '1px 6px', borderRadius: '4px' }}>স্মার্ট পরিচয়পত্র</span>
                    <strong style={{ color: '#f8fafc', fontSize: '0.88rem' }}>সদস্য ডিজিটাল স্মার্ট আইডি কার্ড</strong>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '4px 0 10px' }}>
                    আইডি: {previewQrMap.idCard?.code || 'ID-001'} • ছবি, এনআইডি ও নমিনী সংরক্ষিত
                  </div>
                  <button
                    onClick={() => {
                      if (previewQrMap.idCard?.url) window.open(previewQrMap.idCard.url, '_blank');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>স্মার্ট আইডি কার্ড ভেরিফাই</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PASTE URL / TOKEN */}
        {activeTab === 'paste' && (
          <div>
            <form onSubmit={handleVerifyInput} style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '800', color: '#f8fafc', marginBottom: '8px' }}>
                🔗 ভেরিফিকেশন লিংক, টোকেন বা রসিদ নম্বর প্রদান করুন:
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="যেমন: RCPT-2026-0001 অথবা https://.../?verify=receipt&..."
                  style={{
                    flex: 1,
                    minWidth: '260px',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#fff',
                    fontSize: '0.84rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>এখনই যাচাই করুন</span>
                </button>
              </div>
            </form>

            <div style={{ background: 'rgba(56, 189, 248, 0.06)', border: '1px dashed rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '14px 18px', fontSize: '0.8rem', color: '#94a3b8' }}>
              💡 <strong>টিপস:</strong> আপনি WhatsApp-এ পাঠানো যেকোনো মেসেজের ভেরিফিকেশন লিংক কপি করে এখানে পেস্ট করতে পারেন অথবা কাগজের রসিদে লেখা রসিদ নম্বর (যেমন: <code>SM-2026-01-001</code>) লিখলেও স্বয়ংক্রিয়ভাবে ক্লাউড লেজার থেকে মূল সার্টিফিকেট প্রদর্শিত হবে।
            </div>
          </div>
        )}

        {/* TAB 3: LIVE DOMAIN & WI-FI CONFIG */}
        {activeTab === 'config' && (
          <div>
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.96rem', fontWeight: '800', color: '#f8fafc' }}>
                🌐 লাইভ ভেরিফিকেশন বেস ইউআরএল (Live Verification Base URL)
              </h4>
              <p style={{ margin: '0 0 16px', fontSize: '0.78rem', color: '#94a3b8' }}>
                মোবাইল ক্যামেরা দিয়ে QR কোড স্ক্যান করলে যে ডোমেন বা ওয়েবসাইটে যাবে তা নির্ধারণ করুন।
              </p>

              <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>বর্তমানে ব্যবহৃত ভেরিফিকেশন লিংক:</div>
                <div style={{ fontSize: '0.9rem', color: '#2dd4bf', fontWeight: '800', fontFamily: 'monospace', wordBreak: 'break-all', marginTop: '2px' }}>
                  {effectiveBaseUrl}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  কাস্টম প্রোডাকশন / Vercel ডোমেন (যেমন: https://somiti-360.vercel.app অথবা আপনার নিজস্ব ডোমেন):
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="https://your-domain.vercel.app"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#fff',
                    fontSize: '0.84rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleSaveDomain}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  ডোমেন সংরক্ষণ করুন
                </button>

                <button
                  type="button"
                  onClick={handleUseCurrentHost}
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  বর্তমান ব্রাউজার হোস্ট ({activeOrigin}) সেট করুন
                </button>
              </div>
            </div>

            <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '10px', padding: '14px 18px', fontSize: '0.8rem', color: '#cbd5e1' }}>
              📱 <strong>মোবাইল ওয়াইফাই টেস্টিং গাইড:</strong> আপনি যদি পিসিতে লোকাল প্রিভিউ সার্ভার (যেমন: <code>npm run host</code> বা <code>preview_server.cjs</code>) চালু করেন এবং আপনার মোবাইল ফোনটি একই ওয়াইফাই রাউটারে যুক্ত থাকে, তবে বর্তমান হোস্টে আপনার লোকাল আইপি (যেমন: <code>http://192.168.0.xxx:5174</code>) সেট করলে যেকোনো স্মার্টফোনের সাধারণ ক্যামেরা দিয়ে কাগজের রসিদ স্ক্যান করলেই তাৎক্ষণিক ডিজিটাল ভেরিফিকেশন পেজ খুলবে!
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniversalQrVerifierModal;
