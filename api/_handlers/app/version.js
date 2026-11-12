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
      latestVersion: "2.6.5",
      buildNumber: 40,
      minimumSupportedVersion: "2.1.0",
      apkDownloadUrl: "https://github.com/sajjadhossan/somiti-360/releases/download/latest/Somiti-360.apk",
      releaseNotes: {
        bn: "সমিতি ৩৬০ v2.6.5 (Build 40) — মোবাইল APK ও ওয়েব ইউনিভার্সাল পরম API পাথ সমাধান, তাৎক্ষণিক মিউটেশন পুশ, টু-ওয়ে রুট ডিপ-মার্জিং ও ১-ক্লিক ক্লাউড সিঙ্ক স্ট্যাটাস ব্যাজ সংযোজন।",
        en: "Somiti 360 v2.6.5 (Build 40) — Universal absolute API paths for mobile APK & web parity, immediate mutation cloud push, two-way root level deep-merging, and 1-click live cloud sync badge."
      },
      forceUpdate: false,
      releaseDate: new Date().toISOString()
    }
  });
}
