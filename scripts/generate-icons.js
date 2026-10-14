import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generate() {
  const svgPath = path.resolve('public', 'icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve('public', 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve('public', 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // 512x512 maskable (with 10% padding safe zone)
  const paddedSvg = await sharp(svgBuffer)
    .resize(410, 410)
    .toBuffer();
    
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: '#d32f2f'
    }
  })
    .composite([{ input: paddedSvg, top: 51, left: 51 }])
    .png()
    .toFile(path.resolve('public', 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');

  // 180x180 apple touch icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve('public', 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');
}

generate().catch(console.error);
