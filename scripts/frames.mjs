// Extract review frames from every video in photo/videos/ and build a
// numbered contact sheet per video.
//
// How frames are chosen (screen recordings need both rules):
//   1. Scene changes: ffmpeg's scene score > SCENE_T (a new page / view).
//   2. Fallback every 2s inside any stretch longer than GAP_S with no scene
//      change (slow scrolling or typing never triggers a "scene change").
//   Then near-duplicates are dropped by comparing tiny grayscale thumbnails.
//
// Output (NOT public, NOT committed — may contain sensitive data):
//   .work/frames/<video>/NNN.jpg + frames.json  (index → timestamp)
//   .work/contact-sheets/<video>[-pN].jpg
//
// Usage: node scripts/frames.mjs [videoName…]   (default: all videos)
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { contactSheet } from './lib/contact-sheet.mjs';

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, '..');
const VIDEOS = path.join(ROOT, 'photo/videos'); // read-only input
const WORK = path.join(ROOT, '.work');

const SCENE_T = 0.1; // scene-change threshold (0–1); tuned on these recordings
const MIN_GAP_S = 1.0; // ignore scene hits closer than this (transition bursts)
const GAP_S = 4.0; // a stretch longer than this gets interval frames…
const EVERY_S = 2.0; // …every 2 seconds
const DUP_DIFF = 2.0; // mean abs pixel diff (0–255) below which a frame is a duplicate

const fmt = (t) => {
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(1).padStart(4, '0');
  return `${m}:${s}`;
};

/** Pass 1: one cheap decode at 320px to get every frame's scene score. */
async function sceneScores(file) {
  const { stderr } = await run(
    'ffmpeg',
    ['-hide_banner', '-nostats', '-i', file, '-an', '-vf',
      "scale=320:-2,select='gte(scene,0)',metadata=print:key=lavfi.scene_score",
      '-f', 'null', '-'],
    { maxBuffer: 256 * 1024 * 1024 },
  );
  const out = [];
  let t = null;
  for (const line of stderr.split('\n')) {
    const pt = line.match(/pts_time:([\d.]+)/);
    if (pt) t = Number(pt[1]);
    const sc = line.match(/lavfi\.scene_score=([\d.]+)/);
    if (sc && t !== null) out.push({ t, score: Number(sc[1]) });
  }
  return out;
}

async function duration(file) {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-show_entries',
    'format=duration', '-of', 'default=nw=1:nk=1', file]);
  return Number(stdout.trim());
}

function pickTimes(scores, dur) {
  const picks = [{ t: 0, why: 'start' }];
  for (const { t, score } of scores) {
    // +0.15s: land just after the cut, once the new view has rendered
    if (score > SCENE_T && t - picks.at(-1).t >= MIN_GAP_S) {
      picks.push({ t: Math.min(t + 0.15, dur - 0.1), why: 'scene' });
    }
  }
  // fill long stretches without a scene change
  const bounds = [...picks.map((p) => p.t), dur];
  const filled = [];
  for (let i = 0; i < picks.length; i++) {
    filled.push(picks[i]);
    const a = bounds[i];
    const b = bounds[i + 1];
    if (b - a > GAP_S) {
      for (let t = a + EVERY_S; t < b - EVERY_S / 2; t += EVERY_S) {
        filled.push({ t, why: 'interval' });
      }
    }
  }
  return filled;
}

async function grabFrame(file, t, out) {
  // -ss before -i = fast seek; modern ffmpeg still decodes to the exact time.
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss',
    t.toFixed(3), '-i', file, '-frames:v', '1', '-q:v', '2', out]);
}

async function signature(file) {
  return sharp(file).resize(64, 32, { fit: 'fill' }).greyscale().raw().toBuffer();
}

function meanDiff(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s / a.length;
}

async function processVideo(name) {
  const file = path.join(VIDEOS, `${name}.mp4`);
  const dir = path.join(WORK, 'frames', name);
  const tmp = path.join(dir, '_tmp');
  await rm(dir, { recursive: true, force: true });
  await mkdir(tmp, { recursive: true });

  const dur = await duration(file);
  const scores = await sceneScores(file);
  const times = pickTimes(scores, dur);
  console.log(`${name}: ${fmt(dur)} long, ${times.length} candidate frames`);

  // grab candidates, then drop near-duplicates of the last kept frame
  const kept = [];
  let lastSig = null;
  let dropped = 0;
  for (let i = 0; i < times.length; i++) {
    const out = path.join(tmp, `${i}.jpg`);
    await grabFrame(file, times[i].t, out);
    const sig = await signature(out);
    if (lastSig && meanDiff(sig, lastSig) < DUP_DIFF) {
      dropped++;
      continue;
    }
    lastSig = sig;
    kept.push({ ...times[i], tmp: out });
  }

  const manifest = [];
  for (let i = 0; i < kept.length; i++) {
    const n = String(i + 1).padStart(3, '0');
    const final = path.join(dir, `${n}.jpg`);
    await sharp(kept[i].tmp).toFile(final); // copy (keeps quality)
    manifest.push({ index: i + 1, file: `${n}.jpg`, time: Number(kept[i].t.toFixed(3)), why: kept[i].why });
  }
  await rm(tmp, { recursive: true, force: true });
  await writeFile(path.join(dir, 'frames.json'), JSON.stringify({ video: `photo/videos/${name}.mp4`, duration: dur, frames: manifest }, null, 2));

  await mkdir(path.join(WORK, 'contact-sheets'), { recursive: true });
  const sheets = await contactSheet({
    title: `${name}.mp4 — ${manifest.length} frames — pick by number`,
    outBase: path.join(WORK, 'contact-sheets', name),
    items: manifest.map((f) => ({
      file: path.join(dir, f.file),
      label: `#${f.index}`,
      sub: fmt(f.time),
    })),
  });
  console.log(`  kept ${manifest.length}, dropped ${dropped} duplicates → ${sheets.map((s) => path.relative(ROOT, s)).join(', ')}`);
}

const wanted = process.argv.slice(2);
const all = (await readdir(VIDEOS)).filter((f) => f.endsWith('.mp4')).map((f) => f.replace(/\.mp4$/, ''));
for (const name of wanted.length ? wanted : all) await processVideo(name);
