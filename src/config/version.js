/**
 * Somiti 360 - Central Unified Version Registry
 * ---------------------------------------------------------
 * Version Parity Rule:
 * All platforms (Web, Android APK, Windows PC, macOS, Backend API)
 * must share the exact same version and build code!
 */
export const APP_VERSION = '2.5.3';
export const APP_BUILD_NUMBER = 28;
export const APP_VERSION_NAME = `v${APP_VERSION}`;
export const APP_RELEASE_TAG = `v${APP_VERSION}`;
export const APP_RELEASE_DATE = '2026-11-10';
export const APP_APK_FILENAME = `Somiti-360-v${APP_VERSION}-build${APP_BUILD_NUMBER}-android.apk`;

export const APP_RELEASE_NOTES = {
  bn: `সমিতি ৩৬০ ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — সুপারভাইজার লাইভ রাডার ও জমা তালিকার ক্র্যাশ সমাধান, পিসি ও মোবাইল APK এর মধ্যে রিয়েল-টাইম ট্রানজ্যাকশন সিঙ্ক, মাল্টি-ইউজার যৌথ জমা বাটন, অনুমোদকের ডিজিটাল স্বাক্ষর ও ব্যাংক স্টেটমেন্ট যাচাই সংক্রান্ত আইনি নোট সংযোজন।`,
  en: `Somiti 360 ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — Fixed Supervisor Radar & Deposits crashes, cross-device PC-to-Mobile real-time transaction sync, multi-member collective deposit button, approver digital signature & disclaimer note on official letterhead receipt.`
};

export default {
  version: APP_VERSION,
  buildNumber: APP_BUILD_NUMBER,
  versionName: APP_VERSION_NAME,
  releaseTag: APP_RELEASE_TAG,
  releaseDate: APP_RELEASE_DATE,
  apkFilename: APP_APK_FILENAME,
  releaseNotes: APP_RELEASE_NOTES
};
