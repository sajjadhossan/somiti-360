/**
 * Somiti 360 - Central Unified Version Registry
 * ---------------------------------------------------------
 * Version Parity Rule:
 * All platforms (Web, Android APK, Windows PC, macOS, Backend API)
 * must share the exact same version and build code!
 */
export const APP_VERSION = '2.4.0';
export const APP_BUILD_NUMBER = 24;
export const APP_VERSION_NAME = `v${APP_VERSION}`;
export const APP_RELEASE_TAG = `v${APP_VERSION}`;
export const APP_RELEASE_DATE = '2026-11-09';
export const APP_APK_FILENAME = `Somiti-360-v${APP_VERSION}-build${APP_BUILD_NUMBER}-android.apk`;

export const APP_RELEASE_NOTES = {
  bn: `সমিতি ৩৬০ ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — ইন-প্লেস এপিকে স্মুথ আপডেট v2.4.0, রেন্ডার ব্লুপ্রিন্ট স্ট্যান্ডার্ডাইজেশন, সেন্ট্রালাইজড লোগো ইঞ্জিন ও সুপার অ্যাডমিন নিজস্ব সমিতি কন্ট্রোল।`,
  en: `Somiti 360 ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — In-place seamless APK update v2.4.0, Render Blueprint standardization, centralized logo engine & Super Admin Own Samity control.`
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
