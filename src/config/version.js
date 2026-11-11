/**
 * Somiti 360 - Central Unified Version Registry
 * ---------------------------------------------------------
 * Version Parity Rule:
 * All platforms (Web, Android APK, Windows PC, macOS, Backend API)
 * must share the exact same version and build code!
 */
export const APP_VERSION = '2.6.3';
export const APP_BUILD_NUMBER = 38;
export const APP_VERSION_NAME = `v${APP_VERSION}`;
export const APP_RELEASE_TAG = `v${APP_VERSION}`;
export const APP_RELEASE_DATE = '2026-11-11';
export const APP_APK_FILENAME = `Somiti-360-v${APP_VERSION}-build${APP_BUILD_NUMBER}-android.apk`;

export const APP_RELEASE_NOTES = {
  bn: `সমিতি ৩৬০ ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — নিয়ন ক্লাউড ডাটাবেজ পার্মানেন্ট ফলব্যাক কানেকশন ও ডিপ-মার্জ সিঙ্ক ইঞ্জিন ফিক্স, মোবাইল APK ও ওয়েব-টু-ওয়েব ট্রানজেকশন ডাটা অবিলম্বে দৃশ্যমান ও সংরক্ষিত হওয়ার সমাধান।`,
  en: `Somiti 360 ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — Permanent Neon Cloud Postgres connection fallback, deep-merging cloud sync engine, and immediate mobile APK to web cross-device transaction synchronization.`
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
