# ROADMAP.md — one phase per session, stop after each

## Phase 0 — Setup
- Vite + TS project, install gsap, lenis, @fontsource (instrument-serif, inter, jetbrains-mono), sharp (dev).
- CSS tokens from DESIGN.md, grain overlay, base typography. Empty section shells with ids.
- Check `ffmpeg -version`; if missing, tell Albara the one install command for his OS.
- Done when: `npm run dev` shows the paper background, fonts load, 6 empty labeled sections.

## Phase 1 — Assets
- `scripts/frames.mjs`: from each video in `photo/videos/`, extract frames on scene change (fallback every 2s), build a numbered contact sheet per video.
- **STOP: show contact sheets to Albara. He picks frames and approves (sensitive data rule).**
- Export picked frames to WebP (1600px long side, q≈78) + 400px thumbs; cut 3–5s muted loops (mp4 H.264 + webm, ≤1.5MB each, poster frame).
- Compress `photo/projects/*` and `photo/about/*` to WebP into `public/media/`. Copy CV to `public/cv/`.
- Ask Albara for missing repo links; generate result images from READMEs in the same style as `photo/projects/albayan-results-1.png`.
- Done when: `public/media/` holds every approved asset + `assets.json` manifest (id, project, type, path, poster, width, height).

## Phase 2 — Static layout
- All sections (now 5: Hero, About, LLM projects, Data & ML, Contact — Moments was removed) with real content from `src/content.ts`, no animation yet. Responsive (375 / 768 / 1440).
- Done when: the whole site reads well with JavaScript turned off for motion.

## Phase 3 — Smooth scroll + reveals
- Lenis + ScrollTrigger wiring, progress bar, nav smooth links, word-by-word heading reveals, fade-up reveals, About portrait clip + parallax.
- Done when: motion feels like the prototype; reduced-motion shows the static version.

## Phase 4 — Hero fly-through
- Per DESIGN.md §1, media from the manifest.
- Done when: 60fps on desktop, the 4 photos pass one by one, name reveal lands cleanly.

## Phase 5 — LLM projects (built as a ring, then replaced by a carousel + details panel)
- Per DESIGN.md §3–4: coverflow carousel (one card per project), flat Data & ML carousel, shared details panel with gallery.
- Done when: every card opens the right project; drag, arrows, keyboard and swipe all work; the panel closes with ✕/Esc/outside click and returns focus.

## Phase 6 — Contact (the Data & ML carousel was built with Phase 5)
- Contact buttons: CV download, WhatsApp, email + copy, LinkedIn, GitHub.
- Done when: every button works on desktop and phone (test WhatsApp on a real phone).
- Status: built and tested at 1440 / 768 / 375 and with reduced motion; WhatsApp, Email (mail app) and the CV download still need a check on Albara's real phone.

## Phase 7 — Polish
- PERFORMANCE.md checks, Lighthouse, meta/OG image, favicon, 404, keyboard focus states, alt text for every image.
- Done when: all PERFORMANCE.md budgets pass.

## Phase 8 — Deploy
- Vercel deploy from GitHub repo. Share the URL.

## Future (not scheduled — don't build until Albara asks)
- **Education & Certifications strip** — text only (no logos/images): degree + certificates from the CV, each with year; Microsoft Certified: Azure AI Fundamentals (AI-901) gets a "Verify" link (TODO: Albara to send the credential URL). Data already lives in `certificates` in `src/content.ts`.
- **Power BI image** — replace the current filtered screenshot (`photo/projects/powerbi-1-1.png`, state = AC) with the unfiltered version; then put the KPI numbers back in CONTENT.md if they match.
- **Mini-RAG update** — when the project is finished: new screenshots/results from the repo, drop the "In progress" badge (`status` in content.ts), add a key metric if the README has one.
- **Arabic version (RTL)** — `lang="ar" dir="rtl"`, Arabic copy from Albara (never machine-translated without his review), mirrored layouts and motion directions, an Arabic font pairing, and a language switch in the nav.
