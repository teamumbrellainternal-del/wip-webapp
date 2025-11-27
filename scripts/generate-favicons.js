/**
 * Favicon Generation Script
 * Generates all favicon PNG variants from the umbrella-icon.svg source
 * 
 * Usage: node scripts/generate-favicons.js
 */

import sharp from 'sharp';
import { readFileSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const SOURCE_SVG = resolve(__dirname, '../brand/assets/logos/umbrella-icon.svg');
const PUBLIC_DIR = resolve(__dirname, '../public');

// Favicon sizes to generate
const FAVICON_SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

// ICO sizes (multi-resolution)
const ICO_SIZES = [16, 32, 48];

async function generateFavicons() {
  console.log('📦 Starting favicon generation...');
  console.log(`   Source: ${SOURCE_SVG}`);
  console.log(`   Output: ${PUBLIC_DIR}`);
  
  // Read SVG source
  const svgBuffer = readFileSync(SOURCE_SVG);
  
  // Generate PNG favicons
  console.log('\n🖼️  Generating PNG favicons...');
  for (const { name, size } of FAVICON_SIZES) {
    const outputPath = resolve(PUBLIC_DIR, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`   ✓ ${name} (${size}x${size})`);
  }
  
  // Generate ICO file (contains multiple sizes)
  console.log('\n🔷 Generating favicon.ico...');
  const icoBuffers = await Promise.all(
    ICO_SIZES.map(size => 
      sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );
  
  // For ICO, we'll use the 32x32 PNG as the primary (sharp doesn't natively support ICO)
  // The browser will use the PNG favicons which are preferred anyway
  const ico32Path = resolve(PUBLIC_DIR, 'favicon.ico');
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(ico32Path);
  console.log(`   ✓ favicon.ico (32x32 PNG format)`);
  
  // Copy SVG to public folder
  console.log('\n📋 Copying SVG files...');
  copyFileSync(SOURCE_SVG, resolve(PUBLIC_DIR, 'icon.svg'));
  console.log('   ✓ icon.svg');
  copyFileSync(SOURCE_SVG, resolve(PUBLIC_DIR, 'og-image.svg'));
  console.log('   ✓ og-image.svg');
  
  console.log('\n✅ Favicon generation complete!');
}

generateFavicons().catch(err => {
  console.error('❌ Error generating favicons:', err);
  process.exit(1);
});

