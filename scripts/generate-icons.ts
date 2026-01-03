import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');

// Theme color from manifest
const THEME_COLOR = '#10b981';
const TEXT_COLOR = '#ffffff';

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple SVG icon with "CF" text (Cash Flow)
function createIconSvg(size: number): string {
  const fontSize = Math.round(size * 0.4);
  const cornerRadius = Math.round(size * 0.15);

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}" fill="${THEME_COLOR}"/>
      <text
        x="50%"
        y="55%"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${fontSize}"
        font-weight="700"
        fill="${TEXT_COLOR}"
        text-anchor="middle"
        dominant-baseline="middle"
      >CF</text>
    </svg>
  `;
}

async function generateIcons() {
  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  console.log('Generating PWA icons...');

  for (const size of sizes) {
    const svg = createIconSvg(size);
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svg)).png().toFile(outputPath);

    console.log(`  ✓ Generated icon-${size}x${size}.png`);
  }

  // Generate Apple Touch Icon (180x180)
  const appleTouchSvg = createIconSvg(180);
  await sharp(Buffer.from(appleTouchSvg))
    .png()
    .toFile(path.join(ICONS_DIR, 'apple-touch-icon.png'));
  console.log('  ✓ Generated apple-touch-icon.png');

  // Generate favicon (32x32)
  const faviconSvg = createIconSvg(32);
  await sharp(Buffer.from(faviconSvg))
    .png()
    .toFile(path.join(ICONS_DIR, 'favicon-32x32.png'));
  console.log('  ✓ Generated favicon-32x32.png');

  // Generate favicon-16x16
  const favicon16Svg = createIconSvg(16);
  await sharp(Buffer.from(favicon16Svg))
    .png()
    .toFile(path.join(ICONS_DIR, 'favicon-16x16.png'));
  console.log('  ✓ Generated favicon-16x16.png');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
