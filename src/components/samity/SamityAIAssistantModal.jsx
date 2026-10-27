import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Send,
  X,
  CheckCircle,
  FileText,
  UserPlus,
  Landmark,
  ArrowRight,
  RefreshCw,
  Trash2,
  QrCode,
  Volume2
} from 'lucide-react';
import { parseBioDataText } from './SamityManagementHub';
import { playButtonClick, playSuccessChime } from '../../services/soundFeedback';
import { hapticFeedback } from '../../services/nativeAppService';

export const SamityAIAssistantModal = ({
  isOpen = false,
  onClose = () => {},
  members = [],
  deposits = [],
  currentSamity = {},
  onExecuteDeposit = () => {},
  onOpenMemberModalWithData = () => {},
  onOpenRecycleBin = () => {},
  onOpenReceipt = () => {},
  showToast = () => {},
  t = (bn) => bn,
  isLight = false
}) => {
  const [activeMode, setActiveMode] = useState('voice'); // 'voice' | 'biodata'
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [bioDataInput, setBioDataInput] = useState('');
  const [detectedAction, setDetectedAction] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'bn-BD';

      recognition.onstart = () => {
        setIsListening(true);
        hapticFeedback();
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceTranscript(transcript);
        analyzeCommand(transcript);
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition init error:', err);
      setSpeechSupported(false);
    }

    return () => {
      try {
        if (recognitionRef.current) recognitionRef.current.abort();
      } catch {}
    };
  }, [members]);

  const toggleListening = () => {
    playButtonClick?.();
    hapticFeedback();
    if (!recognitionRef.current) {
      showToast?.('আপনার ব্রাউজার স্পিচ রিকগনিশন সমর্থন করে না। টেক্সট লিখে কমান্ড দিন।', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setVoiceTranscript('');
      setDetectedAction(null);
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 200);
      }
    }
  };

  // Convert Bangla numerals to English
  const bnToEnNumbers = (str = '') => {
    const bnNums = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return String(str).replace(/[০-৯]/g, (w) => bnNums.indexOf(w));
  };

  // Natural Language Command Analyzer for Bangla Somiti operations
  const analyzeCommand = (rawText) => {
    if (!rawText || !rawText.trim()) return;
    const text = bnToEnNumbers(rawText.toLowerCase());

    // 1. Check for Recycle Bin intent
    if (text.includes('রিসাইকেল') || text.includes('রিসাইকেল বিন') || text.includes('মুছে ফেলা') || text.includes('recycle')) {
      setDetectedAction({
        type: 'OPEN_RECYCLE_BIN',
        title: 'রিসাইকেল বিন খোলা (Open Recycle Bin)',
        description: 'অপসারিত লেনদেন ও ভাউচার দেখতে রিসাইকেল বিন ওপেন করা হবে।'
      });
      return;
    }

    // 2. Check for New Member intent
    if (text.includes('নতুন মেম্বার') || text.includes('সদস্য যোগ') || text.includes('সদস্য নিবন্ধন') || text.includes('new member')) {
      setDetectedAction({
        type: 'NEW_MEMBER',
        title: 'নতুন সদস্য নিবন্ধন ফরম (Open Member Form)',
        description: 'নতুন সদস্য যোগ করার জন্য রেজিস্ট্রেশন ফরম ওপেন করা হবে।'
      });
      return;
    }

    // 3. Check for Deposit & Roll Receipt intent
    if (text.includes('জমা') || text.includes('চাঁদা') || text.includes('রসিদ') || text.includes('রিসিট') || text.includes('deposit') || text.includes('টাকা')) {
      // Find amount (e.g. ৫০০, ১০০০, 5000, 500)
      const amountMatch = text.match(/([0-9]+)\s*(?:টাকা|tk|bdt)?/i);
      const amount = amountMatch ? Number(amountMatch[1]) : (Number(currentSamity?.monthlySubscription) || 500);

      // Try finding member name
      let matchedMember = null;
      for (const m of members) {
        const bnName = (m.nameBn || '').toLowerCase();
        const enName = (m.nameEn || '').toLowerCase();
        const code = String(m.memberCode || m.id || '').toLowerCase();
        if (
          (bnName && text.includes(bnName)) ||
          (enName && text.includes(enName)) ||
          (code && text.includes(code))
        ) {
          matchedMember = m;
          break;
        }
      }

      // If no full name match, check partial name token matches
      if (!matchedMember) {
        const tokens = text.split(/\s+/).filter(t => t.length > 2);
        for (const m of members) {
          const parts = `${m.nameBn || ''} ${m.nameEn || ''}`.toLowerCase().split(/\s+/);
          const hasCommon = tokens.some(t => parts.some(p => p.includes(t) || t.includes(p)));
          if (hasCommon) {
            matchedMember = m;
            break;
          }
        }
      }

      // Default to first member if none matched
      if (!matchedMember && members.length > 0) {
        matchedMember = members[0];
      }

      // Detect Depositor Name & Relation
      let depositorName = matchedMember ? (matchedMember.nameBn || matchedMember.nameEn) : 'জমাদানকারী';
      let depositorRelation = 'নিজে (Self)';

      const depositorMatch = rawText.match(/(?:জমা\s*দিয়েছেন|জমা\s*দিছে|জমাদানকারী|মারফত|দিয়েছে)\s*([^\n,।]+)/i);
      if (depositorMatch) {
        const rawDep = depositorMatch[1].trim();
        depositorName = rawDep;
        if (rawDep.includes('ভাই') || text.includes('ভাই')) depositorRelation = 'ভাই (Brother)';
        else if (rawDep.includes('স্ত্রী') || text.includes('স্ত্রী') || text.includes('বউ')) depositorRelation = 'স্ত্রী (Wife)';
        else if (rawDep.includes('বাবা') || rawDep.includes('পিতা') || text.includes('পিতা')) depositorRelation = 'পিতা (Father)';
        else if (rawDep.includes('মা') || rawDep.includes('মাতা') || text.includes('মাতা')) depositorRelation = 'মাতা (Mother)';
        else if (rawDep.includes('ছেলে') || rawDep.includes('পুত্র')) depositorRelation = 'ছেলে (Son)';
        else if (rawDep.includes('মেয়ে') || rawDep.includes('কন্যা')) depositorRelation = 'মেয়ে (Daughter)';
        else depositorRelation = 'পরিবারের সদস্য / প্রতিনিধি';
      }

      setDetectedAction({
        type: 'EXECUTE_DEPOSIT_AND_ROLL',
        title: 'ডিপোজিট সম্পন্ন ও তাৎক্ষণিক রসিদ রোল (Deposit & Roll Receipt)',
        member: matchedMember,
        amount: amount,
        depositorName: depositorName,
        depositorRelation: depositorRelation,
        description: `${matchedMember ? (matchedMember.nameBn || matchedMember.nameEn) : 'সদস্য'}-এর অ্যাকাউন্টে ৳${amount.toLocaleString()} জমা কনফার্ম করে কিউআর রসিদ প্রদর্শন করা হবে।`
      });
      return;
    }

    setDetectedAction({
      type: 'GENERAL_SEARCH',
      title: 'কমান্ড প্রসেসিং',
      description: `"${rawText}" কমান্ডের ভিত্তিতে প্রাসঙ্গিক মডিউল নির্দেশ করা হচ্ছে।`
    });
  };

  const handleExecuteAction = () => {
    if (!detectedAction) return;
    playSuccessChime?.();
    hapticFeedback();

    if (detectedAction.type === 'OPEN_RECYCLE_BIN') {
      onOpenRecycleBin();
      onClose();
      return;
    }

    if (detectedAction.type === 'NEW_MEMBER') {
      onOpenMemberModalWithData({});
      onClose();
      return;
    }

    if (detectedAction.type === 'EXECUTE_DEPOSIT_AND_ROLL') {
      const now = new Date();
      const payload = {
        memberId: detectedAction.member?.id || '',
        memberName: detectedAction.member ? (detectedAction.member.nameBn || detectedAction.member.nameEn) : detectedAction.depositorName,
        amount: detectedAction.amount,
        depositorName: detectedAction.depositorName,
        depositorRelation: detectedAction.depositorRelation,
        depositorPhone: detectedAction.member?.mobile || '',
        depositType: 'Monthly Subscription',
        depositMethod: 'Cash Counter',
        paymentMonth: now.toLocaleString('en-US', { month: 'short' }),
        paymentYear: now.getFullYear(),
        approvalStatus: 'approved',
        remarks: 'AI Voice Command Assistant দ্বারা স্বয়ংক্রিয়ভাবে তৈরি ও রোলকৃত'
      };

      const createdDeposit = onExecuteDeposit(payload);
      if (createdDeposit) {
        onOpenReceipt(createdDeposit);
      }
      showToast?.(`✨ ৳${detectedAction.amount} জমার রসিদ সফলভাবে রোল করা হয়েছে!`, 'success');
      onClose();
    }
  };

  const handleParseBioData = () => {
    playButtonClick?.();
    hapticFeedback();
    if (!bioDataInput.trim()) {
      showToast?.('মেম্বারের বায়োডাটা টেক্সট পেস্ট করুন', 'warning');
      return;
    }

    const parsed = parseBioDataText(bioDataInput);
    if (!parsed.nameBn && !parsed.nameEn && !parsed.mobile) {
      showToast?.('পর্যাপ্ত তথ্য পাওয়া যায়নি, ম্যানুয়াল নিবন্ধন ফরম খুলছি...', 'info');
    } else {
      showToast?.('✨ বায়োডাটা থেকে তথ্য শনাক্ত করা হয়েছে!', 'success');
    }

    onOpenMemberModalWithData(parsed);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: isLight ? '#ffffff' : '#0f172a',
          border: isLight ? '1.5px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '22px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          padding: '24px',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: isLight ? '#0f172a' : '#f8fafc' }}>
                স্মার্ট এআই ও ভয়েস কমান্ড সহকারী
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                বাংলা ভয়েস দিয়ে রসিদ রোল করুন অথবা বায়োডাটা পেস্ট করে অটো-ফর্ম পূরণ করুন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: isLight ? '#475569' : '#fff',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setActiveMode('voice')}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '10px',
              border: 'none',
              background: activeMode === 'voice' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
              color: activeMode === 'voice' ? '#fff' : (isLight ? '#475569' : '#94a3b8'),
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Mic size={16} />
            <span>১. বাংলা ভয়েস রসিদ রোল</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('biodata')}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '10px',
              border: 'none',
              background: activeMode === 'biodata' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: activeMode === 'biodata' ? '#fff' : (isLight ? '#475569' : '#94a3b8'),
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FileText size={16} />
            <span>২. বায়োডাটা টেক্সট অটো-ফিল</span>
          </button>
        </div>

        {/* MODE 1: VOICE COMMAND & AUTO RECEIPT ROLL */}
        {activeMode === 'voice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: isLight ? '#f8fafc' : 'rgba(15, 23, 42, 0.6)',
                border: isListening ? '2px solid #ef4444' : (isLight ? '1.5px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.1)'),
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Mic Pulsing Button */}
              <button
                type="button"
                onClick={toggleListening}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: isListening
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: isListening ? '4px solid rgba(239, 68, 68, 0.4)' : 'none',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isListening
                    ? '0 0 35px rgba(239, 68, 68, 0.6)'
                    : '0 8px 25px rgba(99, 102, 241, 0.4)',
                  transform: isListening ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  marginBottom: '12px'
                }}
              >
                {isListening ? <MicOff size={34} /> : <Mic size={34} />}
              </button>

              <div style={{ fontWeight: '800', fontSize: '0.94rem', color: isListening ? '#ef4444' : (isLight ? '#0f172a' : '#f8fafc') }}>
                {isListening ? '🎙️ শুনছি... বাংলায় স্পষ্ট করে বলুন...' : 'মাইক্রোফোনে ক্লিক করে বাংলায় কথা বলুন'}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                উদাহরণ: <em>"আরিফুল ইসলামের ৫০০ টাকা মাসিক চাঁদা জমা করে রসিদ দিন, জমা দিয়েছেন তার ভাই শফিক"</em>
              </p>
            </div>

            {/* Transcript & Manual Input Track */}
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '800', color: isLight ? '#475569' : '#cbd5e1', marginBottom: '6px' }}>
                শনাক্তকৃত কথা অথবা টাইপ করুন:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={voiceTranscript}
                  onChange={(e) => {
                    setVoiceTranscript(e.target.value);
                    analyzeCommand(e.target.value);
                  }}
                  placeholder="মুখে বলুন অথবা টাইপ করুন, যেমন: রহিমের ১০০০ টাকা জমা ও রসিদ দিন"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: isLight ? '1.5px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
                    background: isLight ? '#f8fafc' : '#0f172a',
                    color: isLight ? '#0f172a' : '#fff',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => analyzeCommand(voiceTranscript)}
                  style={{
                    background: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0 16px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>

            {/* AI Detected Action Card */}
            {detectedAction && (
              <div
                style={{
                  background: isLight ? '#f0fdf4' : 'rgba(16, 185, 129, 0.1)',
                  border: isLight ? '1.5px solid #86efac' : '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '14px',
                  padding: '14px 18px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '800', fontSize: '0.88rem' }}>
                    <CheckCircle size={18} />
                    <span>{detectedAction.title}</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>
                    এআই নিশ্চিত
                  </span>
                </div>

                <p style={{ margin: '0 0 12px 0', fontSize: '0.78rem', color: isLight ? '#334155' : '#cbd5e1', lineHeight: '1.45' }}>
                  {detectedAction.description}
                </p>

                {detectedAction.type === 'EXECUTE_DEPOSIT_AND_ROLL' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '14px', fontSize: '0.74rem', background: isLight ? '#ffffff' : '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div>সদস্য: <strong>{detectedAction.member?.nameBn || detectedAction.member?.nameEn}</strong></div>
                    <div>জমার পরিমাণ: <strong style={{ color: '#10b981' }}>৳{detectedAction.amount}</strong></div>
                    <div>জমা দিয়েছেন: <strong>{detectedAction.depositorName}</strong></div>
                    <div>সম্পর্ক: <strong>{detectedAction.depositorRelation}</strong></div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleExecuteAction}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '11px',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <Sparkles size={16} />
                  <span>এখনই সম্পন্ন করুন ও রসিদ রোল দিন (Execute & Roll Receipt)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: BIO-DATA AUTO FILL */}
        {activeMode === 'biodata' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: 0, fontSize: '0.76rem', color: isLight ? '#475569' : '#cbd5e1' }}>
              মেম্বারের যেকোনো বায়োডাটা লেখা (WhatsApp, মেসেজ, Word বা CV থেকে কপি করা লেখা) নিচে পেস্ট করুন। এআই স্বয়ংক্রিয়ভাবে ফিল্ডগুলো শনাক্ত করে নতুন মেম্বার ফর্মে বসিয়ে দেবে:
            </p>
            <textarea
              rows={6}
              value={bioDataInput}
              onChange={(e) => setBioDataInput(e.target.value)}
              placeholder="উদাহরণ: নাম: মোঃ আরিফুল ইসলাম, পিতা: আব্দুল জব্বার, মাতা: ফাতেমা বেগম, মোবাইল: 01712345678, রক্ত: B+, এনআইডি: 1990269123456, পেশা: শিক্ষক, ঠিকানা: মিরপুর-১০, ঢাকা, চাঁদা: ১০০০ টাকা"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: isLight ? '1.5px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.15)',
                background: isLight ? '#f8fafc' : '#0f172a',
                color: isLight ? '#0f172a' : '#fff',
                fontSize: '0.78rem',
                lineHeight: '1.5'
              }}
            />

            <button
              type="button"
              onClick={handleParseBioData}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                padding: '11px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              <Sparkles size={16} />
              <span>✨ এআই দিয়ে বায়োডাটা পার্স করুন ও ফর্ম ওপেন করুন</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
