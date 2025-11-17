import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const iconSvg = path.join(publicDir, 'icon.svg');

// Icon sizes to generate
const icons = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function generateIcons() {
  console.log('🎨 Generating Umbrella branding assets...\n');

  // Read the SVG file
  const svgBuffer = fs.readFileSync(iconSvg);

  // Generate each PNG size
  for (const icon of icons) {
    const outputPath = path.join(publicDir, icon.name);
    await sharp(svgBuffer)
      .resize(icon.size, icon.size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated ${icon.name} (${icon.size}x${icon.size})`);
  }

  // Generate favicon.ico (using 32x32 as the main size, with 16x16 and 48x48)
  const faviconSizes = [16, 32, 48];
  const faviconBuffers = await Promise.all(
    faviconSizes.map(size =>
      sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );

  // For ICO, we'll create a 32x32 PNG and save it as .ico
  // (Most modern browsers support PNG in ICO format)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('✓ Generated favicon.ico');

  console.log('\n✅ All branding assets generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
