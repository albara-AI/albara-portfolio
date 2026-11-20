// Tiny "extra glyphs" fonts: the @fontsource Latin subsets don't contain
// → ← (arrows) or ₂ (subscript two), so browsers drew them in a system
// fallback font. This asks Google Fonts for *only those glyphs* of each site
// font and saves the result as small self-hosted woff2 files (no runtime
// requests to Google). src/styles/glyphs.css maps them in with unicode-range.
//
// Run once (or after changing GLYPHS):  npm run glyphs
import { mkdir, writeFile } from 'node:fs/promises';

const GLYPHS = '←→₂';
const OUT = 'src/styles/fonts';
// (Instrument Serif has none of these glyphs — serif titles use a <sub>2</sub>.)
const FONTS = [
  { family: 'Inter', file: 'inter', axes: 'wght@400;500' },
  { family: 'JetBrains Mono', file: 'jetbrains-mono', axes: 'wght@400;500' },
];
// A modern browser user agent, so the API answers with woff2.
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

await mkdir(OUT, { recursive: true });
for (const f of FONTS) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f.family)}:${f.axes}&text=${encodeURIComponent(GLYPHS)}&display=swap`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${f.family}: Google Fonts answered ${res.status}`);
  const css = await res.text();
  const seen = new Set(); // one variable file can serve several weights
  const faces = css.split('@font-face').slice(1);
  if (!faces.length) throw new Error(`No @font-face for ${f.family}:\n${css}`);
  for (const face of faces) {
    const style = /font-style:\s*(\w+)/.exec(face)[1];
    const src = /url\(([^)]+)\)/.exec(face)[1];
    if (seen.has(src)) continue;
    seen.add(src);
    const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
    const name = `${f.file}-glyphs-${style}.woff2`;
    await writeFile(`${OUT}/${name}`, buf);
    console.log(`${name}  ${buf.length} B`);
  }
}
