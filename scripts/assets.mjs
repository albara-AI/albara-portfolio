// Asset pipeline entry point (`npm run assets`).
// Phase 0: only checks that the tools exist. Phase 1 adds frame
// extraction, contact sheets and compression steps here.
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

console.log(ok ? '\nTools ready. No asset steps yet (added in Phase 1).' : '\nFix the tools above first.');
process.exit(ok ? 0 : 1);
