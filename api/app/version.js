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
      latestVersion: "1.9.0",
      buildNumber: 19,
      minimumSupportedVersion: "1.8.0",
      apkDownloadUrl: "https://github.com/sajjadhossan/somiti-360/releases/latest",
      releaseNotes: {
        bn: "সমিতি ৩৬০ v1.9.0 — এআই ব্যাংক ডিপোজিট স্ক্যানার, এক ক্লিকে রসিদ তৈরি, হাই-রেজুলেশন কিউআর কোড এবং ভেরিফিকেশন লিঙ্ক সংযোজন।",
        en: "Somiti 360 v1.9.0 — AI Bank Deposit Scanner, One-Command Deposit, High-Res QR Code and Public Verification integration."
      },
      forceUpdate: false,
      releaseDate: new Date().toISOString()
    }
  });
}
