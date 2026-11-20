# DESIGN.md

## Direction
Editorial magazine feel, not a tech demo. Soul comes from: real images, big serif type, lots of empty space, slow soft motion. Reference: `reference/prototype.html` (approved).

## Colors (light, Olist-based)
| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F2F0EB` | page background |
| `--paper-2` | `#E8E5DD` | cards, panels |
| `--ink` | `#1A1A2E` | text, dark section background, buttons |
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
- `prefers-reduced-motion: reduce` → no Lenis, no fly-through, no ring rotation; show static, readable layouts.

## Sections (in order)

### 1. Hero — fly-through
- Sticky full-screen stage, section height ~340vh, `perspective: 900px`.
- ~18–20 media cards (frames from the FlyRank and AL-BAYAN# videos, generated result images, Power BI screenshots) scattered in x/y, spread deep in z.
- Scrolling moves them toward the camera; each fades out as it passes. Center area kept clear.
- At ~55–85% progress the name fades/scales in: "Albara / *Aljaber*" + one-line role.
- Start state: small intro bottom-left ("Portfolio — 2026" + one sentence) and a "Scroll" hint bottom-right; both fade out in the first 12%.

### 2. About — split screen
- Left: label, big serif heading (word reveal), 2 short paragraphs, 3 metric facts (big serif number + mono label).
- Right: tall portrait (`photo/about/me-1`) with clip-path opening on scroll (`inset(12% 8%)` → `inset(0)`) and slow parallax inside.

### 3. LLM projects — the ring (heart of the site)
- Sticky stage, section ~520vh, slight `rotateX(14deg)` tilt.
- Cards (220×290px desktop, 160×210 mobile) on a large arc; scroll rotates the arc so cards pass through top-center. Active card scales to ~1.18.
- Cards = media of the 3 LLM projects, ~3 cards per project (frames/clips/result images), grouped by project in order: FlyRank Capstone → Mini-RAG → AL-BAYAN#.
- Below the ring: info panel for the project of the active card — index `01 / 03`, serif title, description, key metric, tech tags, "View code" link. Cross-fades on change.
- Active card may play its muted looping clip (if it has one); others show a still poster.
- Clicking a card scrolls to it.

### 4. Data & ML — calmer grid
- No ring (don't repeat the same motion). 2×2 grid of large cards on `--paper-2`, staggered reveal + slight 3D tilt on hover (max 6deg, follows cursor).
- Order: Power BI Dashboard → IMDb Warehouse → CO₂ & Loan Models → AlexNet Classifier.
- Card = image (or designed metric/pipeline/code card if no image) + title + one line + tags.

### 5. Moments
- Dark section (`--ink` bg, `--paper` text). Albara's event/about photos (me-2 … me-5).
- Horizontal track moved by vertical scroll (sticky stage); photos reveal with clip-path from top. Mono caption per photo (event name, place, year — from CONTENT.md).

### 6. Contact
- Huge serif line: "Let's build something *intelligent*."
- Buttons (one primary, rest ghost): Download CV · WhatsApp · Email · LinkedIn · GitHub. Details in CONTENT.md.
- Email shown as text with a Copy button (shows "Copied" for 2s).
- Footer: © 2026 Albara Aljaber · Doha, Qatar.

## Nav
Fixed top bar, `mix-blend-mode: difference`, mono labels: name left; About · Work · Data · Contact right (hidden on mobile, replaced by a minimal menu). Links smooth-scroll via Lenis.

## Designed cards (for projects without images)
Same 3:4 card, `--paper-2` background, mono label top-left (`02 — PROJECT`):
- Metric card: one big serif number + label (e.g. `0.769` / Macro-F1 vs 0.558 baseline)
- Pipeline card: 3–5 stacked steps, last done step in `--accent-ink`
- Code card: a real short snippet from the repo in JetBrains Mono
