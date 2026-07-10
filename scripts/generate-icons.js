const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// A beautiful SVG representation of a tree/leaf combining Stellar brand colors (#00B36B and #14B6E7)
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#0D0B21"/>
  <!-- Stylized Canopy Leaf -->
  <path d="M256 80C150 180 150 320 256 420C362 320 362 180 256 80Z" fill="url(#leaf_gradient)"/>
  <!-- Leaf vein -->
  <path d="M256 160V410" stroke="#0D0B21" stroke-width="8" stroke-linecap="round"/>
  <path d="M256 220C220 240 200 280 200 280" stroke="#0D0B21" stroke-width="6" stroke-linecap="round"/>
  <path d="M256 270C292 290 312 330 312 330" stroke="#0D0B21" stroke-width="6" stroke-linecap="round"/>
  <path d="M256 320C220 340 200 380 200 380" stroke="#0D0B21" stroke-width="6" stroke-linecap="round"/>
  
  <defs>
    <linearGradient id="leaf_gradient" x1="256" y1="80" x2="256" y2="420" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00C2FF"/> <!-- Stellar Cyan -->
      <stop offset="0.5" stop-color="#00B36B"/> <!-- Stellar Green -->
      <stop offset="1" stop-color="#3E1BDB"/> <!-- Stellar Purple -->
    </linearGradient>
  </defs>
</svg>
`;

async function generateIcons() {
  try {
    const svgBuffer = Buffer.from(svgIcon);
    
    // Generate 192x192
    await sharp(svgBuffer)
      .resize(192, 192)
      .toFile(path.join(iconsDir, 'icon-192.png'));
    console.log('✓ Generated icon-192.png');

    // Generate 512x512
    await sharp(svgBuffer)
      .resize(512, 512)
      .toFile(path.join(iconsDir, 'icon-512.png'));
    console.log('✓ Generated icon-512.png');
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
