/**
 * Generate PNG icons from SVG files
 * Run: npm install sharp && node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

async function generateIcons() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.log('Installing sharp...');
    require('child_process').execSync('npm install sharp', { stdio: 'inherit' });
    sharp = require('sharp');
  }

  const publicDir = path.join(__dirname, '..', 'public');
  const iconSvg = path.join(publicDir, 'icon.svg');
  const ogSvg = path.join(publicDir, 'og-image.svg');

  // Generate app icons
  console.log('Generating logo192.png...');
  await sharp(iconSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'logo192.png'));

  console.log('Generating logo512.png...');
  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'logo512.png'));

  console.log('Generating favicon-32x32.png...');
  await sharp(iconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  console.log('Generating favicon-16x16.png...');
  await sharp(iconSvg)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));

  // Generate OG image
  console.log('Generating og-image.png...');
  await sharp(ogSvg)
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));

  // Generate favicon.ico (using 32x32 as base)
  console.log('Generating favicon.ico...');
  await sharp(iconSvg)
    .resize(32, 32)
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('\nAll icons generated successfully!');
  console.log('Files created in public/:');
  console.log('  - logo192.png');
  console.log('  - logo512.png');
  console.log('  - favicon-32x32.png');
  console.log('  - favicon-16x16.png');
  console.log('  - favicon.ico');
  console.log('  - og-image.png');
}

generateIcons().catch(console.error);
