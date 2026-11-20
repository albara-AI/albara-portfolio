// Brand images, drawn in the site's own fonts and colours:
//   public/og.png            1200×630 link preview (WhatsApp, LinkedIn, Slack…)
//   public/favicon.svg       browser tab icon
//   public/favicon.ico       32px fallback (older browsers, crawlers)
//   public/apple-touch-icon.png  180px (iPhone home screen)
//
// Text comes from src/content.ts (loaded through Vite). Letters are turned into
// vector outlines with opentype.js, because image renderers can't load web
// fonts — this way the images really use Instrument Serif / Inter / JetBrains.
//
// Run after changing the name, role or colours:  npm run brand
import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
const font = (pkg, file) => opentype.loadSync(require.resolve(`@fontsource/${pkg}/files/${file}`));
const serif = font('instrument-serif', 'instrument-serif-latin-400-normal.woff');
const serifItalic = font('instrument-serif', 'instrument-serif-latin-400-italic.woff');
const inter = font('inter', 'inter-latin-500-normal.woff');
const mono = font('jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff');

// Colours = src/styles/tokens.css
const C = { paper: '#f2f0eb', ink: '#1a1a2e', ink2: '#4a4a5e', muted: '#68655d', accent: '#6ec8c8', accentInk: '#2e8f8f', line: 'rgba(26,26,46,0.15)' };

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const { identity, hero } = await vite.ssrLoadModule('/src/content.ts');
await vite.close();

/** Text → SVG path data. `tracking` is extra space per letter in em (like CSS letter-spacing). */
function text(f, str, x, y, size, { tracking = 0, align = 'left' } = {}) {
  const glyphs = f.stringToGlyphs(str);
  const scale = size / f.unitsPerEm;
  let width = 0;
  glyphs.forEach((g, i) => {
    width += g.advanceWidth * scale + (i < glyphs.length - 1 ? tracking * size : 0);
    if (i < glyphs.length - 1) width += f.getKerningValue(g, glyphs[i + 1]) * scale;
  });
  let cx = align === 'right' ? x - width : align === 'center' ? x - width / 2 : x;
  let d = '';
  glyphs.forEach((g, i) => {
    d += g.getPath(cx, y, size).toPathData(2);
    cx += g.advanceWidth * scale + tracking * size;
    if (i < glyphs.length - 1) cx += f.getKerningValue(g, glyphs[i + 1]) * scale;
  });
  return { d, width };
}

// ---------- OG image (mirrors the hero: label, name, role, place) ----------
{
  const W = 1200;
  const H = 630;
  const X = 88;
  const label = text(mono, hero.label.toUpperCase(), X + 72, 120, 20, { tracking: 0.14 });
  const first = text(serif, identity.firstName, X - 6, 276, 168, { tracking: -0.02 });
  const last = text(serifItalic, identity.lastName, X - 6, 416, 168, { tracking: -0.02 });
  const role = text(inter, hero.role, X, 528, 32);
  const place = text(mono, hero.place.toUpperCase(), X, 596, 18, { tracking: 0.14 });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${C.paper}"/>
    <rect width="${W}" height="6" fill="${C.accent}"/>
    <rect x="${X}" y="111" width="52" height="1.5" fill="${C.muted}"/>
    <path d="${label.d}" fill="${C.muted}"/>
    <path d="${first.d}" fill="${C.ink}"/>
    <path d="${last.d}" fill="${C.accentInk}"/>
    <path d="${role.d}" fill="${C.ink2}"/>
    <rect x="${X}" y="562" width="${W - 2 * X}" height="1" fill="${C.line}"/>
    <path d="${place.d}" fill="${C.muted}"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/og.png');
  console.log('public/og.png  1200×630');
}

// ---------- Favicon: italic "A" (first initial) on ink ----------
const iconSvg = (size) => {
  const a = text(serifItalic, identity.firstName[0], size * 0.47, size * 0.76, size * 0.86, { align: 'center' });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${C.ink}"/>
  <path d="${a.d}" fill="${C.accent}"/>
</svg>`;
};
await writeFile('public/favicon.svg', iconSvg(64));
await sharp(Buffer.from(iconSvg(180))).png().toFile('public/apple-touch-icon.png');

// favicon.ico = a tiny ICO header wrapped around a 32px PNG (allowed by the format).
const png32 = await sharp(Buffer.from(iconSvg(32))).png().toBuffer();
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); // reserved
ico.writeUInt16LE(1, 2); // type: icon
ico.writeUInt16LE(1, 4); // 1 image
ico.writeUInt8(32, 6); // width
ico.writeUInt8(32, 7); // height
ico.writeUInt16LE(1, 10); // colour planes
ico.writeUInt16LE(32, 12); // bits per pixel
ico.writeUInt32LE(png32.length, 14); // image size
ico.writeUInt32LE(22, 18); // image offset
await writeFile('public/favicon.ico', Buffer.concat([ico, png32]));
console.log('public/favicon.svg, favicon.ico, apple-touch-icon.png');
