const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../src/components/samity/SamityManagementHub.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Ensure getEffectiveSamityLogo is used in currentSamity logo calculation
const targetBlock0 = `    let samityLogo = samity.logo;
    if (
      !samityLogo ||
      samityLogo === "/somiti-emblem.svg" ||
      samityLogo === "/logo.png"
    ) {
      samityLogo = "/shopnochoa-logo.svg";
    }`;
const targetBlock0CRLF = targetBlock0.replace(/\n/g, '\r\n');
const replacementBlock0 = `    let samityLogo = samity.logo;
    if (
      !samityLogo ||
      samityLogo === "/somiti-emblem.svg" ||
      samityLogo === "/logo.png" ||
      samityLogo === "/shopnochoa-logo.svg"
    ) {
      samityLogo = getEffectiveSamityLogo() || "/somiti-emblem.png";
    }`;

if (content.includes(targetBlock0CRLF)) {
  content = content.replace(targetBlock0CRLF, replacementBlock0.replace(/\n/g, '\r\n'));
  console.log('✓ Patched currentSamity logo in SamityManagementHub');
}

// 2. In header-active-samity-logo-input, trigger setGlobalSamityLogo
const targetBlock1 = `                    const base64Logo = await compressImageFile(file, {
                      maxWidth: 512,
                      maxHeight: 512,
                      quality: 0.9,
                    });`;
const targetBlock1CRLF = targetBlock1.replace(/\n/g, '\r\n');

const replacementBlock1 = `                    const base64Logo = await compressImageFile(file, {
                      maxWidth: 512,
                      maxHeight: 512,
                      quality: 0.9,
                    });
                    try { await setGlobalSamityLogo(base64Logo, activeSamityId); } catch (_) {}`;

if (content.includes(targetBlock1CRLF)) {
  content = content.replace(targetBlock1CRLF, replacementBlock1.replace(/\n/g, '\r\n'));
  console.log('✓ Patched header logo uploader in SamityManagementHub');
}

// 3. In letterhead logo uploader, trigger setGlobalSamityLogo
const targetBlock2 = `                            const base64Logo = await compressImageFile(file, {
                              maxWidth: 500,
                              maxHeight: 500,
                              quality: 0.88,
                            });`;
const targetBlock2CRLF = targetBlock2.replace(/\n/g, '\r\n');

const replacementBlock2 = `                            const base64Logo = await compressImageFile(file, {
                              maxWidth: 500,
                              maxHeight: 500,
                              quality: 0.88,
                            });
                            try { await setGlobalSamityLogo(base64Logo, activeSamityId); } catch (_) {}`;

if (content.includes(targetBlock2CRLF)) {
  content = content.replace(targetBlock2CRLF, replacementBlock2.replace(/\n/g, '\r\n'));
  console.log('✓ Patched letterhead logo uploader in SamityManagementHub');
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully saved SamityManagementHub.jsx');
