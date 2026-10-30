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
      latestVersion: "2.2.0",
      buildNumber: 22,
      minimumSupportedVersion: "2.1.0",
      apkDownloadUrl: "https://github.com/sajjadhossan/somiti-360/releases/latest",
      releaseNotes: {
        bn: "সমিতি ৩৬০ v2.2.0 (Build 22) — সুপার এডমিন SaaS মাল্টি-টেন্যান্ট ইঞ্জিন, ১১টি ফিচার অন/অফ সুইচবোর্ড, স্টাফ ও সদস্য পারমিশন (RBAC Matrix) এবং আইসোলেটেড টেন্যান্ট স্যান্ডবক্স।",
        en: "Somiti 360 v2.2.0 (Build 22) — Super Admin Multi-Tenant SaaS Engine, 11-Feature Toggle Switchboard, Granular Staff/Member RBAC Matrix & Isolated Tenant Sandbox."
      },
      forceUpdate: false,
      releaseDate: new Date().toISOString()
    }
  });
}
