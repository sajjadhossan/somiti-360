/**
 * Somiti 360 - Central Unified Version Registry
 * ---------------------------------------------------------
 * Version Parity Rule:
 * All platforms (Web, Android APK, Windows PC, macOS, Backend API)
 * must share the exact same version and build code!
 */
export const APP_VERSION = '2.6.1';
export const APP_BUILD_NUMBER = 36;
export const APP_VERSION_NAME = `v${APP_VERSION}`;
export const APP_RELEASE_TAG = `v${APP_VERSION}`;
export const APP_RELEASE_DATE = '2026-11-11';
export const APP_APK_FILENAME = `Somiti-360-v${APP_VERSION}-build${APP_BUILD_NUMBER}-android.apk`;

export const APP_RELEASE_NOTES = {
  bn: `সমিতি ৩৬০ ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — সার্বভৌম মাস্টার ফিচার সুইচবোর্ডে ফ্লেক্সবক্স কলাপ্স ফিক্স (৯টি ক্যাটাগরির ৮৯টি সুইচের পূর্ণ দৃশ্যমানতা ও স্ক্রোলযোগ্যতা নিশ্চিত) এবং সুপারবেস ও নিয়ন লাইভ রাডারে স্মুথ ভার্টিক্যাল স্ক্রোলিং সমাধান।`,
  en: `Somiti 360 ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — Fixed flexbox collapse in Master Feature Switchboard ensuring full visibility and smooth scroll for all 89 switches across 9 categories, and smooth vertical scrolling in Supabase & Neon Live Radar.`
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
