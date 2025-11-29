const fs = require('fs');
const path = require('path');
const https = require('https');

const FONTS = [
  {
    name: 'GeistVF.woff2',
    url: 'https://assets.vercel.com/raw/upload/v1695234483/geist-sans/GeistVF.woff2',
    dir: 'geist-sans'
  },
  {
    name: 'GeistMonoVF.woff2',
    url: 'https://assets.vercel.com/raw/upload/v1695234483/geist-mono/GeistMonoVF.woff2',
    dir: 'geist-sans'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function downloadFonts() {
  const fontsDir = path.join(__dirname, '../fonts');
  
  for (const font of FONTS) {
    const dir = path.join(fontsDir, font.dir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const dest = path.join(dir, font.name);
    
    // Skip if already exists
    if (fs.existsSync(dest)) {
      console.log(`✓ ${font.name} already exists`);
      continue;
    }
    
    console.log(`Downloading ${font.name}...`);
    await downloadFile(font.url, dest);
    console.log(`✓ Downloaded ${font.name}`);
  }
  
  // Create license file
  const licensePath = path.join(fontsDir, 'LICENSE.txt');
  if (!fs.existsSync(licensePath)) {
    fs.writeFileSync(licensePath, `Copyright 2023 Vercel, Inc.

This Font Software is licensed under the SIL Open Font License, Version 1.1.

Full license: https://github.com/vercel/geist-font/blob/main/LICENSE.txt
`);
  }
  
  console.log('✅ All fonts ready');
}

downloadFonts().catch(console.error);
