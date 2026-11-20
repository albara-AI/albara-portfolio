// Asset pipeline entry point (`npm run assets`).
// Checks the tools, then runs the pipeline steps in order.
import { execFileSync } from 'node:child_process';

let ok = true;

try {
  const v = execFileSync('ffmpeg', ['-version']).toString().split('\n')[0];
  console.log(`✓ ffmpeg — ${v}`);
} catch {
  ok = false;
  console.error('✗ ffmpeg not found. Install: sudo apt install ffmpeg');
}

try {
  const sharp = (await import('sharp')).default;
  console.log(`✓ sharp — libvips ${sharp.versions.vips}`);
} catch {
  ok = false;
  console.error('✗ sharp not installed. Run: npm install');
}

if (!ok) {
  console.log('\nFix the tools above first.');
  process.exit(1);
}

// 1–2 review: frames + contact sheets into .work/ (never public)
// 3 generate result images from README/CV data
// 4 export only what scripts/approved.json lists → public/media + assets.json
const steps = ['frames.mjs', 'sheets.mjs', 'results.mjs', 'export.mjs'];
for (const s of steps) {
  console.log(`\n→ ${s}`);
  execFileSync(process.execPath, [new URL(s, import.meta.url).pathname], { stdio: 'inherit' });
}
