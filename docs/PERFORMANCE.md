# PERFORMANCE.md — budgets every phase must respect

## Budgets
- First screen visible: < 2.5s on 4G (LCP). Total initial load: ≤ 1.5 MB.
- JS (gzipped): ≤ 120 KB. Lighthouse Performance ≥ 90 (mobile), Accessibility ≥ 95.
- Images: WebP, long side ≤ 1600px (cards ≤ 800px), each ≤ 250 KB.
- Video loops: ≤ 1.5 MB each, muted, `playsinline`, `preload="none"` + poster; play only when visible/active.

## Rules
- Lazy-load everything below the hero; hero loads low-res thumbs first.
- Animate only `transform` and `opacity`. Use `will-change` only on moving elements.
- No layout reads inside scroll handlers (cache sizes on resize).
- Mobile (< 820px): hero photos smaller, carousel cards ~78vw (LLM) / ~70vw (data), no hover effects.
- `prefers-reduced-motion: reduce` → static layouts, no smooth scroll, no autoplay.
- GitHub + CV links must be reachable within the first two screens (nav + hero) — recruiters skim.
- Every image has meaningful `alt`. Text contrast ≥ 4.5:1 (use `--accent-ink`, not `--accent`, for text on paper).
