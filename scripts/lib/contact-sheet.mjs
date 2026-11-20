// Builds numbered contact sheets (a grid of thumbnails with labels) using sharp.
// Used for the sensitive-data review: Albara picks frames/images by number.
import sharp from 'sharp';

const BG = '#E8E5DD'; // --paper-2
const INK = '#1A1A2E';
const MUTED = '#4A4A5E';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * @param {object} opts
 * @param {{ file: string, label: string, sub?: string }[]} opts.items
 * @param {string} opts.title  heading printed at the top of every page
 * @param {string} opts.outBase  output path without extension; pages get -p1, -p2…
 * @param {number} [opts.cols=4]
 * @param {number} [opts.tileW=440]
 * @param {number} [opts.tileH=248]  image box; images are fitted (contain), never cropped
 * @param {number} [opts.perPage=24]
 * @returns {Promise<string[]>} written file paths
 */
export async function contactSheet({
  items,
  title,
  outBase,
  cols = 4,
  tileW = 440,
  tileH = 248,
  perPage = 24,
}) {
  const gap = 16;
  const labelH = 44;
  const headH = 64;
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const written = [];

  for (let p = 0; p < pages; p++) {
    const pageItems = items.slice(p * perPage, (p + 1) * perPage);
    const rows = Math.ceil(pageItems.length / cols);
    const W = cols * tileW + (cols + 1) * gap;
    const H = headH + rows * (tileH + labelH) + (rows + 1) * gap;

    const composites = [];
    const pageLabel = pages > 1 ? `  ·  page ${p + 1}/${pages}` : '';
    composites.push({
      input: Buffer.from(
        `<svg width="${W}" height="${headH}" xmlns="http://www.w3.org/2000/svg">
          <text x="${gap}" y="40" font-family="DejaVu Sans Mono, monospace" font-size="22" fill="${INK}">${esc(title + pageLabel)}</text>
        </svg>`,
      ),
      top: 0,
      left: 0,
    });

    for (let i = 0; i < pageItems.length; i++) {
      const it = pageItems[i];
      const c = i % cols;
      const r = Math.floor(i / cols);
      const left = gap + c * (tileW + gap);
      const top = headH + gap + r * (tileH + labelH + gap);

      const thumb = await sharp(it.file)
        .rotate() // respect EXIF orientation
        .resize(tileW, tileH, { fit: 'contain', background: '#FFFFFF' })
        .toBuffer();
      composites.push({ input: thumb, top, left });

      composites.push({
        input: Buffer.from(
          `<svg width="${tileW}" height="${labelH}" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="26" font-family="DejaVu Sans Mono, monospace" font-size="20" font-weight="bold" fill="${INK}">${esc(it.label)}</text>
            <text x="${tileW}" y="26" text-anchor="end" font-family="DejaVu Sans Mono, monospace" font-size="15" fill="${MUTED}">${esc(it.sub ?? '')}</text>
          </svg>`,
        ),
        top: top + tileH,
        left,
      });
    }

    const out = pages > 1 ? `${outBase}-p${p + 1}.jpg` : `${outBase}.jpg`;
    await sharp({ create: { width: W, height: H, channels: 3, background: BG } })
      .composite(composites)
      .jpeg({ quality: 82 })
      .toFile(out);
    written.push(out);
  }
  return written;
}
