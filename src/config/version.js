/**
 * Somiti 360 - Central Unified Version Registry
 * ---------------------------------------------------------
 * Version Parity Rule:
 * All platforms (Web, Android APK, Windows PC, macOS, Backend API)
 * must share the exact same version and build code!
 */
export const APP_VERSION = '2.6.2';
export const APP_BUILD_NUMBER = 37;
export const APP_VERSION_NAME = `v${APP_VERSION}`;
export const APP_RELEASE_TAG = `v${APP_VERSION}`;
export const APP_RELEASE_DATE = '2026-11-11';
export const APP_APK_FILENAME = `Somiti-360-v${APP_VERSION}-build${APP_BUILD_NUMBER}-android.apk`;

export const APP_RELEASE_NOTES = {
  bn: `সমিতি ৩৬০ ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — সুপারবেস ও নিয়ন লাইভ রাডার এবং মাস্টার সুইচবোর্ডে বডি স্ক্রোল লক ও ওভারস্ক্রোল কন্টেইন বাস্তবায়ন, ব্যাকগ্রাউন্ড স্ক্রোলিং রোধ ও পপআপে সম্পূর্ণ ইউনিফাইড ভার্টিক্যাল স্ক্রোলিং সমাধান।`,
  en: `Somiti 360 ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — Implemented body scroll lock and overscroll containment in Supabase & Neon Live Radar and Master Switchboard, preventing background scroll leakage and enabling silky unified modal vertical scrolling.`
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
