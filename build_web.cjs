const fs = require('fs');
const path = require('path');

console.log('⚡ Building Somiti 360 Web Portal for Vercel...');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy public assets if exists
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, distDir, { recursive: true });
  console.log('✅ Copied public assets to dist/');
}

// Copy index.html
const indexHtml = path.join(__dirname, 'index.html');
if (fs.existsSync(indexHtml)) {
  fs.copyFileSync(indexHtml, path.join(distDir, 'index.html'));
  console.log('✅ Prepared dist/index.html');
}

console.log('🎉 Somiti 360 Web Build completed successfully for Vercel!');
