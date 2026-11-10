/**
 * Somiti 360 - Central Unified Version Registry
 * ---------------------------------------------------------
 * Version Parity Rule:
 * All platforms (Web, Android APK, Windows PC, macOS, Backend API)
 * must share the exact same version and build code!
 */
export const APP_VERSION = '2.5.5';
export const APP_BUILD_NUMBER = 30;
export const APP_VERSION_NAME = `v${APP_VERSION}`;
export const APP_RELEASE_TAG = `v${APP_VERSION}`;
export const APP_RELEASE_DATE = '2026-11-10';
export const APP_APK_FILENAME = `Somiti-360-v${APP_VERSION}-build${APP_BUILD_NUMBER}-android.apk`;

export const APP_RELEASE_NOTES = {
  bn: `সমিতি ৩৬০ ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — Smartphone আইকন ইমপোর্ট ও ডিপোজিট ক্র্যাশ সমাধান, প্রোফাইল-ঠিকানা-ব্যাংক সাব-ট্যাব নিখুঁত সিলেকশন, সুপাবেস ও নিয়ন ক্লাউড লাইভ ডুয়েল সিঙ্ক রাডার এবং সুপার অ্যাডমিন পাসওয়ার্ড গেটওয়ে (159357) যুক্তকরণ।`,
  en: `Somiti 360 ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — Fixed Smartphone reference error & deposits crash, isolated drawer sub-action active highlighting, Supabase & Neon live dual sync radar, and Super Admin secure PIN gateway (159357).`
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
