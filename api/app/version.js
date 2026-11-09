export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    success: true,
    data: {
      latestVersion: "2.4.0",
      buildNumber: 24,
      minimumSupportedVersion: "2.1.0",
      apkDownloadUrl: "https://github.com/sajjadhossan/somiti-360/releases/download/latest/Somiti-360.apk",
      releaseNotes: {
        bn: "সমিতি ৩৬০ v2.4.0 (Build 24) — ইন-প্লেস এপিকে স্মুথ আপডেট v2.4.0, রেন্ডার ব্লুপ্রিন্ট স্ট্যান্ডার্ডাইজেশন, সেন্ট্রালাইজড লোগো ইঞ্জিন ও সুপার অ্যাডমিন নিজস্ব সমিতি কন্ট্রোল।",
        en: "Somiti 360 v2.4.0 (Build 24) — In-place seamless APK update v2.4.0, Render Blueprint standardization, centralized logo engine & Super Admin Own Samity control."
      },
      forceUpdate: false,
      releaseDate: new Date().toISOString()
    }
  });
}
