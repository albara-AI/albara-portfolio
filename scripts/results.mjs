// Generate result/pipeline images (1600×1200) in one shared style.
// The AL-BAYAN# and Mini-RAG images recreate Albara's originals in
// photo/projects/ exactly, minus the "02 —"/"03 —" label numbers.
// Every word and number below comes from the project's README or the CV —
// the `source` line on each image says which.
//
// Output: .work/generated/<id>.png  (export.mjs turns them into WebP)
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, '.work/generated');
const W = 1600;
const H = 1200;
const C = {
  paper: '#F2F0EB', card: '#E8E5DD', ink: '#1A1A2E', muted: '#8A877E',
  accent: '#2E8F8F', line: '#1A1A2E',
};
const SERIF = 'DejaVu Serif, serif';
const SANS = 'DejaVu Sans, sans-serif';
const MONO = 'DejaVu Sans Mono, monospace';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const text = (x, y, s, { size = 22, font = SANS, fill = C.ink, anchor = 'start', weight = 400 } = {}) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`;
const lines = (x, y, arr, opts = {}, lh = 34) => arr.map((s, i) => text(x, y + i * lh, s, opts)).join('');

/** Filled "IN PROGRESS" pill, top-right — on every Mini-RAG image. */
const BADGE = `<rect x="1284" y="50" width="220" height="48" rx="24" fill="${C.ink}"/>
  <circle cx="1314" cy="74" r="7" fill="#6EC8C8"/>
  ${text(1334, 81, 'IN PROGRESS', { size: 20, font: MONO, fill: '#F2F0EB' })}`;

function frame({ label, title, subtitle, source, badge = false }, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="100%" height="100%" fill="${C.paper}"/>
    ${text(96, 84, label, { size: 20, font: MONO, fill: C.muted })}
    ${badge ? BADGE : ''}
    ${text(96, 180, title, { size: 64, font: SERIF })}
    ${text(96, 234, subtitle, { size: 24, fill: C.muted })}
    ${body}
    ${text(96, 1152, source, { size: 17, font: MONO, fill: C.muted })}
  </svg>`;
}

/** Step card like minirag-pipeline.png. kind: done | accent | plain */
function card(x, y, w, h, { head, body = [], note = '', kind = 'done' }) {
  const fill = kind === 'accent' ? C.accent : C.card;
  const fg = kind === 'accent' ? '#FFFFFF' : C.ink;
  const sub = kind === 'accent' ? '#E6F4F4' : C.ink;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${fill}"/>
    ${text(x + 30, y + 64, head, { size: 28, font: MONO, fill: fg })}
    ${note ? text(x + w - 30, y + 64, note, { size: 20, font: SANS, fill: kind === 'accent' ? '#E6F4F4' : C.accent, anchor: 'end' }) : ''}
    ${lines(x + 30, y + 130, body, { size: 21, fill: sub }, 32)}`;
}

const arrow = (x1, y, x2) =>
  `<line x1="${x1}" y1="${y}" x2="${x2 - 10}" y2="${y}" stroke="${C.muted}" stroke-width="2"/>
   <path d="M ${x2 - 12} ${y - 7} L ${x2} ${y} L ${x2 - 12} ${y + 7} Z" fill="${C.muted}"/>`;

/** 3-column grid of cards with arrows between them. rows: [[card,card,card], …] */
function grid(rows, top = 300, h = 240, gapY = 90) {
  const w = 430;
  const xs = [100, 600, 1100];
  let out = '';
  rows.forEach((row, r) => {
    const y = top + r * (h + gapY);
    row.forEach((c, i) => {
      out += card(xs[i], y, w, h, c);
      if (i < row.length - 1) out += arrow(xs[i] + w + 8, y + h / 2, xs[i + 1] - 8);
    });
  });
  return out;
}


/** Horizontal bar chart, same geometry as albayan-results-1/2.png. */
function bars(rows, scale) {
  return rows
    .map((r, i) => {
      const y = 347 + i * 124.4;
      const w = Math.round(r.value * scale);
      const light = r.fill === C.accent;
      return `<rect x="96" y="${y}" width="${w}" height="76" fill="${r.fill}"/>` +
        text(r.labelX ?? 109, y + 45, r.label, { size: 23, fill: light ? '#FFFFFF' : C.ink }) +
        text(96 + w + 13, y + 49, r.valueText, { size: 32, font: SERIF, fill: r.valueFill ?? C.ink }) +
        (r.pr ? text(96 + w + 13 + r.valueText.length * 19.5 + 38, y + 45, r.pr, { size: 18, font: MONO, fill: C.muted }) : '');
    })
    .join('');
}

/** Step cards as in albayan-pipeline.png: muted mono file name + one line. */
function steps(rows) {
  const xs = [100, 600, 1100];
  return rows
    .map((row, r) =>
      row
        .map((c, i) => {
          const x = xs[i];
          const y = 260 + r * 340;
          const on = c.accent;
          return `<rect x="${x}" y="${y}" width="430" height="240" rx="22" fill="${on ? C.accent : C.card}"/>` +
            text(x + 30, y + 65, c.head, { size: 21, font: MONO, fill: on ? '#FFFFFF' : C.muted }) +
            text(x + 30, y + 165, c.body, { size: 24, fill: on ? '#FFFFFF' : C.ink });
        })
        .join(''),
    )
    .join('');
}

/** minirag-pipeline.png style: solid cards = built (✓), dashed = next. */
function ragCards(rows) {
  const xs = [100, 600, 1100];
  return rows
    .map((row, r) =>
      row
        .map((c, i) => {
          const x = xs[i];
          const y = 260 + r * 340;
          const box = c.next
            ? `<rect x="${x}" y="${y}" width="430" height="240" rx="22" fill="none" stroke="${C.ink}" stroke-width="2" stroke-dasharray="7 5"/>`
            : `<rect x="${x}" y="${y}" width="430" height="240" rx="22" fill="${C.card}"/>`;
          return box +
            text(x + 30, y + 66, c.head, { size: 27, font: MONO }) +
            text(x + 390, y + 66, c.next ? 'next' : '✓', { size: 22, fill: c.next ? C.muted : C.accent, anchor: 'end' }) +
            text(x + 30, y + 156, c.body, { size: 22, fill: c.next ? C.muted : C.ink });
        })
        .join(''),
    )
    .join('');
}

/** Dark code panel with light syntax colouring. Lines are copied verbatim from the repo. */
function code(x, y, w, file, src) {
  const KW = /\b(async|await|with|as|while|return|def|class|if|import|from)\b/g;
  const lineH = 38;
  const rows = src.split('\n');
  const h = 86 + rows.length * lineH;
  const body = rows
    .map((ln, i) => {
      const parts = esc(ln)
        .replace(/(&quot;|")(.*?)("|&quot;)/g, '<tspan fill="#6EC8C8">"$2"</tspan>')
        .replace(KW, '<tspan fill="#E3B9A0">$1</tspan>');
      return `<text x="${x + 36}" y="${y + 92 + i * lineH}" font-family="${MONO}" font-size="22" fill="#F2F0EB" xml:space="preserve">${parts}</text>`;
    })
    .join('');
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${C.ink}"/>` +
    text(x + 36, y + 46, file, { size: 18, font: MONO, fill: '#8A877E' }) + body;
}

const images = [
  // ---- AL-BAYAN# (recreated from photo/projects/, label numbers removed) ----
  {
    id: 'albayan-pipeline',
    project: 'albayan',
    meta: {
      label: 'AL-BAYAN#  ·  ARCHITECTURE',
      title: 'The pipeline',
      subtitle: 'PDF → OCR → Arabic NLP → multi-label classification → tags',
      source: 'Source: github.com/albara-AI/arabic-legal-classifier — README',
    },
    body: () =>
      steps([
        [
          { head: '01_fetch', body: 'Scrape Gazette PDFs' },
          { head: '02_ocr', body: 'Tesseract OCR · 300 DPI' },
          { head: '03_augment', body: 'EDA + AraBERT MLM' },
        ],
        [
          { head: '04_train', body: 'AraBERT · MARBERT · CaMeLBERT' },
          { head: '05_ensemble', body: 'Average probs → F1 0.769', accent: true },
          { head: '07_generate', body: 'AraT5 + BiEncoder + RAG' },
        ],
      ]),
  },
  {
    id: 'albayan-results-1',
    project: 'albayan',
    meta: {
      label: 'AL-BAYAN#  ·  RESULTS',
      title: 'F1-Macro, stage by stage',
      subtitle: 'From a 0.558 baseline to a 0.769 three-model ensemble (+38%)',
      source: 'Source: github.com/albara-AI/arabic-legal-classifier — README',
    },
    body: () =>
      bars(
        [
          { label: 'TF-IDF + LogReg (baseline)', value: 0.558, valueText: '0.558', fill: '#D3CFC4' },
          { label: 'AraBERT — global threshold', value: 0.648, valueText: '0.648', fill: '#B9C9C9' },
          { label: 'AraBERT — per-label threshold', value: 0.644, valueText: '0.644', fill: '#B9C9C9' },
          { label: 'AraBERT + Hard Negative Mining', value: 0.682, valueText: '0.682', fill: '#B9C9C9' },
          { label: 'CaMeLBERT + HNM (best single)', value: 0.695, valueText: '0.695', fill: '#B9C9C9' },
          { label: 'Ensemble × 3', value: 0.769, valueText: '0.769', fill: C.accent, valueFill: C.accent },
        ],
        1638,
      ),
  },
  {
    id: 'albayan-results-2',
    project: 'albayan',
    meta: {
      label: 'AL-BAYAN#  ·  SECTORS',
      title: 'Per-sector performance',
      subtitle: 'Best ensemble — strongest and weakest sectors out of 17',
      source: 'Source: github.com/albara-AI/arabic-legal-classifier — README',
    },
    body: () =>
      bars(
        [
          ['Security & Defense', 0.973, 'P 1.00 · R 0.95'],
          ['Tourism', 0.941, 'P 1.00 · R 0.89'],
          ['Land', 0.909, 'P 1.00 · R 0.83'],
          ['Education', 0.906, 'P 0.96 · R 0.86'],
          ['Legislation', 0.597, 'P 0.50 · R 0.75'],
          ['Labor', 0.508, 'P 0.48 · R 0.54'],
        ].map(([label, v, pr]) => ({
          label, value: v, valueText: `F1 ${v.toFixed(3)}`, pr, labelX: 106,
          fill: v > 0.8 ? C.accent : '#E3B9A0',
        })),
        1020,
      ),
  },
  // ---- Mini-RAG (in progress) — only what exists in the repo today ----
  {
    id: 'minirag-pipeline',
    project: 'minirag',
    meta: {
      label: 'MINI-RAG  ·  PIPELINE',
      title: 'AI lawyer for Qatar',
      subtitle: 'RAG over Qatari legal documents — FastAPI · LangChain · MongoDB · Docker',
      source: 'Source: github.com/albara-AI/Mini-rag — app/ structure',
      badge: true,
    },
    body: () =>
      ragCards([
        [
          { head: 'POST /upload', body: 'FastAPI router' },
          { head: 'Load', body: 'PyMuPDF · Arabic + English' },
          { head: 'Chunk', body: 'Configurable size + overlap' },
        ],
        [
          { head: 'Embed', body: 'Embeddings', next: true },
          { head: 'Retrieve', body: 'Vector search', next: true },
          { head: 'Answer', body: 'LLM over Qatari law', next: true },
        ],
      ]),
  },
  {
    id: 'minirag-api',
    project: 'minirag',
    meta: {
      label: 'MINI-RAG  ·  API & STACK',
      title: 'What runs today',
      subtitle: 'Three endpoints — upload a document, then load and chunk it',
      source: 'Source: github.com/albara-AI/Mini-rag — app/routers, app/controllers, requirements.txt',
      badge: true,
    },
    body: () => {
      const eps = [
        ['GET', '/api/v1/', 'App name + version'],
        ['POST', '/api/v1/data/upload/{project_id}', 'Validate type + size, stream to disk'],
        ['POST', '/api/v1/data/process/{project_id}', 'Load TXT / PDF, split into chunks'],
      ];
      const epRows = eps
        .map(([m, p, d], i) => {
          const y = 300 + i * 100;
          return `<rect x="96" y="${y}" width="1408" height="80" rx="14" fill="${C.card}"/>` +
            `<rect x="120" y="${y + 22}" width="76" height="36" rx="8" fill="${m === 'GET' ? '#B9C9C9' : C.accent}"/>` +
            text(158, y + 48, m, { size: 18, font: MONO, fill: m === 'GET' ? C.ink : '#FFFFFF', anchor: 'middle' }) +
            text(220, y + 50, p, { size: 23, font: MONO }) +
            text(1480, y + 50, d, { size: 20, fill: C.muted, anchor: 'end' });
        })
        .join('');
      const cw = (s) => Math.round(s.length * 12.4 + 48); // DejaVu Sans 21px ≈ 12.4px/char
      const chip = (x, y, s, dashed) =>
        (dashed
          ? `<rect x="${x}" y="${y}" width="${cw(s)}" height="54" rx="27" fill="none" stroke="${C.ink}" stroke-width="2" stroke-dasharray="7 5"/>`
          : `<rect x="${x}" y="${y}" width="${cw(s)}" height="54" rx="27" fill="${C.card}"/>`) +
        text(x + 24, y + 35, s, { size: 21, fill: dashed ? C.muted : C.ink });
      // lay chips out left→right, wrapping before the 1504px right margin
      const row = (y, items, dashed) => {
        let x = 96;
        return items
          .map((s) => {
            if (x + cw(s) > 1504) { x = 96; y += 70; }
            const out = chip(x, y, s, dashed);
            x += cw(s) + 16;
            return out;
          })
          .join('');
      };
      return epRows +
        text(96, 670, 'STACK — IN THE REPO NOW', { size: 20, font: MONO, fill: C.muted }) +
        row(696, ['FastAPI', 'LangChain', 'PyMuPDF', 'MongoDB (Motor)', 'aiofiles', 'pydantic-settings', 'Docker Compose']) +
        text(96, 880, 'NEXT', { size: 20, font: MONO, fill: C.muted }) +
        row(906, ['Embeddings', 'Vector search', 'LLM over Qatari law'], true);
    },
  },
  {
    id: 'minirag-code',
    project: 'minirag',
    meta: {
      label: 'MINI-RAG  ·  CODE',
      title: 'Stream the upload, then chunk',
      subtitle: 'Two excerpts, copied as-is from the repo',
      source: 'Source: github.com/albara-AI/Mini-rag — app/routers/data_routers.py, app/controllers/process_controllers.py',
      badge: true,
    },
    body: () =>
      code(96, 290, 1408, 'app/routers/data_routers.py',
        [
          'async with aiofiles.open(file_path, "wb") as f:',
          '    while chunk := await file.read(app_settings.FILE_DEFAULT_CHUNK_SIZE):',
          '        await f.write(chunk)',
        ].join('\n')) +
      code(96, 560, 1408, 'app/controllers/process_controllers.py',
        [
          'text_spliter = RecursiveCharacterTextSplitter(',
          '    chunk_size = chunk_size,',
          '    chunk_overlap = overlap_size,',
          '    length_function = len, ',
          ')',
        ].join('\n')),
  },
  // ---- FlyRank, IMDb, CO₂ ----
  {
    id: 'flyrank-pipeline',
    project: 'flyrank',
    meta: {
      label: 'FLYRANK  ·  ARCHITECTURE',
      title: 'From form to classified lead',
      subtitle: 'Validated, rate limited, geo-enriched, stored, classified by intent in Arabic',
      source: 'Source: github.com/albara-AI/flyrank-capstone-widget-platform — README',
    },
    body: () =>
      grid([
        [
          { head: 'POST /submit', body: ['Size limit + rate limit', '(pre-parse)'] },
          { head: 'Validate', body: ['Validation + honeypot'] },
          { head: 'Geo', body: ['ip_api → ipapi_co → none'] },
        ],
        [
          { head: 'Transaction', body: ['Submission + jobs', 'in one transaction'] },
          { head: 'Worker', body: ['SKIP LOCKED, retries'] },
          { head: 'AI classify', body: ['Gemini → Groq →', 'Arabic rules'], kind: 'accent', note: 'LLM' },
        ],
      ]) +
      text(100, 1000, 'One script tag on the customer site · PostgreSQL · Docker Compose', { size: 22, fill: C.muted }),
  },
  {
    id: 'flyrank-quality',
    project: 'flyrank',
    meta: {
      label: 'FLYRANK  ·  QUALITY',
      title: 'Tests & LLM guardrails',
      subtitle: 'Shipped with 185 automated tests on real PostgreSQL',
      source: 'Source: flyrank-capstone-widget-platform README (make check, make probes) + CV',
    },
    body: () => {
      const col = (x, w, head, items) =>
        text(x, 360, head, { size: 20, font: MONO, fill: C.muted }) +
        items
          .map((s, i) =>
            `<rect x="${x}" y="${392 + i * 92}" width="${w}" height="72" rx="14" fill="${C.card}"/>` +
            text(x + 28, 438 + i * 92, s, { size: 22 }),
          )
          .join('');
      return (
        text(96, 590, '185', { size: 180, font: SERIF, fill: C.accent }) +
        text(104, 670, 'automated tests', { size: 26 }) +
        text(104, 708, 'on real PostgreSQL', { size: 26 }) +
        col(500, 470, 'CHECKS', ['ruff + format', 'mypy --strict', '6 evaluator probes', 'Alembic migrations', 'Docker Compose', 'Arabic eval set + harness']) +
        col(1030, 470, 'LLM GUARDRAILS', [
          'PII redaction before LLM',
          'Per-call cost attribution',
          'Budget guards',
          'Per-company daily quotas',
          'Confidence threshold',
          'Explicit “unclear” class',
        ])
      );
    },
  },
  {
    id: 'imdb-pipeline',
    project: 'imdb',
    meta: {
      label: 'DATA & ML  ·  IMDB TOP-250  ·  PIPELINE',
      title: 'Scrape → clean → query',
      subtitle: 'Selenium · BeautifulSoup · Pandas · SQLite',
      source: 'Source: github.com/albara-AI/imdb-top250-scraper — README',
    },
    body: () =>
      grid([
        [
          { head: 'Q1 Scrape', body: ['Selenium (headless Chrome)', '+ BeautifulSoup', 'movies + cast & crew'] },
          { head: 'Q2 Clean', body: ['Votes, budget, revenue,', 'genres → merge datasets'] },
          { head: 'Q3 Query', body: ['SQLite via SQLAlchemy', 'analytical SQL queries'], kind: 'accent' },
        ],
      ]) +
      text(100, 680, 'QUERIES', { size: 20, font: MONO, fill: C.muted }) +
      ['Top-rated movies', 'Movies per release year', 'Most-appearing cast members']
        .map((q, i) => `<rect x="100" y="${710 + i * 92}" width="1430" height="72" rx="14" fill="${C.card}"/>` + text(128, 756 + i * 92, q, { size: 24 }))
        .join(''),
  },
  {
    id: 'co2-loan-pipeline',
    project: 'co2-loan',
    meta: {
      label: 'DATA & ML  ·  CO₂ & LOAN APPROVAL  ·  PIPELINE',
      title: 'Two datasets, three tasks',
      subtitle: 'Pandas · Scikit-learn · mlxtend · Matplotlib + Seaborn',
      source: 'Source: github.com/albara-AI/ml-co2-loan-analysis — README',
    },
    body: () =>
      grid([
        [
          { head: 'Q1 Explore', body: ['CO₂ emissions:', 'scatter, pairplot,', 'correlation heatmap'] },
          { head: 'Q2 Regress', body: ['Linear regression', '+ forward feature', 'selection (SFS)'] },
          { head: 'Q3 Classify', body: ['Loan approval:', 'logistic regression', '+ decision tree'], kind: 'accent' },
        ],
      ], 300, 260) +
      `<rect x="100" y="680" width="1430" height="150" rx="18" fill="${C.card}"/>` +
      text(140, 745, 'Validated with', { size: 26, fill: C.muted }) +
      text(140, 800, '10-fold cross-validation', { size: 40, font: SERIF }) +
      text(1490, 790, 'ROC / AUC · confusion matrix', { size: 22, fill: C.muted, anchor: 'end' }),
  },
];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
for (const img of images) {
  const svg = frame(img.meta, img.body());
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, `${img.id}.png`));
  console.log(`generated .work/generated/${img.id}.png`);
}
await (await import('node:fs/promises')).writeFile(
  path.join(OUT, 'index.json'),
  JSON.stringify(images.map(({ id, project, meta }) => ({ id, project, source: meta.source })), null, 2),
);
