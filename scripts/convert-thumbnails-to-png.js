const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function main() {
  const thumbnailDir = path.join(__dirname, '../public/thumbnails');
  const files = fs.readdirSync(thumbnailDir).filter(f => f.endsWith('.svg'));

  console.log('Converting SVG thumbnails to PNG...\n');

  for (const file of files) {
    const svgPath = path.join(thumbnailDir, file);
    const pngPath = path.join(thumbnailDir, file.replace('.svg', '.png'));

    try {
      await sharp(svgPath)
        .resize(200, 200)
        .png()
        .toFile(pngPath);

      console.log(`  Converted: ${file} -> ${file.replace('.svg', '.png')}`);
    } catch (error) {
      console.error(`  Error converting ${file}: ${error.message}`);
    }
  }

  console.log('\nDone!');
}

main();
