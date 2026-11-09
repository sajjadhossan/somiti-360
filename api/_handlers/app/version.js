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
      latestVersion: "2.5.0",
      buildNumber: 25,
      minimumSupportedVersion: "2.1.0",
      apkDownloadUrl: "https://github.com/sajjadhossan/somiti-360/releases/download/latest/Somiti-360.apk",
      releaseNotes: {
        bn: "সমিতি ৩৬০ v2.5.0 (Build 25) — ক্রস-প্ল্যাটফর্ম লোগো, সদস্য ছবি ও হেডার প্যাড পার্মানেন্ট ক্লাউড সিঙ্ক এবং ইউনিভার্সাল এপিআই গেটওয়ে আপডেট।",
        en: "Somiti 360 v2.5.0 (Build 25) — Cross-platform persistent logo, member photos & letterhead cloud sync and universal serverless API gateway."
      },
      forceUpdate: false,
      releaseDate: new Date().toISOString()
    }
  });
}
