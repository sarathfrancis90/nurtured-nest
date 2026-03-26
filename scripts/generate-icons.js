const sharp = require('sharp');
const { imagesToIco } = require('png-to-ico');
const path = require('path');
const fs = require('fs');

const SOURCE_LOGO = path.resolve(__dirname, '../docs/design/Nurtured_Nest_Logo.png');
const SOURCE_NAME = path.resolve(__dirname, '../docs/design/Nurtured_Nest_Name_Font.png');
const OUTPUT_DIR = path.resolve(__dirname, '../public/icons');

const BRAND_COLORS = {
  surface: { r: 255, g: 251, b: 255, alpha: 1 },    // #fffbff
  white: { r: 255, g: 255, b: 255, alpha: 1 },
  primary: '#3e6a7e',
  themeColor: '#3e6a7e',
};

const ICON_SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

const MASKABLE_SIZES = [
  { name: 'android-chrome-maskable-192x192.png', size: 192 },
  { name: 'android-chrome-maskable-512x512.png', size: 512 },
];

async function main() {
  console.log('Generating brand icons...\n');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Step 1: Trim whitespace from logo
  console.log('1. Trimming logo whitespace...');
  const trimmed = await sharp(SOURCE_LOGO)
    .trim({ threshold: 20 })
    .toBuffer({ resolveWithObject: true });
  console.log(`   Trimmed: ${trimmed.info.width}x${trimmed.info.height}`);

  // Step 2: Create square canvas with 15% padding (standard icons)
  const maxDim = Math.max(trimmed.info.width, trimmed.info.height);
  const padding = Math.round(maxDim * 0.15);
  const canvasSize = maxDim + (padding * 2);

  console.log('2. Creating square canvas with 15% padding...');
  const squareLogo = await sharp(trimmed.data)
    .resize(canvasSize, canvasSize, {
      fit: 'contain',
      background: BRAND_COLORS.white,
    })
    .png()
    .toBuffer();
  console.log(`   Canvas: ${canvasSize}x${canvasSize}`);

  // Step 3: Create square canvas with 20% padding (maskable/adaptive icons)
  const maskablePadding = Math.round(maxDim * 0.25);
  const maskableCanvasSize = maxDim + (maskablePadding * 2);

  console.log('3. Creating maskable canvas with 25% padding...');
  const maskableLogo = await sharp(trimmed.data)
    .resize(maskableCanvasSize, maskableCanvasSize, {
      fit: 'contain',
      background: BRAND_COLORS.white,
    })
    .png()
    .toBuffer();

  // Step 4: Generate standard icon PNGs
  console.log('4. Generating standard icons...');
  for (const { name, size } of ICON_SIZES) {
    await sharp(squareLogo)
      .resize(size, size, { fit: 'contain', background: BRAND_COLORS.white })
      .png()
      .toFile(path.join(OUTPUT_DIR, name));
    console.log(`   ${name} (${size}x${size})`);
  }

  // Step 5: Generate maskable icon PNGs
  console.log('5. Generating maskable icons...');
  for (const { name, size } of MASKABLE_SIZES) {
    await sharp(maskableLogo)
      .resize(size, size, { fit: 'contain', background: BRAND_COLORS.white })
      .png()
      .toFile(path.join(OUTPUT_DIR, name));
    console.log(`   ${name} (${size}x${size})`);
  }

  // Step 6: Generate nav logo (40x40)
  console.log('6. Generating nav logo...');
  await sharp(squareLogo)
    .resize(40, 40, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'logo-nav.png'));
  console.log('   logo-nav.png (40x40)');

  // Also generate @2x version for retina
  await sharp(squareLogo)
    .resize(80, 80, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'logo-nav@2x.png'));
  console.log('   logo-nav@2x.png (80x80)');

  // Step 7: Generate favicon.ico (multi-size)
  console.log('7. Generating favicon.ico...');
  const icoImages = [];
  for (const size of [16, 32, 48]) {
    const { data, info } = await sharp(squareLogo)
      .resize(size, size)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    icoImages.push({ data, width: info.width, height: info.height });
  }
  const icoBuffer = imagesToIco(icoImages);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'favicon.ico'), icoBuffer);
  console.log('   favicon.ico (16/32/48)');

  // Step 8: Generate OG image (1200x630)
  console.log('8. Generating OG image...');
  await generateOGImage(squareLogo);
  console.log('   og-image.png (1200x630)');

  // Step 9: Generate site.webmanifest
  console.log('9. Generating site.webmanifest...');
  generateManifest();
  console.log('   site.webmanifest');

  // Clean up the 48x48 intermediate (not needed in final output)
  fs.unlinkSync(path.join(OUTPUT_DIR, 'favicon-48x48.png'));

  console.log('\nDone! All icons generated in public/icons/');
}

async function generateOGImage(squareLogo) {
  // Trim the brand name image
  const nameTrimmed = await sharp(SOURCE_NAME)
    .trim({ threshold: 20 })
    .toBuffer({ resolveWithObject: true });

  // Resize logo for OG (about 260px tall, centered in top portion)
  const logoForOG = await sharp(squareLogo)
    .resize(260, 260, { fit: 'contain', background: BRAND_COLORS.surface })
    .png()
    .toBuffer();

  // Resize brand name to fit width ~600px
  const nameWidth = 600;
  const nameScale = nameWidth / nameTrimmed.info.width;
  const nameHeight = Math.round(nameTrimmed.info.height * nameScale);
  const nameForOG = await sharp(nameTrimmed.data)
    .resize(nameWidth, nameHeight, { fit: 'contain', background: BRAND_COLORS.surface })
    .png()
    .toBuffer();

  // Create OG canvas and composite
  const ogWidth = 1200;
  const ogHeight = 630;
  const logoTop = 60;
  const logoLeft = Math.round((ogWidth - 260) / 2);
  const nameTop = logoTop + 260 + 30;
  const nameLeft = Math.round((ogWidth - nameWidth) / 2);

  await sharp({
    create: {
      width: ogWidth,
      height: ogHeight,
      channels: 4,
      background: BRAND_COLORS.surface,
    },
  })
    .composite([
      { input: logoForOG, top: logoTop, left: logoLeft },
      { input: nameForOG, top: nameTop, left: nameLeft },
    ])
    .png()
    .toFile(path.join(OUTPUT_DIR, 'og-image.png'));
}

function generateManifest() {
  const manifest = {
    name: 'Nurtured Nest',
    short_name: 'Nurtured Nest',
    description: 'Where birth feels safe. A curated sanctuary for birth support.',
    icons: [
      {
        src: '/icons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/android-chrome-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/android-chrome-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    theme_color: BRAND_COLORS.themeColor,
    background_color: '#fffbff',
    display: 'standalone',
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, '..', 'site.webmanifest'),
    JSON.stringify(manifest, null, 2) + '\n'
  );
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
