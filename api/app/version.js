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
      latestVersion: "2.1.0",
      buildNumber: 21,
      minimumSupportedVersion: "2.0.0",
      apkDownloadUrl: "https://github.com/sajjadhossan/somiti-360/releases/latest",
      releaseNotes: {
        bn: "সমিতি ৩৬০ v2.1.0 (Build 21) — নতুন কিউআর ভেরিফিকেশন সিস্টেম, জিরো-লগইন পাবলিক ভেরিফিকেশন পোর্টাল, অফলাইন-ফার্স্ট হাইব্রিড ইঞ্জিন ও অটোমেটিক ভার্সন সিঙ্ক।",
        en: "Somiti 360 v2.1.0 (Build 21) — QR Code Verification Portal, Zero-Login Verification Shell, Offline-First Hybrid Engine & Automated Multi-Platform Version Sync."
      },
      forceUpdate: false,
      releaseDate: new Date().toISOString()
    }
  });
}
