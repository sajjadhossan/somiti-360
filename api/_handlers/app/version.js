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
      latestVersion: "2.5.2",
      buildNumber: 27,
      minimumSupportedVersion: "2.1.0",
      apkDownloadUrl: "https://github.com/sajjadhossan/somiti-360/releases/download/latest/Somiti-360.apk",
      releaseNotes: {
        bn: "সমিতি ৩৬০ v2.5.2 (Build 27) — এক রসিদে বহু সদস্যের জমা, প্যাডে ব্যাংক স্লিপ ছবি সংযোজন, ছবি ও পিডিএফ ডাউনলোড এবং হোয়াটসঅ্যাপ গ্রুপ শেয়ার।",
        en: "Somiti 360 v2.5.2 (Build 27) — Multi-member collective receipt on letterhead pad with embedded bank slip proof, image & PDF download, and WhatsApp group sharing."
      },
      forceUpdate: false,
      releaseDate: new Date().toISOString()
    }
  });
}
