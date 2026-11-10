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
      latestVersion: "2.5.1",
      buildNumber: 26,
      minimumSupportedVersion: "2.1.0",
      apkDownloadUrl: "https://github.com/sajjadhossan/somiti-360/releases/download/latest/Somiti-360.apk",
      releaseNotes: {
        bn: "সমিতি ৩৬০ v2.5.1 (Build 26) — somiti360.vercel.app প্রোডাকশন ডোমেন সিঙ্ক, সদস্য ছবি ও প্যাড হেডার ইউনিভার্সাল ক্লাউড ইন্টিগ্রেশন।",
        en: "Somiti 360 v2.5.1 (Build 26) — somiti360.vercel.app production domain sync, member photos & letterhead universal cloud integration."
      },
      forceUpdate: false,
      releaseDate: new Date().toISOString()
    }
  });
}
