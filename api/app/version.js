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
      latestVersion: "2.0.0",
      buildNumber: 20,
      minimumSupportedVersion: "1.9.0",
      apkDownloadUrl: "https://github.com/sajjadhossan/somiti-360/releases/latest",
      releaseNotes: {
        bn: "সমিতি ৩৬০ v2.0.0 — অফলাইন-ফার্স্ট হাইব্রিড সুপার অ্যাপ, জিরো-ল্যাগ লোকাল ডাটাবেজ, পুশ/পুল সিঙ্ক ইঞ্জিন, স্বয়ংক্রিয় কনফ্লিক্ট রেজোলিউশন ও PWA অফলাইন সাপোর্ট।",
        en: "Somiti 360 v2.0.0 — Offline-First Hybrid Super App, Zero-Lag Local Database, Push/Pull Sync Engine, Conflict Resolution & PWA Offline Shell Support."
      },
      forceUpdate: false,
      releaseDate: new Date().toISOString()
    }
  });
}
