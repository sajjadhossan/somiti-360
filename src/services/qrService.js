import QRCode from 'qrcode';

/**
 * Generates an ultra high-resolution QR code Data URL (PNG base64)
 * that is crisp both on screen and thermal paper print.
 */
export const generateQrDataUrl = async (text, options = {}) => {
  try {
    return await QRCode.toDataURL(text, {
      width: options.width || 300,
      margin: options.margin !== undefined ? options.margin : 1,
      color: {
        dark: options.darkColor || '#000000',
        light: options.lightColor || '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.warn('QR code generation warning:', err);
    return null;
  }
};

/**
 * Builds a 100% workable, instant-read payload for physical thermal receipts & A4 invoices.
 * When ANY smartphone camera (iPhone, Android, Google Lens, Xiaomi, bKash) scans this QR code:
 * It immediately displays the complete invoice details directly on screen without needing localhost or internet!
 */
export const generateInvoiceQrPayload = (invoice, businessSettings) => {
  if (!invoice) return 'HisabKitab 360 Official Receipt';

  const company = businessSettings?.companyName || 'হিসাব কিতাব ৩৬০';
  const phone = businessSettings?.phone || '';
  const address = businessSettings?.address || '';
  const grandTotal = Number(invoice.grandTotal) || 0;
  const paid = invoice.paidAmount !== undefined
    ? Number(invoice.paidAmount)
    : (invoice.status === 'paid' ? grandTotal : 0);
  const due = invoice.dueAmount !== undefined
    ? Number(invoice.dueAmount)
    : Math.max(0, grandTotal - paid);
  const statusText = due === 0 ? 'পরিশোধিত (PAID)' : `বকেয়া (DUE ৳${due.toLocaleString()})`;

  const itemsList = (invoice.items || []).slice(0, 5).map(it => {
    return `• ${it.name} (${it.qty} x ৳${Number(it.price).toLocaleString()})`;
  }).join('\n');
  const moreCount = (invoice.items || []).length > 5 ? `\n...আরও ${(invoice.items.length - 5)} টি পণ্য` : '';

  const hasLiveDomain = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  const verifyLink = hasLiveDomain
    ? `${window.location.origin}${window.location.pathname}?verify=${encodeURIComponent(invoice.id)}`
    : (businessSettings?.website ? `https://${businessSettings.website.replace(/^https?:\/\//, '')}` : '');

  return [
    `🧾 ${company}`,
    address ? `📍 ${address}` : '',
    phone ? `📞 ${phone}` : '',
    `────────────────────`,
    `মেমো নং: #${invoice.id}`,
    `তারিখ: ${invoice.date || new Date().toISOString().split('T')[0]}`,
    `ক্রেতা: ${invoice.customerName || 'সাধারণ ক্রেতা'} ${invoice.customerPhone ? `(${invoice.customerPhone})` : ''}`,
    `────────────────────`,
    itemsList ? `পণ্যসমূহ:\n${itemsList}${moreCount}\n────────────────────` : '',
    `মোট বিল: ৳${grandTotal.toLocaleString()}`,
    `পরিশোধ: ৳${paid.toLocaleString()}`,
    `স্ট্যাটাস: ${statusText}`,
    verifyLink ? `────────────────────\n🌐 ভেরিফিকেশন: ${verifyLink}` : '',
    `✓ হিসাবকিতাব ৩৬০ ডিজিটাল ভেরিফাইড মেমো`
  ].filter(Boolean).join('\n');
};

// Reliable UTF-8 to Base64 (supporting Bengali text, numbers, symbols)
export const safeUtf8ToBase64 = (str) => {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch {
      return '';
    }
  }
};

// Reliable Base64 to UTF-8
export const safeBase64ToUtf8 = (base64) => {
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    try {
      return decodeURIComponent(escape(atob(base64)));
    } catch {
      return null;
    }
  }
};

/**
 * Builds a portable verification URL with compact encoded invoice payload
 * so that any smartphone scanning the QR code can display the official invoice details
 * even without requiring a cloud backend database.
 */
export const createInvoiceVerificationUrl = (invoice, businessSettings) => {
  if (!invoice) return 'https://hisabkitab360.vercel.app';

  const grandTotal = Number(invoice.grandTotal || invoice.total_bill) || 0;
  const paid = invoice.paidAmount !== undefined
    ? Number(invoice.paidAmount)
    : (invoice.paid_amount !== undefined ? Number(invoice.paid_amount) : (invoice.status === 'paid' ? grandTotal : 0));
  const due = invoice.dueAmount !== undefined
    ? Number(invoice.dueAmount)
    : (invoice.due_amount !== undefined ? Number(invoice.due_amount) : Math.max(0, grandTotal - paid));

  const payload = {
    id: invoice.id || invoice.bill_no,
    dt: invoice.date || invoice.created_at || new Date().toISOString().split('T')[0],
    c: invoice.customerName || invoice.patient || 'সম্মানিত গ্রাহক',
    p: invoice.customerPhone || invoice.phone || '',
    gt: grandTotal,
    pd: paid,
    du: due,
    st: invoice.status || (due === 0 ? 'paid' : 'due'),
    pm: invoice.paymentMethod || invoice.payment_method || 'নগদ',
    co: businessSettings?.companyName || 'হিসাব কিতাব ৩৬০',
    ph: businessSettings?.phone || '',
    ad: businessSettings?.address || '',
    items: (invoice.items || []).slice(0, 10).map(item => ({
      n: item.name,
      q: item.qty || 1,
      p: item.price || item.rate || 0
    }))
  };

  // Determine globally reachable base URL
  let baseUrl = 'https://hisabkitab360.vercel.app';
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.') || window.location.protocol.includes('capacitor');
    if (!isLocal) {
      baseUrl = window.location.origin + window.location.pathname;
    } else if (businessSettings?.liveDomain) {
      baseUrl = businessSettings.liveDomain.startsWith('http') ? businessSettings.liveDomain : `https://${businessSettings.liveDomain}`;
    }
  }

  try {
    const jsonStr = JSON.stringify(payload);
    const token = encodeURIComponent(safeUtf8ToBase64(jsonStr));
    const docId = encodeURIComponent(invoice.id || invoice.bill_no);
    return `${baseUrl}?verify=${docId}&data=${token}`;
  } catch {
    const docId = encodeURIComponent(invoice.id || invoice.bill_no);
    return `${baseUrl}?verify=${docId}`;
  }
};

/**
 * Decodes the verification token back into full invoice object
 */
export const decodeInvoiceVerificationToken = (token) => {
  if (!token) return null;
  try {
    let decodedStr = safeBase64ToUtf8(token);
    if (!decodedStr) {
      decodedStr = safeBase64ToUtf8(decodeURIComponent(token));
    }
    if (!decodedStr) {
      try {
        decodedStr = decodeURIComponent(escape(atob(decodeURIComponent(token))));
      } catch (_) {}
    }
    if (!decodedStr) return null;

    const data = JSON.parse(decodedStr);
    return {
      id: data.id || data.bill_no,
      date: data.date || data.dt || new Date().toISOString().split('T')[0],
      customerName: data.customerName || data.c || 'সম্মানিত গ্রাহক',
      customerPhone: data.customerPhone || data.p || '',
      grandTotal: Number(data.grandTotal !== undefined ? data.grandTotal : (data.gt !== undefined ? data.gt : 0)),
      paidAmount: Number(data.paidAmount !== undefined ? data.paidAmount : (data.pd !== undefined ? data.pd : 0)),
      dueAmount: Number(data.dueAmount !== undefined ? data.dueAmount : (data.du !== undefined ? data.du : 0)),
      status: data.status || data.st || 'paid',
      paymentMethod: data.paymentMethod || data.pm || 'নগদ',
      companyName: data.companyName || data.co || 'হিসাব কিতাব ৩৬০',
      companyPhone: data.companyPhone || data.ph || '',
      companyAddress: data.companyAddress || data.ad || '',
      items: (data.items || []).map(it => ({
        name: it.name || it.n,
        qty: it.qty || it.q || 1,
        price: it.price || it.p || 0,
        subtotal: (it.qty || it.q || 1) * (it.price || it.p || 0)
      }))
    };
  } catch (err) {
    console.warn('Could not decode invoice token:', err);
    return null;
  }
};

/**
 * Normalizes phone numbers for WhatsApp API (e.g., 01712345678 -> 8801712345678)
 */
export const normalizeWhatsAppPhone = (phone) => {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('01') && clean.length === 11) {
    clean = '88' + clean;
  } else if (clean.startsWith('1') && clean.length === 10) {
    clean = '880' + clean;
  }
  return clean;
};

/**
 * Builds polite, comprehensive formatted text for WhatsApp, SMS & Social Media
 */
export const formatWhatsAppInvoiceMessage = (invoice, businessSettings, lang = 'bn') => {
  if (!invoice) return '';
  const companyName = businessSettings?.companyName || 'হিসাব কিতাব ৩৬০ স্টোর';
  const companyPhone = businessSettings?.phone || '';
  const grandTotal = Number(invoice.grandTotal) || 0;
  const paid = invoice.paidAmount !== undefined
    ? Number(invoice.paidAmount)
    : (invoice.status === 'paid' ? grandTotal : 0);
  const due = invoice.dueAmount !== undefined
    ? Number(invoice.dueAmount)
    : Math.max(0, grandTotal - paid);
  const verifyUrl = createInvoiceVerificationUrl(invoice, businessSettings);

  const itemsList = (invoice.items || []).map((it, idx) => {
    return `${idx + 1}. ${it.name} (${it.qty} টি) = ৳${(it.price * it.qty).toLocaleString()}`;
  }).join('\n');

  if (lang === 'bn') {
    return `🧾 *ডিজিটাল ক্যাশমেমো ও ইনভয়েস*
━━━━━━━━━━━━━━━━━━
🏪 *প্রতিষ্ঠান:* ${companyName}
📞 *হটলাইন:* ${companyPhone}
📄 *মেমো নং:* #${invoice.id}
📅 *তারিখ:* ${invoice.date}
👤 *গ্রাহক:* ${invoice.customerName || 'সাধারণ ক্রেতা'} ${invoice.customerPhone ? `(${invoice.customerPhone})` : ''}
━━━━━━━━━━━━━━━━━━
🛍️ *ক্রয়কৃত পণ্যসমূহ:*
${itemsList || 'পণ্য বিস্তারিত বিল ভিউতে দেখুন'}
━━━━━━━━━━━━━━━━━━
💵 *সর্বমোট বিল:* ৳${grandTotal.toLocaleString()}
✅ *পরিশোধ:* ৳${paid.toLocaleString()}
${due > 0 ? `⚠️ *অবশিষ্ট বকেয়া:* ৳${due.toLocaleString()}` : `🎉 *স্ট্যাটাস:* সম্পূর্ণ পরিশোধিত (PAID)`}
━━━━━━━━━━━━━━━━━━
🔍 *স্মার্টফোনে রসিদ যাচাই ও কপি পেতে লিংকে চাপ দিন:*
${verifyUrl}

🙏 আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ!`;
  } else {
    return `🧾 *OFFICIAL DIGITAL INVOICE*
━━━━━━━━━━━━━━━━━━
🏪 *Store:* ${companyName}
📞 *Phone:* ${companyPhone}
📄 *Invoice:* #${invoice.id}
📅 *Date:* ${invoice.date}
👤 *Customer:* ${invoice.customerName || 'Walk-in'} ${invoice.customerPhone ? `(${invoice.customerPhone})` : ''}
━━━━━━━━━━━━━━━━━━
🛍️ *Purchased Items:*
${itemsList || 'View full breakdown in link'}
━━━━━━━━━━━━━━━━━━
💵 *Grand Total:* ৳${grandTotal.toLocaleString()}
✅ *Paid Amount:* ৳${paid.toLocaleString()}
${due > 0 ? `⚠️ *Remaining Due:* ৳${due.toLocaleString()}` : `🎉 *Status:* FULLY PAID`}
━━━━━━━━━━━━━━━━━━
🔍 *Verify official digital receipt online:*
${verifyUrl}

Thank you for shopping with us!`;
  }
};

/**
 * Formats a comprehensive Counter Shift Closing & Handover report for WhatsApp
 */
export const formatWhatsAppShiftClosingMessage = (closingRecord, businessSettings, lang = 'bn') => {
  if (!closingRecord) return '';
  const company = businessSettings?.companyName || 'হিসাব কিতাব ৩৬০';
  const cashSales = Number(closingRecord.totalCashSales) || 0;
  const digitalSales = Number(closingRecord.totalDigitalSales) || 0;
  const totalSales = cashSales + digitalSales;
  const openingFloat = Number(closingRecord.openingFloat) || 0;
  const actualCash = Number(closingRecord.closingCash || closingRecord.actualCash) || 0;
  const expectedCash = openingFloat + cashSales;
  const discrepancy = actualCash - expectedCash;

  let discrepancyText = 'মিল রয়েছে (✓)';
  if (discrepancy > 0) {
    discrepancyText = `অতিরিক্ত +৳${discrepancy.toLocaleString()}`;
  } else if (discrepancy < 0) {
    discrepancyText = `ঘাটতি -৳${Math.abs(discrepancy).toLocaleString()}`;
  }

  if (lang === 'bn') {
    return `📊 *কাউন্টার শিফট হ্যান্ডওভার ও হিসাব রিপোর্ট*
━━━━━━━━━━━━━━━━━━━━
🏢 *প্রতিষ্ঠান:* ${company}
📍 *শাখা:* ${closingRecord.branchName || 'প্রধান শাখা'}
💻 *কাউন্টার:* ${closingRecord.counterName || 'কাউন্টার ০১'}
👤 *দায়িত্বপ্রাপ্ত ক্যাশিয়ার:* ${closingRecord.cashierName || 'ক্যাশিয়ার'}
📅 *তারিখ ও সময়:* ${closingRecord.timestamp || new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━
💵 *প্রারম্ভিক ক্যাশ (Opening Float):* ৳${openingFloat.toLocaleString()}
🛒 *মোট নগদ বিক্রয়:* ৳${cashSales.toLocaleString()}
📱 *মোট ডিজিটাল বিক্রয়:* ৳${digitalSales.toLocaleString()}
📈 *সর্বমোট বিক্রয়:* ৳${totalSales.toLocaleString()} (${closingRecord.totalTransactions || 0} টি মেমো)
━━━━━━━━━━━━━━━━━━━━
💼 *ড্রয়ারে হিসেবকৃত মোট ক্যাশ:* ৳${actualCash.toLocaleString()}
🎯 *ড্রয়ারে প্রত্যাশিত ক্যাশ:* ৳${expectedCash.toLocaleString()}
⚖️ *ক্যাশ স্ট্যাটাস:* ${discrepancyText}
${closingRecord.note ? `📝 *ক্যাশিয়ার নোট:* ${closingRecord.note}\n` : ''}━━━━━━━━━━━━━━━━━━━━
✓ হিসাবকিতাব ৩৬০ ডিজিটাল পিওএস সিকিউর হ্যান্ডওভার`;
  } else {
    return `📊 *COUNTER SHIFT CLOSING REPORT*
━━━━━━━━━━━━━━━━━━━━
🏢 *Company:* ${company}
📍 *Branch:* ${closingRecord.branchName || 'Main Branch'}
💻 *Counter:* ${closingRecord.counterName || 'Counter 01'}
👤 *Cashier:* ${closingRecord.cashierName || 'Cashier'}
📅 *Date & Time:* ${closingRecord.timestamp || new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━
💵 *Opening Float:* ৳${openingFloat.toLocaleString()}
🛒 *Cash Sales:* ৳${cashSales.toLocaleString()}
📱 *Digital Sales:* ৳${digitalSales.toLocaleString()}
📈 *Total Revenue:* ৳${totalSales.toLocaleString()} (${closingRecord.totalTransactions || 0} transactions)
━━━━━━━━━━━━━━━━━━━━
💼 *Actual Drawer Cash:* ৳${actualCash.toLocaleString()}
🎯 *Expected Cash:* ৳${expectedCash.toLocaleString()}
⚖️ *Discrepancy:* ${discrepancyText}
${closingRecord.note ? `📝 *Note:* ${closingRecord.note}\n` : ''}━━━━━━━━━━━━━━━━━━━━
✓ Verified by HisabKitab 360 POS System`;
  }
};

/**
 * Formats a polite, professional Due Reminder message for customer WhatsApp
 */
export const formatWhatsAppDueReminderMessage = (customer, dueAmount, businessSettings, lang = 'bn') => {
  const company = businessSettings?.companyName || 'হিসাব কিতাব ৩৬০';
  const hotline = businessSettings?.phone || '';
  const bkashNumber = businessSettings?.bkashNumber || hotline || '';
  const custName = customer?.name || 'সম্মানিত গ্রাহক';
  const numDue = Number(dueAmount || customer?.outstandingDue) || 0;

  if (lang === 'bn') {
    return `📢 *বকেয়া পরিশোধের বিনীত অনুরোধ*
━━━━━━━━━━━━━━━━━━━━
জনাব ${custName},
সালাম ও শুভেচ্ছা নিবেন।

${company}-এ আপনার হিসাবের খাতায় বর্তমান অবশিষ্ট বকেয়া রয়েছে: *৳${numDue.toLocaleString()}* টাকা।

অনুরোধপূর্বক সুবিধাজনক সময়ে এসে বকেয়া পরিশোধ করার জন্য বিনীত অনুরোধ জানাচ্ছি।
${bkashNumber ? `📲 *বিকাশ / নগদ পেমেন্ট:* ${bkashNumber}\n` : ''}
যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন:
📞 *হটলাইন:* ${hotline}

ধন্যবাদান্তে,
*${company}*`;
  } else {
    return `📢 *PAYMENT DUE REMINDER*
━━━━━━━━━━━━━━━━━━━━
Dear ${custName},
Greetings from ${company}.

This is a gentle reminder regarding your outstanding due of *৳${numDue.toLocaleString()}*.

Kindly arrange the payment at your earliest convenience.
${bkashNumber ? `📲 *bKash / Nagad payment:* ${bkashNumber}\n` : ''}
For any inquiries, feel free to contact us:
📞 *Hotline:* ${hotline}

Best regards,
*${company}*`;
  }
};

/**
 * Formats a message for client contacting vendor support
 */
export const formatVendorSupportWhatsAppMessage = (userInfo, shopName, appVersion = 'v2.0.0') => {
  const userText = userInfo?.name || userInfo?.email || 'নতুন ব্যবহারকারী';
  const store = shopName || 'আমার প্রতিষ্ঠান';
  return `হ্যালো HisabKitab 360 সাপোর্ট টিম 👋
আমি *${store}* (${userText}) থেকে যোগাযোগ করছি।

সফটওয়্যারটির (${appVersion}) ব্যবহারের বিষয়ে আমার কিছু কারিগরি ও ব্যবহারিক সহায়তা প্রয়োজন। অনুগ্রহ করে আমাকে সহযোগিতা করবেন কি?

ধন্যবাদ!`;
};

/**
 * Determine globally reachable base URL
 */
/**
 * Determine globally reachable base URL for document verification
 * Prioritizes:
 * 1. Explicitly configured verificationBaseUrl in currentSamity
 * 2. Custom domain saved in localStorage (somiti_live_domain / hk360_custom_verify_domain)
 * 3. Browser window.location.origin (supports localhost, 127.0.0.1, Wi-Fi LAN IP 192.168.x.x, Vercel deployments)
 * 4. currentSamity?.liveDomain or fallback
 */
export const getGlobalVerificationBaseUrl = (currentSamity) => {
  // 1. Explicitly configured verification domain in Samity settings
  if (currentSamity?.verificationBaseUrl && currentSamity.verificationBaseUrl.trim()) {
    let url = currentSamity.verificationBaseUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url.replace(/\/$/, '');
  }

  // 2. Custom domain from localStorage (configured via settings or QR verifier)
  if (typeof window !== 'undefined') {
    try {
      const savedCustomDomain = localStorage.getItem('hk360_custom_verify_domain') || localStorage.getItem('somiti_live_domain');
      if (savedCustomDomain && savedCustomDomain.trim()) {
        let url = savedCustomDomain.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        return url.replace(/\/$/, '');
      }

      // 3. Current active browser origin
      const origin = window.location.origin;
      if (origin && !origin.includes('capacitor://') && !origin.includes('electron://') && !origin.includes('file://')) {
        return origin + (window.location.pathname.endsWith('/') ? window.location.pathname.slice(0, -1) : window.location.pathname);
      }
    } catch (_) {}
  }

  // 4. Samity live domain
  if (currentSamity?.liveDomain && !currentSamity.liveDomain.includes('somiti360.vercel.app')) {
    return currentSamity.liveDomain.startsWith('http') ? currentSamity.liveDomain : `https://${currentSamity.liveDomain}`;
  }

  return 'https://hisabkitab360.vercel.app';
};

/**
 * Generates globally accessible Verification URL for Samity Deposit Receipts
 */
export const createSamityReceiptVerificationUrl = (deposit, currentSamity) => {
  if (!deposit) return 'https://hisabkitab360.vercel.app';
  const baseUrl = getGlobalVerificationBaseUrl(currentSamity);
  const formattedReceiptNo = deposit.receiptNo || deposit.voucherNo || `RCPT-${deposit.id || '001'}`;
  const memberName = deposit.memberName || deposit.depositorName || 'সদস্য';
  const samityName = currentSamity?.nameBn || 'স্বপ্নছোঁয়া সমবায় সমিতি';
  const samityReg = currentSamity?.regNo || 'সছস-২০২৪/০৯';
  const docHash = `HK360-RCPT-${(deposit.id || '0000').slice(0, 8).toUpperCase()}`;

  const payload = {
    t: 'receipt',
    rn: formattedReceiptNo,
    m: memberName,
    mid: deposit.memberId || '',
    d: deposit.depositorName || memberName,
    rel: deposit.depositorRelation || 'নিজে (Self)',
    a: Number(deposit.amount || 0),
    type: deposit.depositType || 'মাসিক সঞ্চয়/চাঁদা',
    month: deposit.paymentMonth || deposit.month || '',
    year: deposit.paymentYear || deposit.year || '',
    method: deposit.depositMethod || deposit.method || 'নগদ',
    dt: deposit.depositDate || deposit.date || new Date().toISOString().split('T')[0],
    sam: samityName,
    reg: samityReg,
    h: docHash
  };

  try {
    const token = encodeURIComponent(safeUtf8ToBase64(JSON.stringify(payload)));
    return `${baseUrl}?verify=receipt&receipt_no=${encodeURIComponent(formattedReceiptNo)}&member=${encodeURIComponent(memberName)}&amount=${payload.a}&depositor=${encodeURIComponent(payload.d)}&relation=${encodeURIComponent(payload.rel)}&method=${encodeURIComponent(payload.method)}&month=${encodeURIComponent(payload.month)}&year=${encodeURIComponent(payload.year)}&samity=${encodeURIComponent(samityName)}&reg=${encodeURIComponent(samityReg)}&data=${token}`;
  } catch {
    return `${baseUrl}?verify=receipt&receipt_no=${encodeURIComponent(formattedReceiptNo)}&member=${encodeURIComponent(memberName)}&amount=${payload.a}&samity=${encodeURIComponent(samityName)}`;
  }
};

/**
 * Generates globally accessible Verification URL for Samity Due Notices
 */
export const createSamityDueNoticeVerificationUrl = (notice, currentSamity) => {
  if (!notice) return 'https://hisabkitab360.vercel.app';
  const baseUrl = getGlobalVerificationBaseUrl(currentSamity);
  const member = notice.member || {};
  const status = notice.status || {};
  const memberName = member.nameBn || member.nameEn || 'সম্মানিত সদস্য';
  const samityName = currentSamity?.nameBn || 'স্বপ্নছোঁয়া সমবায় সমিতি';
  const dueMonths = (notice.dueMonthsList && notice.dueMonthsList.length > 0) ? notice.dueMonthsList.join(', ') : 'চলতি বকেয়া';
  const dueAmount = Number(status.totalDue ?? status.totalCumulativeDue ?? notice.totalDue ?? 0);
  const deadline = notice.deadline || `${currentSamity?.subscriptionDueDay || 10} তারিখের মধ্যে`;
  const docHash = `HK360-DUE-${(member.id || '0000').toUpperCase()}`;

  const payload = {
    t: 'due_notice',
    m: memberName,
    mid: member.id || '',
    due: dueAmount,
    months: dueMonths,
    dl: deadline,
    sam: samityName,
    reg: currentSamity?.regNo || 'সছস-২০২৪/০৯',
    h: docHash
  };

  try {
    const token = encodeURIComponent(safeUtf8ToBase64(JSON.stringify(payload)));
    return `${baseUrl}?verify=due_notice&member=${encodeURIComponent(memberName)}&memberId=${encodeURIComponent(member.id || '')}&due=${dueAmount}&months=${encodeURIComponent(dueMonths)}&deadline=${encodeURIComponent(deadline)}&samity=${encodeURIComponent(samityName)}&data=${token}`;
  } catch {
    return `${baseUrl}?verify=due_notice&member=${encodeURIComponent(memberName)}&due=${dueAmount}&samity=${encodeURIComponent(samityName)}`;
  }
};

/**
 * Generates globally accessible Verification URL for Official Documents / Resolutions
 */
export const createSamityOfficialDocVerificationUrl = (doc, currentSamity) => {
  const baseUrl = getGlobalVerificationBaseUrl(currentSamity);
  const ref = doc?.ref || 'সছস/২০২৬/০১';
  const title = doc?.title || 'অফিসিয়াল নোটিশ ও রেজুলেশন';
  const date = doc?.date || new Date().toISOString().split('T')[0];
  const samityName = currentSamity?.nameBn || 'স্বপ্নছোঁয়া সমবায় সমিতি';
  const regNo = currentSamity?.regNo || 'সছস-২০২৪/০৯';
  const docHash = `HK360-DOC-${Date.now().toString(36).toUpperCase()}`;

  const payload = {
    t: 'samity_doc',
    ref,
    title,
    date,
    sam: samityName,
    reg: regNo,
    h: docHash
  };

  try {
    const token = encodeURIComponent(safeUtf8ToBase64(JSON.stringify(payload)));
    return `${baseUrl}?verify=samity_doc&ref=${encodeURIComponent(ref)}&title=${encodeURIComponent(title)}&date=${encodeURIComponent(date)}&samity=${encodeURIComponent(samityName)}&reg=${encodeURIComponent(regNo)}&hash=${encodeURIComponent(docHash)}&data=${token}`;
  } catch {
    return `${baseUrl}?verify=samity_doc&ref=${encodeURIComponent(ref)}&title=${encodeURIComponent(title)}&date=${encodeURIComponent(date)}&samity=${encodeURIComponent(samityName)}`;
  }
};

/**
 * Generates globally accessible Verification URL for Membership Certificates
 */
export const createSamityMembershipCertVerificationUrl = (member, currentSamity) => {
  const baseUrl = getGlobalVerificationBaseUrl(currentSamity);
  const memberName = member?.nameBn || member?.nameEn || 'সম্মানিত সদস্য';
  const memberId = member?.id || member?.memberCode || 'SM-001';
  const samityName = currentSamity?.nameBn || 'স্বপ্নছোঁয়া সমবায় সমিতি';
  const regNo = currentSamity?.regNo || 'সছস-২০২৪/০৯';
  const docHash = `HK360-CERT-${(memberId || '0000').toUpperCase()}`;

  const payload = {
    t: 'membership_cert',
    m: memberName,
    mid: memberId,
    nid: member?.nidNumber || member?.nid || 'প্রযোজ্য নয়',
    joining: member?.joiningDate || member?.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    type: member?.membershipType || 'সাধারণ সদস্য',
    blood: member?.bloodGroup || 'O+',
    mobile: member?.mobile || '',
    sam: samityName,
    reg: regNo,
    h: docHash
  };

  try {
    const token = encodeURIComponent(safeUtf8ToBase64(JSON.stringify(payload)));
    return `${baseUrl}?verify=membership_cert&member=${encodeURIComponent(memberName)}&memberId=${encodeURIComponent(memberId)}&samity=${encodeURIComponent(samityName)}&reg=${encodeURIComponent(regNo)}&data=${token}`;
  } catch {
    return `${baseUrl}?verify=membership_cert&member=${encodeURIComponent(memberName)}&memberId=${encodeURIComponent(memberId)}&samity=${encodeURIComponent(samityName)}`;
  }
};

/**
 * Generates globally accessible Verification URL for Bulk Bank Deposit Reports
 */
export const createSamityBulkDepositVerificationUrl = (report, currentSamity) => {
  const baseUrl = getGlobalVerificationBaseUrl(currentSamity);
  const voucherNo = report?.bulkVoucherNo || report?.id || 'BULK-2026-001';
  const slipNo = report?.bankReceiptNo || 'SLIP-001';
  const bankName = report?.bankName || 'ব্যাংক';
  const totalAmount = Number(report?.totalSlipAmount || report?.allocatedAmount || 0);
  const count = (report?.items || []).length;
  const samityName = currentSamity?.nameBn || 'স্বপ্নছোঁয়া সমবায় সমিতি';
  const docHash = `HK360-BULK-${Date.now().toString(36).toUpperCase()}`;

  const payload = {
    t: 'bulk_deposit',
    vn: voucherNo,
    sn: slipNo,
    bn: bankName,
    branch: report?.branchName || 'প্রধান শাখা',
    accNo: report?.bankAccNo || '',
    a: totalAmount,
    c: count,
    dt: report?.depositDate || report?.date || new Date().toISOString().split('T')[0],
    sam: samityName,
    reg: currentSamity?.regNo || 'সছস-২০২৪/০৯',
    h: docHash
  };

  try {
    const token = encodeURIComponent(safeUtf8ToBase64(JSON.stringify(payload)));
    return `${baseUrl}?verify=bulk_deposit&voucher=${encodeURIComponent(voucherNo)}&slip=${encodeURIComponent(slipNo)}&bank=${encodeURIComponent(bankName)}&amount=${totalAmount}&count=${count}&samity=${encodeURIComponent(samityName)}&data=${token}`;
  } catch {
    return `${baseUrl}?verify=bulk_deposit&voucher=${encodeURIComponent(voucherNo)}&amount=${totalAmount}&samity=${encodeURIComponent(samityName)}`;
  }
};

/**
 * Generates globally accessible Verification URL for Member Smart ID Cards
 */
export const createSamityMemberIdCardVerificationUrl = (member, currentSamity) => {
  const baseUrl = getGlobalVerificationBaseUrl(currentSamity);
  const memberName = member?.nameBn || member?.nameEn || 'সম্মানিত সদস্য';
  const memberNameEn = member?.nameEn || '';
  const memberId = member?.memberCode || member?.id || 'SM-001';
  const samityName = currentSamity?.nameBn || 'স্বপ্নছোঁয়া সমবায় সমিতি';
  const regNo = currentSamity?.regNo || 'সছস-২০২৪/০৯';
  const docHash = `HK360-MID-${(memberId || '0000').toUpperCase()}`;

  const payload = {
    t: 'member_id_card',
    m: memberName,
    me: memberNameEn,
    mid: memberId,
    nid: member?.nidNumber || member?.nid || 'প্রযোজ্য নয়',
    blood: member?.bloodGroup || 'O+',
    mobile: member?.mobile || '',
    type: member?.membershipType || 'সাধারণ সদস্য',
    joining: member?.membershipStartDate || member?.joiningDate || member?.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    father: member?.fatherName || '',
    mother: member?.motherName || '',
    nominee: member?.nomineeName || '',
    nomineeRel: member?.nomineeRelation || '',
    photo: member?.photo || '',
    sam: samityName,
    reg: regNo,
    h: docHash
  };

  try {
    const token = encodeURIComponent(safeUtf8ToBase64(JSON.stringify(payload)));
    return `${baseUrl}?verify=member_id_card&member=${encodeURIComponent(memberName)}&memberId=${encodeURIComponent(memberId)}&type=${encodeURIComponent(payload.type)}&blood=${encodeURIComponent(payload.blood)}&samity=${encodeURIComponent(samityName)}&reg=${encodeURIComponent(regNo)}&data=${token}`;
  } catch {
    return `${baseUrl}?verify=member_id_card&member=${encodeURIComponent(memberName)}&memberId=${encodeURIComponent(memberId)}&samity=${encodeURIComponent(samityName)}`;
  }
};

/**
 * Generates globally accessible Verification URL for Member Passbook / Savings Account
 */
export const createSamityPassbookVerificationUrl = (member, currentSamity, totalSavings = 0) => {
  const baseUrl = getGlobalVerificationBaseUrl(currentSamity);
  const memberName = member?.nameBn || member?.nameEn || 'সম্মানিত সদস্য';
  const memberId = member?.memberCode || member?.id || 'SM-001';
  const samityName = currentSamity?.nameBn || 'স্বপ্নছোঁয়া সমবায় সমিতি';
  const docHash = `HK360-BOOK-${(memberId || '0000').toUpperCase()}`;

  const payload = {
    t: 'passbook',
    m: memberName,
    mid: memberId,
    savings: Number(totalSavings || 0),
    type: member?.membershipType || 'সাধারণ সঞ্চয়',
    sam: samityName,
    reg: currentSamity?.regNo || 'সছস-২০২৪/০৯',
    h: docHash
  };

  try {
    const token = encodeURIComponent(safeUtf8ToBase64(JSON.stringify(payload)));
    return `${baseUrl}?verify=passbook&member=${encodeURIComponent(memberName)}&memberId=${encodeURIComponent(memberId)}&savings=${totalSavings}&samity=${encodeURIComponent(samityName)}&data=${token}`;
  } catch {
    return `${baseUrl}?verify=passbook&member=${encodeURIComponent(memberName)}&memberId=${encodeURIComponent(memberId)}&samity=${encodeURIComponent(samityName)}`;
  }
};

