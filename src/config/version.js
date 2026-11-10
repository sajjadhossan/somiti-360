/**
 * Somiti 360 - Central Unified Version Registry
 * ---------------------------------------------------------
 * Version Parity Rule:
 * All platforms (Web, Android APK, Windows PC, macOS, Backend API)
 * must share the exact same version and build code!
 */
export const APP_VERSION = '2.5.7';
export const APP_BUILD_NUMBER = 32;
export const APP_VERSION_NAME = `v${APP_VERSION}`;
export const APP_RELEASE_TAG = `v${APP_VERSION}`;
export const APP_RELEASE_DATE = '2026-11-10';
export const APP_APK_FILENAME = `Somiti-360-v${APP_VERSION}-build${APP_BUILD_NUMBER}-android.apk`;

export const APP_RELEASE_NOTES = {
  bn: `সমিতি ৩৬০ ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — এ-টু-জেড সার্বভৌম মাস্টার ফিচার সুইচবোর্ডের ফ্লেক্সবক্স কন্টেইনার ফিক্স, ৯টি ক্যাটাগরির ৮৯টি সুইচের পূর্ণ দৃশ্যমানতা ও এআই স্মার্ট টুলস আইকন ম্যাপিং আপডেট।`,
  en: `Somiti 360 ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — Fixed flexbox container height collapse in A-to-Z Master Switchboard, complete visibility for all 89 switches across 9 categories, and safe AI tools icon mapping.`
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
