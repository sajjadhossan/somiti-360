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
      latestVersion: "2.3.0",
      buildNumber: 23,
      minimumSupportedVersion: "2.1.0",
      apkDownloadUrl: "https://github.com/sajjadhossan/somiti-360/releases/download/latest/Somiti-360.apk",
      releaseNotes: {
        bn: "সমিতি ৩৬০ v2.3.0 (Build 23) — ইন-প্লেস এপিকে স্মুথ আপডেট (আনইনস্টল ছাড়াই), পারসিস্টেন্ট মাল্টি-প্ল্যাটফর্ম লোগো সিঙ্ক, এবং সুপার অ্যাডমিন সম্পূর্ণ ডাইনামিক নিজস্ব সমিতি নির্ধারণ।",
        en: "Somiti 360 v2.3.0 (Build 23) — In-place seamless APK update (no uninstall required), persistent multi-platform logo sync, and fully dynamic Super Admin Own Samity designation."
      },
      forceUpdate: false,
      releaseDate: new Date().toISOString()
    }
  });
}
