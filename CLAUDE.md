# CLAUDE.md — Albara Aljaber Portfolio

You are building Albara Aljaber's personal portfolio: an editorial, scroll-driven site with 3D (CSS) transitions.
Audience: tech leads and recruiters hiring an **AI Engineer (LLMs · RAG · NLP · backend)**. They give the site < 60 seconds.

Read these before any work, every session:
- `docs/DESIGN.md` — look, motion, each section's behavior
- `docs/CONTENT.md` — all real text, links, project data (never invent content)
- `docs/ROADMAP.md` — the phases; work on ONE phase per session
- `docs/PERFORMANCE.md` — budgets and rules every phase must pass
- `reference/prototype.html` — approved visual prototype. Match its feel; rebuild it properly, don't copy-paste it.

## Stack (fixed — don't swap without asking)
- Vite + vanilla TypeScript (no React, no framework)
- GSAP + ScrollTrigger (scroll animation), Lenis (smooth scroll)
- CSS 3D transforms for all 3D. **No three.js / WebGL** unless Albara asks.
- Fonts: Instrument Serif (headings), Inter (body), JetBrains Mono (labels) — self-host via `@fontsource` packages.
- Asset tooling (dev only): `sharp` for images, `ffmpeg` (system) for video.
- Deploy target: Vercel (static build).

## Folder layout
```
/photo            ← Albara's raw inputs. NEVER modify or delete. Read-only.
/public/media     ← optimized outputs you generate (webp/mp4/webm)
/public/cv        ← the CV PDF copied from /photo/cv
/scripts          ← asset pipeline scripts (frames, compress, contact sheets)
/src              ← site code: main.ts, sections/*.ts, styles/*.css, content.ts
/docs, /reference ← guidance, read-only unless asked
```

## Working rules
1. One roadmap phase per session. Finish it, check its "Done when" list, then STOP and summarize what changed and what Albara should look at. Do not start the next phase on your own.
2. All text comes from `docs/CONTENT.md` → put it in `src/content.ts`. Never write new claims, numbers, or project descriptions. If something is missing, leave a visible `TODO:` and ask.
3. Project numbers/results come only from the project's GitHub README or the CV. If a README is unreachable, ask Albara for the link — don't guess.
4. **Sensitive data rule:** before any frame, screenshot or clip from `/photo` goes on the site, show Albara the contact sheet and wait for approval. Reject anything showing client names, emails, phone numbers, API keys, tokens, internal URLs or private company data.
5. Keep commits small with clear messages (one feature per commit).
6. Test at 375px (mobile), 768px and 1440px widths, and with `prefers-reduced-motion: reduce`, before saying a phase is done.
7. Explain non-obvious decisions briefly — Albara is learning from the build.

## Commands (set up in Phase 0)
- `npm run dev` — dev server
- `npm run build` — production build
- `npm run assets` — run the asset pipeline (scripts/)
- `npm run preview` — preview the build
