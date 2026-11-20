// Numbered contact sheets for the still images in photo/ (about photos,
// project images, Fashion-MNIST plots) — for the sensitive-data review.
// Output: .work/contact-sheets/stills-<group>.jpg  (not public, not committed)
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { contactSheet } from './lib/contact-sheet.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PHOTO = path.join(ROOT, 'photo'); // read-only input
const OUT = path.join(ROOT, '.work/contact-sheets');
const IMG = /\.(png|jpe?g|webp)$/i;

// Each group: a folder inside photo/ (non-recursive). The Fashion-MNIST
// project keeps its real folder name; its .git folder is never read.
const groups = [
  { name: 'about', dirs: ['about'], tileH: 330, tileW: 264, cols: 5 },
  { name: 'projects', dirs: ['projects'], tileH: 248, tileW: 440, cols: 4 },
  {
    name: 'fashion-mnist',
    dirs: ['projects/ssl_fashion_mnist_best', 'projects/ssl_fashion_mnist_best/plots'],
    tileH: 248,
    tileW: 440,
    cols: 4,
  },
];

await mkdir(OUT, { recursive: true });
for (const g of groups) {
  const files = [];
  for (const d of g.dirs) {
    const entries = (await readdir(path.join(PHOTO, d))).filter((f) => IMG.test(f)).sort();
    files.push(...entries.map((f) => path.join(PHOTO, d, f)));
  }
  const items = [];
  for (const [i, file] of files.entries()) {
    const m = await sharp(file).metadata();
    items.push({
      file,
      label: `#${i + 1} ${path.basename(file).slice(0, 26)}`,
      sub: `${m.width}×${m.height}`,
    });
  }
  const written = await contactSheet({
    title: `photo/${g.dirs[0]} — ${items.length} images — pick by number`,
    outBase: path.join(OUT, `stills-${g.name}`),
    items,
    cols: g.cols,
    tileW: g.tileW,
    tileH: g.tileH,
  });
  console.log(`${g.name}: ${items.length} → ${written.map((w) => path.relative(ROOT, w)).join(', ')}`);
}
