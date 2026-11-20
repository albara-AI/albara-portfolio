// Export approved assets (scripts/approved.json) into public/media and
// write public/media/assets.json.
//
//   images → WebP q78 in three sizes: 1600 (full), 800 (card), 400 (thumb)
//   loops  → muted H.264 .mp4 + VP9 .webm (≤1.5 MB each) + WebP poster
//   pending loops → .work/pending/ only (NOT public) until approved
//
// Usage: node scripts/export.mjs
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public/media');
const TMP = path.join(ROOT, '.work/export-tmp');
const PENDING = path.join(ROOT, '.work/pending');
const approved = JSON.parse(await readFile(path.join(ROOT, 'scripts/approved.json'), 'utf8'));
const GENERATED = path.join(ROOT, '.work/generated'); // from scripts/results.mjs

const SIZES = { full: 1600, card: 800, thumb: 400 };
const Q = 78;
const LOOP_MAX = 1.5 * 1024 * 1024;
const IMG_MAX = 250 * 1024;

const rel = (p) => '/' + path.relative(path.join(ROOT, 'public'), p).split(path.sep).join('/');
const kb = (n) => `${Math.round(n / 1024)} KB`;
const warnings = [];

/** One source image → id.webp (1600), id-800.webp, id-400.webp. Never upscales. */
async function exportImage(id, input, crop) {
  let base = sharp(input).rotate();
  if (crop) base = base.extract(crop);
  const buf = await base.toBuffer();
  const out = {};
  for (const [name, px] of Object.entries(SIZES)) {
    const file = path.join(OUT, name === 'full' ? `${id}.webp` : `${id}-${px}.webp`);
    const info = await sharp(buf)
      .resize(px, px, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: Q, effort: 6 })
      .toFile(file);
    if (info.size > IMG_MAX) warnings.push(`${path.basename(file)} is ${kb(info.size)} (> 250 KB)`);
    out[name] = { path: rel(file), width: info.width, height: info.height };
  }
  return out;
}

async function grab(video, t, file) {
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(t),
    '-i', path.join(ROOT, 'photo/videos', `${video}.mp4`), '-frames:v', '1', file]);
}

/** Cut (and splice) segments → mp4 + webm, shrinking until each fits the budget. */
async function exportLoop(loop, dir) {
  const src = path.join(ROOT, 'photo/videos', `${loop.video}.mp4`);
  const n = loop.segments.length;
  const trims = loop.segments
    .map(([a, b], i) => `[0:v]trim=start=${a}:end=${b},setpts=PTS-STARTPTS,fps=24,scale=960:-2:flags=lanczos[s${i}]`)
    .join(';');
  const filter = `${trims};${loop.segments.map((_, i) => `[s${i}]`).join('')}concat=n=${n}:v=1:a=0,format=yuv420p[v]`;
  const outs = {};
  for (const [ext, args] of [
    ['mp4', (crf) => ['-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-movflags', '+faststart', '-profile:v', 'high']],
    ['webm', (crf) => ['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(crf + 12), '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2']],
  ]) {
    const file = path.join(dir, `${loop.id}.${ext}`);
    for (let crf = 28; crf <= 40; crf += 3) {
      await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', src,
        '-filter_complex', filter, '-map', '[v]', '-an', ...args(crf), file], { maxBuffer: 64 << 20 });
      if ((await stat(file)).size <= LOOP_MAX) break;
    }
    const size = (await stat(file)).size;
    if (size > LOOP_MAX) warnings.push(`${loop.id}.${ext} is ${kb(size)} (> 1.5 MB)`);
    outs[ext] = { path: rel(file), bytes: size };
  }
  const { stdout } = await run('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height:format=duration', '-of', 'json', path.join(dir, `${loop.id}.mp4`)]);
  const probe = JSON.parse(stdout);
  return { ...outs, width: probe.streams[0].width, height: probe.streams[0].height, duration: Number(Number(probe.format.duration).toFixed(2)) };
}

await rm(TMP, { recursive: true, force: true });
await mkdir(TMP, { recursive: true });
await mkdir(OUT, { recursive: true });
const assets = [];

for (const f of approved.frames) {
  const png = path.join(TMP, `${f.id}.png`);
  await grab(f.video, f.time, png); // lossless grab, then WebP
  const s = await exportImage(f.id, png);
  assets.push({ id: f.id, project: f.project, type: 'frame', source: `${f.video}.mp4 @ ${f.time}s (sheet #${f.sheet})`, path: s.full.path, card: s.card.path, thumb: s.thumb.path, poster: null, width: s.full.width, height: s.full.height });
}

for (const s of approved.stills) {
  const r = await exportImage(s.id, path.join(ROOT, s.src), s.crop);
  assets.push({ id: s.id, project: s.project, type: 'image', source: s.src, path: r.full.path, card: r.card.path, thumb: r.thumb.path, poster: null, width: r.full.width, height: r.full.height });
}

for (const loop of approved.loops) {
  const posterPng = path.join(TMP, `${loop.id}-poster.png`);
  await grab(loop.video, loop.posterTime, posterPng);
  const poster = await exportImage(`${loop.id}-poster`, posterPng);
  const v = await exportLoop(loop, OUT);
  assets.push({ id: loop.id, project: loop.project, type: 'loop', source: `${loop.video}.mp4 ${loop.segments.map(([a, b]) => `${a}–${b}s`).join(' + ')}`, path: v.mp4.path, webm: v.webm.path, poster: poster.card.path, posterFull: poster.full.path, width: v.width, height: v.height, duration: v.duration, bytes: { mp4: v.mp4.bytes, webm: v.webm.bytes } });
}

// Pending loops: encoded for review only, never into public/.
await mkdir(PENDING, { recursive: true });
for (const loop of approved.pendingLoops ?? []) {
  const v = await exportLoop(loop, PENDING);
  console.log(`pending (not public): ${loop.id} ${v.duration}s mp4 ${kb(v.mp4.bytes)} webm ${kb(v.webm.bytes)} → .work/pending/`);
}

// Generated result images (scripts/results.mjs — README/CV data only).
let generated = [];
try {
  generated = JSON.parse(await readFile(path.join(GENERATED, 'index.json'), 'utf8'));
} catch {
  console.log('no generated images yet — run scripts/results.mjs first');
}
for (const g of generated) {
  const r = await exportImage(g.id, path.join(GENERATED, `${g.id}.png`));
  assets.push({ id: g.id, project: g.project, type: 'generated', source: g.source, path: r.full.path, card: r.card.path, thumb: r.thumb.path, poster: null, width: r.full.width, height: r.full.height });
}

// Remove files from earlier runs that are no longer in the manifest
// (e.g. a dropped loop), so public/ only ever holds approved assets.
const keep = new Set(['assets.json', '.gitkeep']);
for (const a of assets) for (const k of ['path', 'card', 'thumb', 'poster', 'posterFull', 'webm']) if (a[k]) keep.add(path.basename(a[k]));
for (const f of await readdir(OUT)) {
  if (!keep.has(f)) { await rm(path.join(OUT, f)); console.log(`removed stale public/media/${f}`); }
}

await writeFile(path.join(OUT, 'assets.json'), JSON.stringify({ generated: 'scripts/export.mjs', assets }, null, 2) + '\n');
await rm(TMP, { recursive: true, force: true });

console.log(`exported ${assets.length} assets → public/media/assets.json`);
for (const a of assets.filter((x) => x.type === 'loop')) console.log(`  ${a.id}: ${a.duration}s ${a.width}×${a.height} mp4 ${kb(a.bytes.mp4)} webm ${kb(a.bytes.webm)}`);
console.log(warnings.length ? `\n⚠ ${warnings.join('\n⚠ ')}` : '\nAll files within budget.');
