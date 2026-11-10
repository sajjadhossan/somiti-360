/**
 * Somiti 360 - Central Unified Version Registry
 * ---------------------------------------------------------
 * Version Parity Rule:
 * All platforms (Web, Android APK, Windows PC, macOS, Backend API)
 * must share the exact same version and build code!
 */
export const APP_VERSION = '2.5.8';
export const APP_BUILD_NUMBER = 33;
export const APP_VERSION_NAME = `v${APP_VERSION}`;
export const APP_RELEASE_TAG = `v${APP_VERSION}`;
export const APP_RELEASE_DATE = '2026-11-10';
export const APP_APK_FILENAME = `Somiti-360-v${APP_VERSION}-build${APP_BUILD_NUMBER}-android.apk`;

export const APP_RELEASE_NOTES = {
  bn: `সমিতি ৩৬০ ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — সমিতি প্রোফাইল, ব্যাংক হিসাব, মোবাইল ব্যাংকিং, অফিস ঠিকানা ও চাঁদা পলিসি কার্ডসমূহে সরাসরি ক্লিকযোগ্য এডিট অপশন সংযোজন, ট্যাব রিসেট বাগ ফিক্স এবং সাইডবার ড্রয়ার ন্যাভিগেশন আইসোলেশন।`,
  en: `Somiti 360 ${APP_VERSION_NAME} (Build ${APP_BUILD_NUMBER}) — Added direct clickable editing on bank, mobile banking, address and policy cards, fixed tab reset bug in edit modal, and isolated sidebar drawer active state navigation.`
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
