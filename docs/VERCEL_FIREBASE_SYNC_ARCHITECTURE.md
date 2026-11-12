# 🌐 সমিতি ৩৬০ (Somiti 360) — Vercel & Firebase Continuous Sync Guide

এই গাইডে বিস্তারিতভাবে বর্ণনা করা হয়েছে কীভাবে **GitHub**, **Vercel (`https://somiti360.vercel.app`)** এবং **অ্যান্ড্রয়েড নেটিভ অ্যাপ** এর মধ্যে অবিচ্ছিন্ন সংযোগ (Continuous Deployment & Real-time Live Data Synchronization) কার্যকর থাকবে।

---

## ১. গিটহাব ও ভার্সেল অটোমেশন (GitHub Actions & Vercel Deploy Sync)

### 📌 কীভাবে কাজ করে:
যখনই আপনি কোড গিটহাবে পুশ করবেন (`main` অথবা `master` ব্রাঞ্চে), গিটহাব অ্যাকশনসের প্রথম জবটি স্বয়ংক্রিয়ভাবে চালু হবে:
```yaml
name: 🌐 Verify Web Build & Vercel Sync
```

এই জবটি নিম্নলিখিত কাজগুলো একযোগে করে:
1. **Repository Checkout & Web Validation:** ওয়েব অ্যাসেট ও ডিপেনডেন্সি ভ্যালিডেশন করে।
2. **Vercel Deploy Hook Trigger:** যদি গিটহাব সিক্রেটে `VERCEL_DEPLOY_HOOK` যুক্ত করা থাকে, তবে গিটহাব সাথে সাথে ভার্সেলকে নতুন ডিপ্লয়মেন্ট শুরু করার সিগন্যাল পাঠিয়ে দেয়।
3. **Live Connectivity Verification:** ভার্সেল ডোমেন `https://somiti360.vercel.app` পিং করে এর এইচটিটিপি স্ট্যাটাস এবং লাইভ রেসপন্স যাচাই করে।

---

## ২. ভার্সেল প্রজেক্টের সাথে গিটহাব কানেক্ট করার ধাপসমূহ

### পদ্ধতি ক (সুপার ফাস্ট - Native GitHub Integration):
1. [Vercel Dashboard](https://vercel.com/dashboard)-এ যান।
2. আপনার `somiti360` প্রজেক্টটি ওপেন করুন।
3. **Settings > Git**-এ যান।
4. **Connected Git Repository** সেকশনে আপনার রিপোজিটরি (`sajjadhossan/somiti-360`) লিঙ্ক করুন।
5. Production Branch হিসেবে `main` নির্বাচন করুন।
> এখন থেকে প্রতিবার গিটহাবে পুশ করলেই ভার্সেল নিজে থেকেই সর্বশেষ কোড বিল্ড করে `https://somiti360.vercel.app`-এ লাইভ করে দেবে।

### পদ্ধতি খ (গিটহাব অ্যাকশনস দিয়ে ইনস্ট্যান্ট ডিপ্লয় হুক - Vercel Deploy Hook):
1. ভার্সেল ড্যাশবোর্ডে আপনার প্রজেক্টের **Settings > Git > Deploy Hooks**-এ যান।
2. একটি নতুন হুক তৈরি করুন (নাম দিন: `github-actions-sync`, Branch: `main`)।
3. তৈরি হওয়া হুক URL-টি কপি করুন (যেমন: `https://api.vercel.com/v1/integrations/deploy/prj_...`)।
4. আপনার গিটহাব রিপোজিটরির **Settings > Secrets and variables > Actions > New repository secret**-এ যান:
   - **Name:** `VERCEL_DEPLOY_HOOK`
   - **Value:** কপি করা ভার্সেল হুক URL পেস্ট করুন।
> ফলে প্রতিবার গিটহাব পুশের সময় `🌐 Verify Web Build & Vercel Sync` সরাসরি ভার্সেলে ডিপ্লয় শুরু করে দেবে!

---

## ৩. ভার্সেল ওয়েব এবং অ্যান্ড্রয়েড অ্যাপের মধ্যে রিয়েল-টাইম ডাটা সিঙ্ক (Continuous Data Sync)

অ্যান্ড্রয়েড অ্যাপ ও ভার্সেল ওয়েব অ্যাপ উভয়ই একই **Firebase Firestore ক্লাউড ডাটাবেস** শেয়ার করে। 

### ডাটাবেস ক্রেডেনশিয়ালস (Shared Cloud Configuration):
- **Firebase Project ID:** `hisabkitab-360-backup-511708`
- **Firebase Database ID:** `ai-studio-android-somiti36-06ce66d2-b4dd-48c3-a418-88d8d0c9d1d6`
- **API Key:** `AIzaSyD8kDuzz6SUig8L0K8iU1pBDdEP2oGdego`
- **Auth Domain:** `hisabkitab-360-backup-511708.firebaseapp.com`
- **Storage Bucket:** `hisabkitab-360-backup-511708.firebasestorage.app`

### প্রধান কালেকশনসমূহ (Collections):
1. `members` — সকল সদস্যের তথ্য, শেয়ার মূলধন, ফোন ও স্ট্যাটাস।
2. `deposits` — চাঁদা বা সঞ্চয় জমা, ডিজিটাল মানি রিসিট ও ভেরিফিকেশন কোড।
3. `expenses` — অফিস ও পরিচালন ব্যয়ের ভাউচার এন্ট্রি।
4. `samity_profile` — সমিতির নাম, রিজার্ভ ফান্ড ও অফিসিয়াল ঠিকানা।
5. `cloud_backups` — গুগল ড্রাইভ ও স্বয়ংক্রিয় ক্লাউড স্ন্যাপশট।

---

## ৪. ভার্সেল ওয়েব অ্যাপে ব্যবহারের জন্য জাভাস্ক্রিপ্ট কোড (Firebase Web Client)

ভার্সেল ওয়েবসাইটে (`https://somiti360.vercel.app`) রিয়েল-টাইম লাইভ সিঙ্কের জন্য নিচের কোডটি ওয়েব ফ্রন্টএন্ডে ব্যবহার করুন:

```javascript
// src/services/somitiFirebaseSync.js
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8kDuzz6SUig8L0K8iU1pBDdEP2oGdego",
  authDomain: "hisabkitab-360-backup-511708.firebaseapp.com",
  projectId: "hisabkitab-360-backup-511708",
  storageBucket: "hisabkitab-360-backup-511708.firebasestorage.app",
  messagingSenderId: "364340009000",
  appId: "1:364340009000:web:somiti360webclient"
};

const app = initializeApp(firebaseConfig);

// ⚡ অতি গুরুত্বপূর্ণ: অ্যান্ড্রয়েড অ্যাপের মতো একই কাস্টম ডাটাবেস আইডি দিন
export const db = getFirestore(app, "ai-studio-android-somiti36-06ce66d2-b4dd-48c3-a418-88d8d0c9d1d6");

/**
 * রিয়েল-টাইম কিস্তি জমার লাইভ লিসেনার (অ্যান্ড্রয়েড থেকে জমা হলে সাথে সাথে ওয়েবে চলে আসবে)
 */
export function listenToLiveDeposits(onUpdateCallback) {
  const q = query(collection(db, "deposits"), orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const deposits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    onUpdateCallback(deposits);
  });
}

/**
 * রিয়েল-টাইম সদস্য তালিকার লাইভ লিসেনার
 */
export function listenToLiveMembers(onUpdateCallback) {
  return onSnapshot(collection(db, "members"), (snapshot) => {
    const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    onUpdateCallback(members);
  });
}

/**
 * ওয়েব থেকে নতুন জমা এন্ট্রি করা (অ্যান্ড্রয়েডে কয়েক মিলি-সেকেন্ডে সিঙ্ক হবে)
 */
export async function addDepositFromWeb(depositData) {
  const docRef = doc(collection(db, "deposits"));
  await setDoc(docRef, {
    ...depositData,
    id: docRef.id,
    createdAt: new Date().toISOString(),
    source: "web_portal"
  });
  return docRef.id;
}
```

---

## ৫. লাইভ সিঙ্কের কার্যপ্রণালী (How Continuous Sync Happens)

```
       [ অ্যান্ডয়েড মোবাইল অ্যাপ ]
                  │
   (addSnapshotListener & setDoc)
                  │
                  ▼
 [ Google Cloud Firebase Firestore ]
    (Database: ai-studio-android-somiti36-...)
                  ▲
                  │
      (onSnapshot & setDoc)
                  │
      [ Vercel Web Portal ]
  (https://somiti360.vercel.app)
```

1. **মোবাইলে লেনদেন হলে:** মাঠ পর্যায়ে ফিল্ড অফিসার অ্যান্ড্রয়েড অ্যাপে কিস্তি জমা নেওয়া মাত্র তা ফায়ারস্টোরের `deposits` কালেকশনে পুশ হয়।
2. **ওয়েবে তাৎক্ষণিক দৃশ্যমান:** ভার্সেল ওয়েব পোর্টালে কোনো রিলোড ছাড়াই ৫-১০ মিলি-সেকেন্ডের মধ্যে নতুন জমার এন্ট্রি ও রসিদ লাইভ ড্যাশবোর্ডে ভেসে ওঠে।
3. **ওয়েবে লেনদেন হলে:** সমিতি অফিসে বসে কেউ যদি ওয়েব পোর্টাল থেকে কোনো খরচ বা নতুন সদস্য যুক্ত করেন, তা তৎক্ষণাৎ মাঠ পর্যায়ের অ্যান্ড্রয়েড অ্যাপের স্ক্রিনে রিয়েল-টাইমে আপডেট হয়ে যায়।
4. **অফলাইন সাপোর্ট:** অ্যান্ড্রয়েড ও ওয়েব উভয়েই লোকাল ক্যাশ সাপোর্ট করে; ফলে ইন্টারনেট সাময়িক না থাকলেও ডাটা হারাবে না, ইন্টারনেট ফিরলেই অটো সিঙ্ক হবে।
