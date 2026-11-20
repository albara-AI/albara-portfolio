# DESIGN.md

## Direction
Editorial magazine feel, not a tech demo. Soul comes from: real images, big serif type, lots of empty space, slow soft motion. Reference: `reference/prototype.html` (approved).

## Colors (light, Olist-based)
| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F2F0EB` | page background |
| `--paper-2` | `#E8E5DD` | cards, panels |
| `--ink` | `#1A1A2E` | text, buttons, dark panels (badges, code) |
| `--ink-2` | `#4A4A5E` | body text |
| `--muted` | `#8A877E` | labels, captions |
| `--accent` | `#6EC8C8` | lines, progress bar, accents on dark |
| `--accent-ink` | `#2E8F8F` | accent text on light (contrast-safe) |

Subtle film-grain overlay over the whole page (SVG noise, ~7% opacity, `mix-blend-mode: multiply`).

## Type
- Headings: Instrument Serif 400, italic for one emphasized word per heading (in `--accent-ink`). Sizes via `clamp()`; hero name up to ~210px.
- Body: Inter 400, 16–17px, line-height 1.7.
- Labels: JetBrains Mono, 11px, uppercase, letter-spacing .12em. Section labels look like `01 — About` with a short line before.
- Two weights only (400, 500). No bold headings.

## Motion rules
- Smooth scroll: Lenis (`duration ≈ 1.25`, expo-out easing).
- Easing for reveals: `expo.out` / `power3.out`, 0.9–1.2s. Nothing bouncy.
- Headings reveal word by word (each word slides up from a mask, stagger .06s).
- Scroll-linked scenes use sticky stages (`position: sticky` inside a tall section) + ScrollTrigger progress 0→1.
- Top progress bar (2px, `--accent`).
- `prefers-reduced-motion: reduce` → no Lenis, no fly-through, no coverflow 3D (carousels slide plainly), clips don't autoplay; show static, readable layouts.

## Sections (in order)

### 1. Hero — fly-through
- Sticky full-screen stage, section height ~340vh, `perspective: 900px`.
- Only Albara's personal/event photos: `photo/about/me-2 … me-5` (4 photos). **No project screenshots in the hero.** `me-1` is the About portrait only.
- **On load (no scroll): text only, no photos.** Centred-left: mono label "Portfolio · 2026", name "Albara / *Aljaber*" (Aljaber italic, `--accent-ink`), role line, one sentence, buttons Download CV (primary) + GitHub (ghost). Bottom-left "Doha, Qatar", bottom-right "Scroll ↓" (mono).
- 0–15% scroll: all of that text fades out and lifts slightly.
- 15–90%: few and large, the photos pass the camera **slowly, one by one** — each starts deep in z, travels toward the camera, and fades as it passes before the next one takes over (at most a brief overlap). Alternate them left/right of centre.
- End: the stage empties and the page flows into About. The name is **not** shown again.
- Mobile: same 4 photos, smaller. Reduced motion: text screen on top, the photos in a row below (2 columns on phones), no movement.

### 2. About — split screen
- About Albara the person, not the projects.
- Left: label, big serif heading (word reveal), 3 short paragraphs, a skills line, 3 facts (big serif value + mono label).
- Skills line: "I work with" + a typewriter that types a skill, pauses ~1.5s, deletes it, types the next, looping (list in CONTENT.md). The rotating word is `--accent-ink` with a blinking cursor; the line has a fixed height so nothing shifts (on phones the word gets its own line). Pauses off-screen. Reduced motion: a static comma-separated list.
- Right: tall portrait (`photo/about/me-1`) with clip-path opening on scroll (`inset(12% 8%)` → `inset(0)`) and slow parallax inside.

### 3. LLM projects — coverflow carousel (heart of the site)
- Normal section height (no sticky stage). Vertical page scroll never moves the carousel.
- **One card per project**, in order: FlyRank Capstone → Mini-RAG → AL-BAYAN#. Card = cover image (`cover` in content.ts, else the first media) + serif title + one-line subtitle + index; Mini-RAG shows the "In progress" badge on its card.
- Horizontal carousel built on native scroll + scroll-snap: drag/swipe, trackpad sideways scroll, ← → buttons with a `01 / 03` counter, keyboard ← → / Home / End. Snaps each card to the centre.
- Light 3D (coverflow): the centred card full size; side cards slightly smaller (~0.86), turned (~24°) and a little faded; follows the scroll smoothly.
- Clicking a card opens the **details panel** (below).

### 4. Data & ML — flat carousel
- Same carousel, smaller cards (~24vw), **no 3D**, snapping to the left edge. Order: Power BI Dashboard → Fashion-MNIST SSL → IMDb Scraper → CO₂ & Loan Models.
- Card = image (or a designed text card with the metric/title if there's no image) + title + one line. Gentle lift on hover.
- Clicking a card opens the same details panel.

### Project details panel (both sections)
- Native `<dialog>`: centred modal (max ~940px, `--paper`, dimmed backdrop) on desktop; a full-screen sheet on phones.
- Content: index/kicker (+ "In progress" badge), serif title, subtitle, meta; a small horizontal gallery of **all** the project's media (stills, the AL-BAYAN# clip — muted and looping, result images); full description; key result; extra details; tags; "View code".
- Close with ✕, Esc, or a click outside. Focus is trapped inside while open and returns to the card on close. The page behind doesn't scroll.

### Scroll story after About (GSAP ScrollTrigger)
- **Layered sections:** About → LLM projects → Data & ML → Contact are opaque sheets stacked in that order. As each section rises over the previous one (its top travelling from the bottom of the screen to the top), the one behind is held back (moves up only ~15% as fast), scales to 0.92 and darkens (ink shade up to 0.55) — scrubbed. The page behind the sheets is `--ink`, and the rising sheet has a soft top shadow. Implemented by counter-translating the section behind (no pinning).
- **LLM projects entrance:** heading word reveal; the carousel comes in from depth — cards spread out, turned (~40°), tilted and far back (z −900) — and settles into the coverflow as the section scrolls into view (scrubbed). Once settled the trigger is removed, so scroll never touches the carousel again (also when scrolling back up).
- **Data & ML entrance:** cards rise and fade in with a stagger; light scrubbed parallax on the card images inside their frames.
- **Contact:** the big line reveals word by word; buttons fade up one after another.
- **Carousels are never driven by vertical scroll** — only swipe/drag/arrows/keys change the active card.
- Reduced motion: none of the above — everything is simply shown.

### 5. Contact
- Huge serif line: "Let's build something *intelligent*."
- Buttons (one primary, rest ghost): Download CV · WhatsApp · Email · LinkedIn · GitHub. Details in CONTENT.md.
- Email shown as text with a Copy button (shows "Copied" for 2s).
- Footer: © 2026 Albara Aljaber · Doha, Qatar.

## Nav
Fixed top bar, mono labels: name left; About · Work · Data · Contact right. Links smooth-scroll via Lenis and stop below the bar.
- Desktop: transparent, `mix-blend-mode: difference`.
- Mobile (< 820px): solid `--paper` bar with a hairline bottom border, links replaced by a minimal full-screen menu. The nav must never overlap section labels — content scrolls under the solid bar, and anchor jumps land below it.

## Designed cards (for projects without images)
Same 3:4 card, `--paper-2` background, mono label top-left (`02 — PROJECT`):
- Metric card: one big serif number + label (e.g. `0.769` / Macro-F1 vs 0.558 baseline)
- Pipeline card: 3–5 stacked steps, last done step in `--accent-ink`
- Code card: a real short snippet from the repo in JetBrains Mono
