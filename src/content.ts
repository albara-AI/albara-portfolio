// All site text lives here and comes from docs/CONTENT.md.
// Phase 0 only needs identity, meta, nav and section labels;
// the rest of CONTENT.md is added in Phase 2.

export const meta = {
  title: 'Albara Aljaber — AI Engineer (LLMs · RAG · NLP)',
  description: 'AI Engineer in Doha building end-to-end LLM, RAG and NLP systems.',
} as const;

export const identity = {
  firstName: 'Albara',
  lastName: 'Aljaber',
  role: 'AI Engineer — LLMs · RAG · NLP',
  location: 'Doha, Qatar',
} as const;

export type SectionId = 'top' | 'about' | 'work' | 'data' | 'moments' | 'contact';

export interface SectionShell {
  id: SectionId;
  /** Mono label, e.g. "01 — About". Hero has no number. */
  label: string;
}

// Section order and names follow docs/DESIGN.md → "Sections (in order)".
export const sections: SectionShell[] = [
  { id: 'top', label: 'Hero' },
  { id: 'about', label: '01 — About' },
  { id: 'work', label: '02 — LLM projects' },
  { id: 'data', label: '03 — Data & ML' },
  { id: 'moments', label: '04 — Moments' },
  { id: 'contact', label: '05 — Contact' },
];

// Nav labels from docs/DESIGN.md → "Nav".
export const nav: { label: string; href: `#${SectionId}` }[] = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Data', href: '#data' },
  { label: 'Contact', href: '#contact' },
];
