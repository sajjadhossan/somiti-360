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
      latestVersion: "2.6.4",
      buildNumber: 39,
      minimumSupportedVersion: "2.1.0",
      apkDownloadUrl: "https://github.com/sajjadhossan/somiti-360/releases/download/latest/Somiti-360.apk",
      releaseNotes: {
        bn: "সমিতি ৩৬০ v2.6.4 (Build 39) — এররবাউন্ডারি সাময়িক ত্রুটি সমাধান, ক্লাউড স্টেট সিঙ্ক ইভেন্ট পেলোড গার্ড এবং লোড সমিতি ডাটা এরে গ্যারান্টি সংযোজন।",
        en: "Somiti 360 v2.6.4 (Build 39) — ErrorBoundary crash fix, cloud state sync event payload guarding, and guaranteed array structures in loadSamityData."
      },
      forceUpdate: false,
      releaseDate: new Date().toISOString()
    }
  });
}
