import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  Building2,
  Landmark,
  Wallet,
  Receipt,
  FileText,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  PenTool,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  X,
  Star,
  Layers,
  Database,
  Send,
  QrCode,
  FileSpreadsheet,
  Moon,
  Sun,
  Globe,
  Radio,
  Sliders,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
  Menu,
} from "lucide-react";

export const SamityDrawerNavigation = ({
  activeTab,
  setActiveTab,
  currentSamity = {},
  samities = [],
  activeSamityId,
  setActiveSamityId,
  currentUser = {},
  activeUserRole = "admin",
  isLight = false,
  activeLang = "bn",
  setLang,
  toggleTheme,
  effectiveMetrics = {},
  data = {},
  isOpenMobile = false,
  setIsOpenMobile,
  isCollapsedDesktop = false,
  setIsCollapsedDesktop,
  onAction = () => {},
  t = (bn, en) => bn,
  playButtonClick = () => {},
  triggerHaptic = () => {},
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDomains, setExpandedDomains] = useState({});
  const [pinnedModules, setPinnedModules] = useState(() => {
    try {
      const saved = localStorage.getItem("s360_pinned_modules");
      return saved ? JSON.parse(saved) : ["dashboard", "deposits", "members", "paid_receipt"];
    } catch {
      return ["dashboard", "deposits", "members", "paid_receipt"];
    }
  });

  const [recentModules, setRecentModules] = useState(() => {
    try {
      const saved = localStorage.getItem("s360_recent_modules");
      return saved ? JSON.parse(saved) : ["dashboard", "deposits"];
    } catch {
      return ["dashboard", "deposits"];
    }
  });

  // Track recent module access
  useEffect(() => {
    if (!activeTab || activeTab === "all_modules") return;
    setRecentModules((prev) => {
      const filtered = prev.filter((id) => id !== activeTab);
      const updated = [activeTab, ...filtered].slice(0, 4);
      try {
        localStorage.setItem("s360_recent_modules", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [activeTab]);

  // Toggle Pinned/Favorite Module
  const togglePin = (moduleId, e) => {
    e?.stopPropagation?.();
    playButtonClick?.();
    triggerHaptic?.();
    setPinnedModules((prev) => {
      const updated = prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId];
      try {
        localStorage.setItem("s360_pinned_modules", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Toggle Domain Expansion
  const toggleDomain = (domainId) => {
    playButtonClick?.();
    triggerHaptic?.();
    setExpandedDomains((prev) => ({
      ...prev,
      [domainId]: !prev[domainId],
    }));
  };

  // Calculate live badge counts
  const pendingDepositsCount = useMemo(() => {
    return (data.deposits || []).filter((d) => d.status === "pending" || d.approvalStatus === "pending").length;
  }, [data.deposits]);

  const pendingExpensesCount = useMemo(() => {
    return (data.expenses || []).filter((e) => e.status === "pending" || e.approvalStatus === "pending").length;
  }, [data.expenses]);

  const recycleBinCount = useMemo(() => {
    return (data.recycleBinDeposits || []).length;
  }, [data.recycleBinDeposits]);

  const unreadChatCount = useMemo(() => {
    return (data.chatMessages || []).length;
  }, [data.chatMessages]);

  const dueMembersCount = useMemo(() => {
    return effectiveMetrics?.dueMembers || 0;
  }, [effectiveMetrics]);

  // 12 Comprehensive Business Domains
  const domains = useMemo(() => {
    return [
      {
        id: "d1_profile",
        number: "০১",
        titleBn: "সমিতি প্রোফাইল ও সেটআপ",
        titleEn: "Samity Profile & Setup",
        icon: Building2,
        color: "#10b981",
        items: [
          {
            id: "samity_setup",
            titleBn: "সমিতি পরিচিতি ও লোগো",
            titleEn: "Samity Profile & Logo",
            icon: Building2,
            targetTab: "samity_setup",
          },
          {
            id: "samity_contact",
            titleBn: "যোগাযোগ ও সোশ্যাল প্রোফাইল",
            titleEn: "Contact & Social Profile",
            icon: Globe,
            targetTab: "samity_setup",
            subAction: "contact",
          },
          {
            id: "samity_bank",
            titleBn: "ব্যাংক ও মোবাইল ব্যাংকিং",
            titleEn: "Bank & Mobile Banking Accounts",
            icon: Landmark,
            targetTab: "samity_setup",
            subAction: "bank",
          },
          {
            id: "subscription_cfg",
            titleBn: "চাঁদার হার ও আর্থিক নীতি",
            titleEn: "Subscription Fee & Policy",
            icon: Wallet,
            targetTab: "subscription_cfg",
          },
        ],
      },
      {
        id: "d2_dashboard",
        number: "০২",
        titleBn: "ড্যাশবোর্ড ও বিশ্লেষণ",
        titleEn: "Dashboard & Live Analytics",
        icon: Layers,
        color: "#3b82f6",
        items: [
          {
            id: "dashboard",
            titleBn: "লাইভ এক্সিকিউটিভ ড্যাশবোর্ড",
            titleEn: "Live Executive Dashboard",
            icon: Layers,
            targetTab: "dashboard",
            badge: "Live",
          },
          {
            id: "payment_status",
            titleBn: "চলতি মাসের আদায় চিত্র",
            titleEn: "Current Month Collection Status",
            icon: Clock,
            targetTab: "payment_status",
          },
          {
            id: "supervisor_radar",
            titleBn: "সুপারভাইজার লাইভ রাডার",
            titleEn: "Supervisor Live Radar",
            icon: Radio,
            isModalAction: true,
            actionKey: "supervisor_radar",
            badge: pendingDepositsCount > 0 ? `${pendingDepositsCount}` : null,
            badgeColor: "#f59e0b",
          },
        ],
      },
      {
        id: "d3_finance",
        number: "০৩",
        titleBn: "ক্যাশ ও ফিন্যান্স",
        titleEn: "Cash & Finance Operations",
        icon: Wallet,
        color: "#059669",
        items: [
          {
            id: "deposits",
            titleBn: "দৈনন্দিন সঞ্চয় ও কিস্তি জমা",
            titleEn: "Daily Deposit & Savings",
            icon: Wallet,
            targetTab: "deposits",
            count: data.deposits?.length || 0,
          },
          {
            id: "bulk_deposit",
            titleBn: "এক ব্যাংক স্লিপে বহু সদস্যের জমা",
            titleEn: "Bulk Bank Slip Deposit",
            icon: Landmark,
            targetTab: "bulk_deposit",
          },
          {
            id: "expenses",
            titleBn: "দৈনিক ও নিয়মিত খরচ ভাউচার",
            titleEn: "Daily Expenses & Vouchers",
            icon: Receipt,
            targetTab: "expenses",
            count: data.expenses?.length || 0,
          },
          {
            id: "fund_balance",
            titleBn: "তহবিল স্থিতি ও ব্যাংক রিকনসিলিয়েশন",
            titleEn: "Fund Balance & Bank Reconciliation",
            icon: Landmark,
            targetTab: "fund_balance",
          },
        ],
      },
      {
        id: "d4_members",
        number: "০৪",
        titleBn: "সদস্য ও সমাজকল্যাণ",
        titleEn: "Members & Welfare Wing",
        icon: Users,
        color: "#0ea5e9",
        items: [
          {
            id: "members",
            titleBn: "সদস্য তালিকা ও বায়োডাটা রেজিস্টার",
            titleEn: "Member Directory & Biodata",
            icon: Users,
            targetTab: "members",
            count: effectiveMetrics.totalMembers || 0,
          },
          {
            id: "new_member_action",
            titleBn: "+ নতুন সদস্য নিবন্ধন",
            titleEn: "+ Register New Member",
            icon: Plus,
            isModalAction: true,
            actionKey: "new_member",
          },
        ],
      },
      {
        id: "d5_dues",
        number: "০৫",
        titleBn: "চাঁদা ও বকেয়া ব্যবস্থাপনা",
        titleEn: "Subscription & Dues Control",
        icon: AlertTriangle,
        color: "#f59e0b",
        items: [
          {
            id: "due_mgmt",
            titleBn: "বকেয়া সদস্য তালিকা ও হিসাব",
            titleEn: "Outstanding Dues Ledger",
            icon: AlertTriangle,
            targetTab: "due_mgmt",
            badge: dueMembersCount > 0 ? `${dueMembersCount} জন` : null,
            badgeColor: "#ef4444",
          },
          {
            id: "payment_status_matrix",
            titleBn: "পেমেন্ট মেট্রিক্স ও ট্র্যাকার",
            titleEn: "Payment Matrix & Tracker",
            icon: Clock,
            targetTab: "payment_status",
          },
        ],
      },
      {
        id: "d6_reminders",
        number: "০৬",
        titleBn: "স্মার্ট রিমাইন্ডার হাব",
        titleEn: "Smart Reminder Hub",
        icon: Send,
        color: "#8b5cf6",
        items: [
          {
            id: "reminders_queue",
            titleBn: "স্বয়ংক্রিয় রিমাইন্ডার কিউ",
            titleEn: "Automated Reminder Queue",
            icon: Send,
            targetTab: "reminders",
            subTab: "queue",
          },
          {
            id: "reminders_whatsapp",
            titleBn: "হোয়াটসঅ্যাপ ওয়ান-ক্লিক ব্রডকাস্ট",
            titleEn: "WhatsApp 1-Click Broadcast Hub",
            icon: MessageSquare,
            targetTab: "reminders",
            subTab: "whatsapp_hub",
          },
          {
            id: "reminders_sms",
            titleBn: "এসএমএস গেটওয়ে হাব",
            titleEn: "SMS Gateway Hub",
            icon: Send,
            targetTab: "reminders",
            subTab: "sms_hub",
          },
          {
            id: "reminders_telegram",
            titleBn: "টেলিগ্রাম বট নোটিফায়ার",
            titleEn: "Telegram Bot Notifier",
            icon: Send,
            targetTab: "reminders",
            subTab: "telegram_hub",
          },
          {
            id: "reminders_history",
            titleBn: "রিমাইন্ডার ইতিহাস ও ডেলিভারি লগ",
            titleEn: "Reminder History & Delivery Log",
            icon: Clock,
            targetTab: "reminders",
            subTab: "history",
          },
        ],
      },
      {
        id: "d7_documents",
        number: "০৭",
        titleBn: "ডকুমেন্ট ও QR যাচাই",
        titleEn: "Documents & QR Verification",
        icon: QrCode,
        color: "#14b8a6",
        items: [
          {
            id: "paid_receipt",
            titleBn: "পরিশোধিত মানি রিসিট ও রসিদ খাতা",
            titleEn: "Paid Receipts with Scannable QR",
            icon: Receipt,
            targetTab: "paid_receipt",
          },
          {
            id: "letterhead",
            titleBn: "অফিসিয়াল লেটারহেড প্যাড ও রাইটার",
            titleEn: "Official Letterhead Pad",
            icon: FileText,
            targetTab: "letterhead",
          },
          {
            id: "signatures",
            titleBn: "ডিজিটাল সিল ও স্বাক্ষর কনফিগারেশন",
            titleEn: "Digital Seals & Signatures",
            icon: PenTool,
            targetTab: "signatures",
          },
          {
            id: "documents_archive",
            titleBn: "প্রত্যয়নপত্র ও সনদপত্র আর্কাইভ",
            titleEn: "Certificates & Document Archive",
            icon: FileText,
            targetTab: "documents",
          },
          {
            id: "universal_qr_verifier",
            titleBn: "🔍 কিউআর কোড স্ক্যানার ও যাচাই",
            titleEn: "🔍 Universal QR Scanner & Verifier",
            icon: QrCode,
            isModalAction: true,
            actionKey: "universal_qr",
          },
        ],
      },
      {
        id: "d8_communication",
        number: "০৮",
        titleBn: "অভ্যন্তরীণ চ্যাট ও যোগাযোগ",
        titleEn: "Internal Chat & Communication",
        icon: MessageSquare,
        color: "#6366f1",
        items: [
          {
            id: "internal_chat",
            titleBn: "পরিচালনা পর্ষদের অভ্যন্তরীণ চ্যাট",
            titleEn: "Official Board Internal Chat",
            icon: MessageSquare,
            targetTab: "internal_chat",
            badge: unreadChatCount > 0 ? `${unreadChatCount}` : null,
          },
          {
            id: "device_mesh_action",
            titleBn: "৪-প্ল্যাটফর্ম লাইভ ডিভাইস মেশ",
            titleEn: "4-Platform Live Device Mesh",
            icon: Radio,
            isModalAction: true,
            actionKey: "device_mesh",
          },
          {
            id: "ai_voice_action",
            titleBn: "🎙️ এআই ভয়েস অ্যাসিস্ট্যান্ট",
            titleEn: "🎙️ AI Voice Receipt Assistant",
            icon: Sparkles,
            isModalAction: true,
            actionKey: "ai_voice",
          },
        ],
      },
      {
        id: "d9_office",
        number: "০৯",
        titleBn: "অফিস ও প্রশাসন",
        titleEn: "Office & Administration",
        icon: Building2,
        color: "#d97706",
        items: [
          {
            id: "office_resolutions",
            titleBn: "কার্যনির্বাহী সভার রেজুলেশন রাইটার",
            titleEn: "Executive Meeting Resolutions",
            icon: FileText,
            targetTab: "letterhead",
          },
          {
            id: "saas_guide_action",
            titleBn: "বাণিজ্যিক সফটওয়্যার আর্কিটেকচার",
            titleEn: "Commercial SaaS Architecture Guide",
            icon: Sparkles,
            isModalAction: true,
            actionKey: "saas_guide",
          },
        ],
      },
      {
        id: "d10_approvals",
        number: "১০",
        titleBn: "পেইড নোটিস ও অনুমোদন",
        titleEn: "Paid Notice & Approvals",
        icon: CheckCircle2,
        color: "#16a34a",
        items: [
          {
            id: "approvals",
            titleBn: "পেন্ডিং সঞ্চয় ও খরচ অনুমোদন",
            titleEn: "Pending Approvals Pipeline",
            icon: CheckCircle2,
            targetTab: "approvals",
            badge:
              pendingDepositsCount + pendingExpensesCount > 0
                ? `${pendingDepositsCount + pendingExpensesCount}`
                : null,
            badgeColor: "#ea580c",
          },
          {
            id: "recycle_bin_action",
            titleBn: "রিসাইকেল বিন ও পুনরুদ্ধার",
            titleEn: "Financial Recycle Bin",
            icon: Trash2,
            isModalAction: true,
            actionKey: "recycle_bin",
            badge: recycleBinCount > 0 ? `${recycleBinCount}` : null,
          },
        ],
      },
      {
        id: "d11_reports",
        number: "১১",
        titleBn: "রিপোর্ট ও বিশ্লেষণ (২৮টি রিপোর্ট)",
        titleEn: "Reports & Analytics (28 Reports)",
        icon: FileSpreadsheet,
        color: "#0284c7",
        items: [
          {
            id: "reports_all",
            titleBn: "২৮টি বহুমুখী সমবায় অডিট রিপোর্ট",
            titleEn: "28 Master Cooperative Audit Reports",
            icon: FileSpreadsheet,
            targetTab: "reports",
            badge: "28",
          },
          {
            id: "reports_fund",
            titleBn: "আর্থিক স্থিতির সারাংশ ও তহবিল স্থিতি",
            titleEn: "Financial Summary & Fund Balance",
            icon: Landmark,
            targetTab: "fund_balance",
          },
        ],
      },
      {
        id: "d12_settings",
        number: "১২",
        titleBn: "অডিট, ব্যাকআপ ও সেটিংস",
        titleEn: "Audit, Backup & Governance",
        icon: ShieldCheck,
        color: "#475569",
        items: [
          {
            id: "roles_permissions",
            titleBn: "ইউজার রোল ও এক্সেস কন্ট্রোল (RBAC)",
            titleEn: "User Roles & RBAC Matrix",
            icon: ShieldCheck,
            targetTab: "roles_permissions",
          },
          {
            id: "audit_trail",
            titleBn: "লাইভ অ্যাক্টিভিটি ও অডিট ট্রেইল",
            titleEn: "Live Audit Trail & History",
            icon: Clock,
            targetTab: "audit_trail",
          },
          {
            id: "backup_restore",
            titleBn: "টেলিগ্রাম ও ক্লাউড অটো-ব্যাকআপ",
            titleEn: "Telegram & Cloud Auto-Backup",
            icon: Send,
            targetTab: "backup_restore",
          },
          {
            id: "notifications",
            titleBn: "সিস্টেম নোটিফিকেশন সেন্টার",
            titleEn: "System Notification Center",
            icon: Bell,
            targetTab: "notifications",
          },
          {
            id: "sql_schema",
            titleBn: "SQL ডাটাবেজ স্কিমা ও মাইগ্রেশন",
            titleEn: "SQL Database Schema & Migration",
            icon: Database,
            targetTab: "sql_schema",
          },
        ],
      },
    ];
  }, [
    data.deposits,
    data.expenses,
    data.recycleBinDeposits,
    data.chatMessages,
    effectiveMetrics,
    pendingDepositsCount,
    pendingExpensesCount,
    recycleBinCount,
    unreadChatCount,
    dueMembersCount,
  ]);

  // Flatten all items for search & pinned lookup
  const allItems = useMemo(() => {
    const list = [];
    domains.forEach((d) => {
      d.items.forEach((item) => {
        list.push({ ...item, domainTitleBn: d.titleBn, domainTitleEn: d.titleEn });
      });
    });
    return list;
  }, [domains]);

  // Filter items by search query
  const filteredDomains = useMemo(() => {
    if (!searchQuery.trim()) return domains;
    const q = searchQuery.toLowerCase().trim();
    return domains
      .map((domain) => {
        const matchingItems = domain.items.filter(
          (item) =>
            item.titleBn.toLowerCase().includes(q) ||
            item.titleEn.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q)
        );
        const domainMatches =
          domain.titleBn.toLowerCase().includes(q) ||
          domain.titleEn.toLowerCase().includes(q);
        if (domainMatches || matchingItems.length > 0) {
          return {
            ...domain,
            items: domainMatches ? domain.items : matchingItems,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [domains, searchQuery]);

  // Handle item click
  const handleItemClick = (item) => {
    playButtonClick?.();
    triggerHaptic?.();
    if (setIsOpenMobile) setIsOpenMobile(false);

    if (item.isModalAction) {
      onAction?.(item.actionKey);
      return;
    }

    if (item.targetTab) {
      setActiveTab(item.targetTab);
      if (item.subAction) {
        onAction?.(`sub_action:${item.subAction}`);
      }
      if (item.subTab) {
        onAction?.(`sub_tab:${item.subTab}`);
      }
    }
  };

  const isDark = !isLight;
  const bgColor = isLight ? "#ffffff" : "#0b1120";
  const borderColor = isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.08)";
  const textColor = isLight ? "#0f172a" : "#f8fafc";
  const mutedTextColor = isLight ? "#64748b" : "#94a3b8";

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => {
            playButtonClick?.();
            setIsOpenMobile(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 1000,
            transition: "opacity 0.25s ease",
          }}
        />
      )}

      {/* Main Drawer Container (Desktop Sidebar + Mobile Slide-over Drawer) */}
      <aside
        className={`samity-drawer-sidebar ${isOpenMobile ? "mobile-open" : ""}`}
        style={{
          width: isCollapsedDesktop ? "70px" : "300px",
          background: bgColor,
          borderRight: `1px solid ${borderColor}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          height: "100%",
          maxHeight: "100vh",
          overflow: "hidden",
          position: isOpenMobile ? "fixed" : "relative",
          top: 0,
          left: 0,
          zIndex: isOpenMobile ? 1001 : 30,
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s ease",
          boxShadow: isOpenMobile
            ? "4px 0 24px rgba(0,0,0,0.4)"
            : isCollapsedDesktop
            ? "none"
            : isLight
            ? "2px 0 8px rgba(0,0,0,0.02)"
            : "none",
        }}
      >
        {/* Style definitions for smooth responsive behavior */}
        <style>{`
          @media (max-width: 991px) {
            .samity-drawer-sidebar {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              bottom: 0 !important;
              width: 86vw !important;
              max-width: 320px !important;
              transform: translateX(-100%);
              transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            .samity-drawer-sidebar.mobile-open {
              transform: translateX(0) !important;
            }
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)"};
            border-radius: 4px;
          }
        `}</style>

        {/* 1. DRAWER HEADER: SAMITY PROFILE & USER CREDENTIALS */}
        <div
          style={{
            padding: isCollapsedDesktop ? "14px 8px" : "16px 14px 12px",
            borderBottom: `1px solid ${borderColor}`,
            background: isLight
              ? "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)"
              : "linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(11, 17, 32, 0.95) 100%)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          {/* Top Row: Samity Logo, Name & Close / Collapse Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsedDesktop ? "center" : "space-between",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                minWidth: 0,
              }}
            >
              {/* Samity Logo */}
              <div
                style={{
                  width: isCollapsedDesktop ? "38px" : "42px",
                  height: isCollapsedDesktop ? "38px" : "42px",
                  borderRadius: "10px",
                  background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.06)",
                  border: `1.5px solid ${isLight ? "#cbd5e1" : "rgba(255, 255, 255, 0.12)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={currentSamity.logo || "/shopnochoa-logo.svg"}
                  alt={currentSamity.nameBn || "Samity"}
                  onError={(e) => {
                    e.currentTarget.src = "/shopnochoa-logo.svg";
                  }}
                  style={{ width: "100%", height: "100%", objectFit: "contain", padding: "2px" }}
                />
              </div>

              {/* Samity Name & ID (Expanded view only) */}
              {!isCollapsedDesktop && (
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: "900",
                      color: textColor,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {activeLang === "en"
                      ? currentSamity.nameEn || currentSamity.nameBn || "Samity 360"
                      : currentSamity.nameBn || "স্বপ্নছোঁয়া সমবায় সমিতি"}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginTop: "2px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.64rem",
                        fontWeight: "800",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        background: "rgba(16, 185, 129, 0.15)",
                        color: "#10b981",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      {currentSamity.regNo ? `রেজি: ${currentSamity.regNo}` : "ID: S360-001"}
                    </span>
                    <span
                      style={{
                        fontSize: "0.62rem",
                        color: mutedTextColor,
                        fontWeight: "600",
                      }}
                    >
                      FY 2026-27
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Close Button on Mobile OR Collapse Toggle on Desktop */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {/* Mobile Close Button */}
              {isOpenMobile && (
                <button
                  type="button"
                  onClick={() => {
                    playButtonClick?.();
                    setIsOpenMobile(false);
                  }}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    border: `1px solid ${borderColor}`,
                    background: isLight ? "#f1f5f9" : "rgba(255, 255, 255, 0.08)",
                    color: textColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title={t("ড্রয়ার বন্ধ করুন", "Close Drawer")}
                >
                  <X size={16} />
                </button>
              )}

              {/* Desktop Collapse Toggle */}
              {!isOpenMobile && setIsCollapsedDesktop && (
                <button
                  type="button"
                  onClick={() => {
                    playButtonClick?.();
                    triggerHaptic?.();
                    setIsCollapsedDesktop(!isCollapsedDesktop);
                  }}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "7px",
                    border: `1px solid ${borderColor}`,
                    background: "transparent",
                    color: mutedTextColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title={isCollapsedDesktop ? t("সাইডবার বড় করুন", "Expand Sidebar") : t("সাইডবার ছোট করুন", "Collapse Sidebar")}
                >
                  {isCollapsedDesktop ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
                </button>
              )}
            </div>
          </div>

          {/* User Badge, Metrics & Quick Toggles (Expanded view) */}
          {!isCollapsedDesktop && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                background: isLight ? "rgba(241, 245, 249, 0.6)" : "rgba(15, 23, 42, 0.6)",
                padding: "8px 10px",
                borderRadius: "8px",
                border: `1px solid ${borderColor}`,
              }}
            >
              {/* Logged-in User Profile Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "#fff",
                      fontSize: "0.72rem",
                      fontWeight: "900",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {(currentUser.name || "U")[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.76rem", fontWeight: "800", color: textColor, lineHeight: 1.1 }}>
                      {currentUser.name || "সাজ্জাদ হোসেন"}
                    </div>
                    <div style={{ fontSize: "0.64rem", color: "#10b981", fontWeight: "700" }}>
                      {activeUserRole === "admin"
                        ? t("অ্যাডমিন (Admin)", "Admin")
                        : activeUserRole === "president"
                        ? t("সভাপতি (President)", "President")
                        : activeUserRole === "treasurer"
                        ? t("কোষাধ্যক্ষ (Treasurer)", "Treasurer")
                        : activeUserRole}
                    </div>
                  </div>
                </div>

                {/* Quick Toggles: Language & Dark Theme */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {setLang && (
                    <button
                      type="button"
                      onClick={() => {
                        playButtonClick?.();
                        setLang(activeLang === "bn" ? "en" : "bn");
                      }}
                      style={{
                        padding: "2px 6px",
                        fontSize: "0.64rem",
                        fontWeight: "800",
                        borderRadius: "5px",
                        border: `1px solid ${borderColor}`,
                        background: "transparent",
                        color: textColor,
                        cursor: "pointer",
                      }}
                      title={t("ভাষা পরিবর্তন", "Switch Language")}
                    >
                      {activeLang === "bn" ? "EN" : "বাং"}
                    </button>
                  )}
                  {toggleTheme && (
                    <button
                      type="button"
                      onClick={() => {
                        playButtonClick?.();
                        toggleTheme();
                      }}
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "5px",
                        border: `1px solid ${borderColor}`,
                        background: "transparent",
                        color: textColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                      title={t("থিম পরিবর্তন", "Toggle Dark/Light Mode")}
                    >
                      {isLight ? <Moon size={12} /> : <Sun size={12} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Samity Fund Balance Mini Pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.7rem",
                  paddingTop: "4px",
                  borderTop: `1px dashed ${borderColor}`,
                }}
              >
                <span style={{ color: mutedTextColor, fontWeight: "600" }}>
                  {t("মোট তহবিল স্থিতি:", "Fund Balance:")}
                </span>
                <span style={{ fontWeight: "900", color: "#10b981" }}>
                  ৳ {(effectiveMetrics.availableFund || 0).toLocaleString("en-IN")}/-
                </span>
              </div>
            </div>
          )}

          {/* Active Branch Selector (Expanded view) */}
          {!isCollapsedDesktop && samities.length > 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <select
                value={activeSamityId}
                onChange={(e) => {
                  playButtonClick?.();
                  setActiveSamityId(e.target.value);
                }}
                style={{
                  width: "100%",
                  height: "30px",
                  background: isLight ? "#ffffff" : "rgba(30, 41, 59, 0.9)",
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "6px",
                  padding: "0 8px",
                  fontSize: "0.72rem",
                  fontWeight: "700",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {samities.map((s) => (
                  <option key={s.id} value={s.id}>
                    🏛️ {s.nameBn}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 2. INSTANT SEARCH BAR (Expanded view) */}
          {!isCollapsedDesktop && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: isLight ? "#f1f5f9" : "rgba(15, 23, 42, 0.8)",
                border: `1px solid ${borderColor}`,
                borderRadius: "7px",
                padding: "0 8px",
                height: "32px",
              }}
            >
              <Search size={14} color={mutedTextColor} />
              <input
                type="text"
                placeholder={
                  activeLang === "en"
                    ? "Search all A-Z modules..."
                    : "মডিউল খুঁজুন (যেমন: জমা, রিসিট, অডিট)..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: textColor,
                  fontSize: "0.74rem",
                  fontWeight: "600",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    background: "none",
                    border: "none",
                    color: mutedTextColor,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. SCROLLABLE A-TO-Z MODULES TREE */}
        <div
          className="custom-scrollbar"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isCollapsedDesktop ? "10px 4px" : "12px 10px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Quick Pinned / Favorite Modules (Expanded view) */}
          {!isCollapsedDesktop && !searchQuery && pinnedModules.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div
                style={{
                  fontSize: "0.64rem",
                  fontWeight: "800",
                  color: mutedTextColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "0 6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Star size={11} color="#f59e0b" fill="#f59e0b" />
                <span>{t("দ্রুত অ্যাক্সেস (পিন্ড)", "Pinned / Favorites")}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                {pinnedModules.slice(0, 4).map((modId) => {
                  const item = allItems.find((i) => i.id === modId || i.targetTab === modId);
                  if (!item) return null;
                  const Icon = item.icon || Layers;
                  const isCurrent = activeTab === item.targetTab;
                  return (
                    <button
                      key={modId}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 8px",
                        borderRadius: "7px",
                        border: `1px solid ${isCurrent ? "#10b981" : borderColor}`,
                        background: isCurrent
                          ? isLight
                            ? "rgba(16, 185, 129, 0.12)"
                            : "rgba(16, 185, 129, 0.22)"
                          : isLight
                          ? "#f8fafc"
                          : "rgba(255, 255, 255, 0.03)",
                        color: isCurrent ? "#10b981" : textColor,
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        textAlign: "left",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Icon size={12} color={isCurrent ? "#10b981" : mutedTextColor} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {activeLang === "en" ? item.titleEn : item.titleBn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 12 Business Domains Tree */}
          {filteredDomains.map((domain) => {
            const DomainIcon = domain.icon;
            const isExpanded = searchQuery ? true : expandedDomains[domain.id] ?? true;
            const hasActiveChild = domain.items.some((it) => it.targetTab === activeTab);

            return (
              <div
                key={domain.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {/* Domain Category Header Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isCollapsedDesktop && setIsCollapsedDesktop) {
                      setIsCollapsedDesktop(false);
                    } else {
                      toggleDomain(domain.id);
                    }
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isCollapsedDesktop ? "center" : "space-between",
                    padding: isCollapsedDesktop ? "8px 0" : "6px 8px",
                    borderRadius: "6px",
                    background: hasActiveChild
                      ? isLight
                        ? "rgba(16, 185, 129, 0.08)"
                        : "rgba(16, 185, 129, 0.15)"
                      : "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    color: hasActiveChild ? "#10b981" : mutedTextColor,
                  }}
                  title={activeLang === "en" ? domain.titleEn : domain.titleBn}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "5px",
                        background: `${domain.color}15`,
                        color: domain.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <DomainIcon size={13} />
                    </div>
                    {!isCollapsedDesktop && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: "800",
                          letterSpacing: "-0.01em",
                          color: hasActiveChild ? "#10b981" : textColor,
                        }}
                      >
                        {activeLang === "en" ? domain.titleEn : domain.titleBn}
                      </span>
                    )}
                  </div>

                  {!isCollapsedDesktop && (
                    <span style={{ color: mutedTextColor, opacity: 0.7 }}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  )}
                </button>

                {/* Sub-items list under Domain */}
                {(!isCollapsedDesktop || searchQuery) && isExpanded && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      paddingLeft: isCollapsedDesktop ? "0" : "12px",
                      marginTop: "2px",
                      borderLeft: isCollapsedDesktop
                        ? "none"
                        : `1.5px solid ${hasActiveChild ? "rgba(16, 185, 129, 0.4)" : borderColor}`,
                    }}
                  >
                    {domain.items.map((item) => {
                      const ItemIcon = item.icon || Layers;
                      const isCurrent = activeTab === item.targetTab;
                      const isPinned = pinnedModules.includes(item.id) || pinnedModules.includes(item.targetTab);

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "8px",
                            padding: "6px 8px",
                            borderRadius: "6px",
                            background: isCurrent
                              ? isLight
                                ? "rgba(16, 185, 129, 0.15)"
                                : "rgba(16, 185, 129, 0.25)"
                              : "transparent",
                            border: `1px solid ${isCurrent ? "#10b981" : "transparent"}`,
                            cursor: "pointer",
                            transition: "background 0.12s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isCurrent) {
                              e.currentTarget.style.background = isLight
                                ? "rgba(0,0,0,0.03)"
                                : "rgba(255,255,255,0.04)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isCurrent) {
                              e.currentTarget.style.background = "transparent";
                            }
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              minWidth: 0,
                              flex: 1,
                            }}
                          >
                            <ItemIcon
                              size={14}
                              color={isCurrent ? "#10b981" : mutedTextColor}
                              style={{ flexShrink: 0 }}
                            />
                            <span
                              style={{
                                fontSize: "0.73rem",
                                fontWeight: isCurrent ? "800" : "600",
                                color: isCurrent ? "#10b981" : textColor,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {activeLang === "en" ? item.titleEn : item.titleBn}
                            </span>
                          </div>

                          {/* Right Badges & Pin Star */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              flexShrink: 0,
                            }}
                          >
                            {item.badge && (
                              <span
                                style={{
                                  fontSize: "0.6rem",
                                  fontWeight: "800",
                                  padding: "1px 5px",
                                  borderRadius: "10px",
                                  background: item.badgeColor
                                    ? `${item.badgeColor}20`
                                    : "rgba(16, 185, 129, 0.15)",
                                  color: item.badgeColor || "#10b981",
                                  border: `1px solid ${item.badgeColor || "#10b981"}40`,
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                            {item.count !== undefined && item.count > 0 && (
                              <span
                                style={{
                                  fontSize: "0.62rem",
                                  fontWeight: "700",
                                  color: mutedTextColor,
                                }}
                              >
                                {item.count}
                              </span>
                            )}
                            {/* Star Toggle */}
                            <button
                              type="button"
                              onClick={(e) => togglePin(item.id, e)}
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                opacity: isPinned ? 1 : 0.25,
                                color: isPinned ? "#f59e0b" : mutedTextColor,
                              }}
                              title={isPinned ? t("আনপিন করুন", "Unpin") : t("পিন করুন", "Pin to Quick Access")}
                            >
                              <Star size={11} fill={isPinned ? "#f59e0b" : "none"} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 4. DRAWER FOOTER: CLOUD SYNC & APP PARITY */}
        <div
          style={{
            padding: isCollapsedDesktop ? "10px 4px" : "10px 14px",
            borderTop: `1px solid ${borderColor}`,
            background: isLight ? "#f8fafc" : "rgba(15, 23, 42, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsedDesktop ? "center" : "space-between",
            flexShrink: 0,
          }}
        >
          {!isCollapsedDesktop ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#10b981",
                    boxShadow: "0 0 6px #10b981",
                  }}
                />
                <span style={{ fontSize: "0.66rem", color: mutedTextColor, fontWeight: "700" }}>
                  {t("সেন্ট্রাল ক্লাউড সিঙ্ক: সক্রিয়", "Central Cloud: Synced")}
                </span>
              </div>
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: "800",
                  color: mutedTextColor,
                  background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                v1.8.0
              </span>
            </>
          ) : (
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 8px #10b981",
              }}
              title="Cloud Connected (v1.8.0)"
            />
          )}
        </div>
      </aside>
    </>
  );
};

export default SamityDrawerNavigation;
