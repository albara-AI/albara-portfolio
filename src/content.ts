// All site text and data lives here and comes from docs/CONTENT.md (or, for
// section names, docs/DESIGN.md). Never add claims or numbers that aren't there.
// `*word*` in a heading marks the one italic accent word (DESIGN.md → Type).
//
// Everything is data: to add a project, data card, skill, link or
// certificate, add one entry to the right array below (+ its images — see
// docs/HOW-TO-UPDATE.md). The layout code adapts to any number of items.

export const meta = {
  title: 'Albara Aljaber — AI Engineer (LLMs · RAG · Arabic NLP)',
  description: 'AI Engineer in Doha building end-to-end LLM, RAG and NLP systems.',
} as const;

export const identity = {
  firstName: 'Albara',
  lastName: 'Aljaber',
  role: 'AI Engineer — LLMs · RAG · Arabic NLP',
  location: 'Doha, Qatar',
} as const;

export type SectionId = 'top' | 'about' | 'work' | 'data' | 'contact';

// Nav labels from docs/DESIGN.md → "Nav".
export const nav: { label: string; href: `#${SectionId}` }[] = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Data', href: '#data' },
  { label: 'Contact', href: '#contact' },
];

// Repos — found on https://github.com/albara-AI (Phase 1). All public.
export const repos = {
  flyrank: 'https://github.com/albara-AI/flyrank-capstone-widget-platform',
  minirag: 'https://github.com/albara-AI/Mini-rag',
  albayan: 'https://github.com/albara-AI/arabic-legal-classifier',
  imdb: 'https://github.com/albara-AI/imdb-top250-scraper',
  co2Loan: 'https://github.com/albara-AI/ml-co2-loan-analysis',
  fashionMnist: 'https://github.com/albara-AI/fashion-mnist-ssl',
} as const;

// ---------- Links (Contact buttons, hero buttons, mobile menu) ----------
// WhatsApp number and English message confirmed by Albara (Phase 1).
const waMessage = 'Hi Albara, I came across your portfolio and would like to talk.';

export interface SiteLink {
  id: string;
  label: string;
  href: string;
  /** opens in a new tab */
  external?: boolean;
  /** set → the browser downloads the file under this name */
  download?: string;
  /** the one filled (primary) button; the rest are outlined */
  primary?: boolean;
}

/** Contact buttons, in this order. */
export const links: SiteLink[] = [
  { id: 'cv', label: 'Download CV', href: '/cv/Albara_Aljaber_CV.pdf', download: 'Albara_Aljaber_CV.pdf', primary: true },
  { id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/97431066519?text=${encodeURIComponent(waMessage)}`, external: true },
  { id: 'email', label: 'Email', href: 'mailto:albaraaljaberwork@gmail.com' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/albara-aljaber', external: true },
  { id: 'github', label: 'GitHub', href: 'https://github.com/albara-AI', external: true },
];

/** Look up a link by id (throws on a typo, so mistakes show up in dev). */
export function link(id: string): SiteLink {
  const l = links.find((x) => x.id === id);
  if (!l) throw new Error(`No link with id "${id}" in content.ts → links`);
  return l;
}

export const contact = {
  heading: "Let's build something *intelligent*.",
  email: 'albaraaljaberwork@gmail.com',
  footer: '© 2026 Albara Aljaber · Doha, Qatar',
} as const;

/** Small interface words (buttons, screen-reader labels). */
export const ui = {
  menu: 'Menu',
  close: 'Close',
  sections: 'Sections',
  newTab: '(opens in a new tab)',
  tech: 'Tech',
  prev: 'Previous project',
  next: 'Next project',
  openDetails: 'Open project details',
  closeDetails: 'Close details',
  gallery: 'Screenshots and results',
  keyMetric: 'Key result',
} as const;

// ---------- 1. Hero ----------
export const hero = {
  label: 'Portfolio · 2026',
  role: 'AI Engineer — LLMs · RAG · Arabic NLP',
  sentence: 'I build AI systems end to end: LLMs, RAG, NLP, and the tested backends that ship them.',
  place: 'Doha, Qatar',
  scrollHint: 'Scroll ↓',
  // Albara's event photos (me-2 … me-5), in fly-through order. No project
  // screenshots in the hero; me-1 is the About portrait only.
  media: ['hero-1', 'hero-2', 'hero-3', 'hero-4'],
  /** links shown as the two hero buttons (ids from `links`) */
  buttons: ['cv', 'github'],
} as const;

// ---------- 2. About ----------
export const about = {
  label: '01 — About',
  heading: 'Curious by nature, *engineer* by choice.',
  paragraphs: [
    "I'm Albara — a Data Science & AI graduate from the Hashemite University in Jordan, now based in Doha.",
    'Outside of code, I lead a volunteer team, served as faculty representative on the student council, and spend a lot of time behind a camera, filming people and events.',
    "I like starting from a messy problem and staying with it until it's actually useful to someone. Every day I learn something new 🌱",
  ],
  // "I work with" + a typewriter cycling these (static list under reduced motion)
  skillsLead: 'I work with',
  skills: [
    'LLMs',
    'RAG pipelines',
    'LLM evaluation',
    'Prompt engineering',
    'LangChain',
    'Arabic NLP',
    'Hugging Face Transformers',
    'PyTorch',
    'FastAPI',
    'PostgreSQL',
    'Docker',
  ],
  facts: [
    { value: 'Doha', label: 'Based in' },
    { value: 'Arabic · English', label: 'Languages' },
    { value: '2026', label: 'Graduated' },
  ],
  portrait: 'about-portrait',
} as const;

// ---------- 3. LLM projects (ring order) ----------
export interface LlmProject {
  id: string;
  name: string;
  title: string;
  meta: string;
  description: string;
  metric?: string;
  extra?: string;
  tags: string[];
  status?: 'In progress';
  repo?: string;
  /** card image (asset id); defaults to the first item in `media` */
  cover?: string;
  /** every image/clip for the details gallery, in order (asset ids) */
  media: string[];
}

export const work = {
  label: '02 — LLM projects',
  heading: 'LLM *projects*',
  viewCode: 'View code',
  projects: [
    {
      id: 'flyrank',
      name: 'FlyRank Capstone',
      title: 'Multi-tenant AI platform',
      meta: 'Backend AI Engineering Intern · Jul 2026 – Nov 2026',
      description:
        'Embeddable lead-capture platform with an LLM layer: Gemini → Groq → rule-engine fallback chain, PII redaction before every LLM call, per-call cost attribution and daily quotas.',
      metric: '185 automated tests on real PostgreSQL',
      extra: '83-message Arabic evaluation set and harness to benchmark LLM providers.',
      tags: ['FastAPI', 'PostgreSQL', 'LLMs', 'Docker'],
      repo: repos.flyrank,
      cover: 'flyrank-builder',
      media: ['flyrank-builder', 'flyrank-overview', 'flyrank-theme', 'flyrank-demo-site', 'flyrank-companies', 'flyrank-pipeline', 'flyrank-quality'],
    },
    {
      id: 'minirag',
      name: 'Mini-RAG',
      title: 'AI legal assistant for Qatari law',
      meta: 'In progress',
      description:
        'RAG system for Qatari legal documents — upload API, mixed Arabic–English PDF loading and configurable chunking with overlap. Embeddings and vector search are next.',
      tags: ['FastAPI', 'LangChain', 'MongoDB', 'Docker'],
      status: 'In progress',
      repo: repos.minirag,
      media: ['minirag-pipeline', 'minirag-api', 'minirag-code'],
    },
    {
      id: 'albayan',
      name: 'AL-BAYAN#',
      title: 'Legal document intelligence',
      meta: 'Graduation project · 2026',
      description:
        'End-to-end pipeline: scrapes Official Gazette PDFs, extracts Arabic text with OCR, and classifies documents across 17 legal sectors with a 3-model transformer ensemble.',
      metric: 'Macro-F1 0.769 vs 0.558 TF-IDF baseline (+38%)',
      extra:
        'Focal Loss, Hard Negative Mining, per-label thresholds; tag generation with AraT5 + InfoNCE bi-encoder + RAG fallback. Presented at Hashemite University Scientific Day (June 2026), five-member team.',
      tags: ['PyTorch', 'Transformers', 'RAG', 'OCR'],
      repo: repos.albayan,
      cover: 'albayan-landing',
      media: ['albayan-loop', 'albayan-results-1', 'albayan-results-2', 'albayan-pipeline', 'albayan-report', 'albayan-upload'],
    },
  ] satisfies LlmProject[],
};

// ---------- 4. Data & ML (2×2 grid, in this order) ----------
export interface DataProject {
  id: string;
  title: string;
  line: string;
  detail?: string;
  metric?: string;
  tags: string[];
  repo?: string;
  /** asset ids for the card (first = cover) and details gallery; leave out →
   *  a designed text card (metric or title) is shown */
  media?: string[];
}

export const data = {
  label: '03 — Data & ML',
  heading: 'Data & *ML*',
  projects: [
    {
      id: 'powerbi',
      title: 'Olist E-commerce Sales Dashboard',
      line: 'Kaggle Olist Brazilian e-commerce data (9 tables).',
      detail:
        'Pipeline: discovery → cleaning → transformation → integration; remodeled 9 tables into a star schema (1 fact + 5 dimension tables). Interactive Power BI report with KPI cards for sales, profit, cost and quantity; filters by date, seller, order status and state.',
      tags: ['Power BI', 'DAX', 'Star schema', 'Data cleaning'],
      media: ['powerbi-report'],
    },
    {
      id: 'fashion-mnist',
      title: 'Semi-supervised Fashion-MNIST Classifier',
      line: 'Semi-supervised Fashion-MNIST classifier (TensorFlow, 83.66% test accuracy with 960 labels).',
      metric: '83.66% test accuracy with 960 labels',
      tags: ['TensorFlow', 'Autoencoder', 'Pseudo-labeling'],
      repo: repos.fashionMnist,
      media: ['fashion-pipeline', 'fashion-confusion'],
    },
    {
      id: 'imdb',
      title: 'IMDb Top-250 Scraper',
      line: 'IMDb Top-250 scraper (Selenium, BeautifulSoup, SQLite).',
      tags: ['Selenium', 'BeautifulSoup', 'SQLite'],
      repo: repos.imdb,
      media: ['imdb-pipeline'],
    },
    {
      id: 'co2-loan',
      title: 'CO₂ & Loan-Approval Models',
      line: 'Predictive models validated with 10-fold cross-validation.',
      tags: ['Scikit-learn', 'Regression', 'Classification'],
      repo: repos.co2Loan,
      media: ['co2-loan-pipeline'],
    },
  ] satisfies DataProject[],
};

// ---------- Contact ----------
export const contactSection = {
  label: '04 — Contact',
  copy: 'Copy',
  copied: 'Copied',
} as const;

// ---------- Certificates (data only — not on the site yet; see ROADMAP → Future) ----------
// From the CV (photo/cv). verifyUrl: TODO — Albara to send the AI-901 credential link.
export interface Certificate {
  name: string;
  issuer?: string;
  year?: string;
  verifyUrl?: string;
}

export const education = {
  degree: 'B.Sc. Data Science & Artificial Intelligence — The Hashemite University, Jordan',
  year: '2026',
} as const;

export const certificates: Certificate[] = [
  { name: 'Azure AI Fundamentals (AI-901)', issuer: 'Microsoft Certified', year: '2026' },
  { name: 'AIDEL — International AI Driving License' },
  { name: 'Python & AI/ML Training', issuer: 'Al-Raja International', year: '2024' },
  { name: 'Business Intelligence & Data Analysis', issuer: 'Sigma Agency', year: '2024' },
];

// ---------- Image alt text (describes what is in each image) ----------
export const alt: Record<string, string> = {
  'albayan-landing': 'AL-BAYAN# web app landing page, in Arabic',
  'albayan-upload': 'AL-BAYAN# document upload screen',
  'albayan-uploading': 'AL-BAYAN# uploading a legal document',
  'albayan-report': 'AL-BAYAN# analysis report for an uploaded document',
  'albayan-loop': 'Screen recording: AL-BAYAN# landing page, upload, and analysis report',
  'albayan-pipeline': 'AL-BAYAN# pipeline: fetch, OCR, augment, train, ensemble, generate',
  'albayan-results-1': 'Bar chart: AL-BAYAN# macro-F1 from 0.558 baseline to 0.769 ensemble',
  'albayan-results-2': 'Bar chart: AL-BAYAN# F1 for the strongest and weakest legal sectors',
  'flyrank-overview': 'FlyRank platform dashboard overview with daily submissions chart',
  'flyrank-builder': 'FlyRank widget builder with live preview',
  'flyrank-theme': 'FlyRank widget builder with a custom-colored signup widget',
  'flyrank-demo-site': 'FlyRank widget embedded on a demo customer site',
  'flyrank-companies': 'FlyRank admin console listing demo companies',
  'flyrank-pipeline': 'FlyRank architecture: submission, validation, geo, transaction, worker, LLM classification',
  'flyrank-quality': 'FlyRank quality: 185 tests, checks and LLM guardrails',
  'minirag-pipeline': 'Mini-RAG pipeline: upload, load and chunk built; embed, retrieve and answer next',
  'minirag-api': 'Mini-RAG API endpoints and stack in the repo today',
  'minirag-code': 'Mini-RAG code excerpts: streamed upload and text splitter',
  'powerbi-report': 'Power BI sales summary report on the Olist e-commerce dataset',
  'fashion-pipeline': 'Fashion-MNIST semi-supervised learning pipeline overview, 83.66% test accuracy',
  'fashion-confusion': 'Confusion matrix for the Fashion-MNIST classifier',
  'imdb-pipeline': 'IMDb pipeline: scrape, clean, query',
  'co2-loan-pipeline': 'CO₂ and loan-approval pipeline: explore, regress, classify',
  'about-portrait': 'Portrait of Albara Aljaber',
  'hero-1': 'Albara at the World Investment Forum 2026 in Doha',
  'hero-2': 'Albara at the World Investment Forum 2026 in Doha',
  'hero-3': "Albara's World Investment Forum 2026 badge, UNCTAD",
  'hero-4': 'Event screen at the World Investment Forum 2026, Doha',
};
