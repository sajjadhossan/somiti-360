/**
 * Somiti 360 - Central Unified Version Registry
 * ---------------------------------------------------------
 * Version Parity Rule:
 * All platforms (Web, Android APK, Windows PC, macOS, Backend API)
 * must share the exact same version and build code!
 */
export const APP_VERSION = '2.5.1';
export const APP_BUILD_NUMBER = 26;
export const APP_VERSION_NAME = `v${APP_VERSION}`;
export const APP_RELEASE_TAG = `v${APP_VERSION}`;
export const APP_RELEASE_DATE = '2026-11-10';
export const APP_APK_FILENAME = `Somiti-360-v${APP_VERSION}-build${APP_BUILD_NUMBER}-android.apk`;

export const APP_RELEASE_NOTES = {
  bn: `সমিতি ৩৬০ ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — somiti360.vercel.app প্রোডাকশন ডোমেন সিঙ্ক, সদস্য ছবি ও প্যাড হেডার ইউনিভার্সাল ক্লাউড ইন্টিগ্রেশন।`,
  en: `Somiti 360 ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — somiti360.vercel.app production domain sync, member photos & letterhead universal cloud integration.`
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
