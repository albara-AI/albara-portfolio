# How to update the site

All text and data live in **`src/content.ts`**. Layout code never needs to change — the ring, grid, hero and buttons adapt to however many items you add.

Every change follows the same loop:

1. Put new photos in **`/photo`** (your raw files — never committed).
2. Approve them in **`scripts/approved.json`**, then run **`npm run assets`** → optimized copies land in `public/media/`.
3. Edit **`src/content.ts`** (and the matching line in `docs/CONTENT.md`).
4. Check with **`npm run dev`** → open the page, look at the browser console: it says `content.ts check: OK` or tells you exactly what's missing.
5. Commit.

> **Sensitive-data rule:** before approving any screenshot or video frame, check it for client names, emails, phone numbers, API keys, tokens or internal URLs. If in doubt, leave it out.

---

## Add an LLM project (the ring)

1. **Images** → `photo/projects/` (e.g. `myproject-1.png`). At least 1, ideally 3–4.
   From a video instead? Put it in `photo/videos/myproject.mp4`, run `npm run frames`, open `.work/contact-sheets/myproject*.jpg`, pick frame numbers, and copy their `time` from `.work/frames/myproject/frames.json`.
2. **Approve** — in `scripts/approved.json`, add one line per image to `"stills"`:
   ```json
   { "id": "myproject-1", "project": "myproject", "src": "photo/projects/myproject-1.png" }
   ```
   (video frames go in `"frames"`: `{ "id": "...", "project": "...", "video": "myproject", "sheet": 12, "time": 34.5 }`)
3. Run `npm run assets`.
4. **Content** — in `src/content.ts`, add an entry to `work.projects` (the order there = the ring order):
   ```ts
   {
     id: 'myproject',
     name: 'My Project',
     title: 'One-line title',
     meta: 'Role · dates',
     description: 'What it does — from the README or CV.',
     metric: 'Main result — from the README or CV',   // optional
     tags: ['FastAPI', 'RAG'],
     status: 'In progress',                           // optional → shows the badge
     repo: 'https://github.com/albara-AI/my-project', // optional → "View code"
     media: ['myproject-1', 'myproject-2'],
   },
   ```
5. **Alt text** — add one line per image to `alt` at the bottom of `content.ts`:
   `'myproject-1': 'What the image shows',`
6. Check (`npm run dev`), then commit:
   ```bash
   git add src/content.ts docs/CONTENT.md scripts/approved.json public/media
   git commit -m "Add My Project to LLM projects"
   ```

## Add a Data & ML project (the grid)

Same as above, with two differences:

- The entry goes in `data.projects`, and `media` is **one** id (not a list):
  ```ts
  { id: 'myproject', title: 'My Project', line: 'One line.', tags: ['SQL'], repo: '…', media: 'myproject-1' },
  ```
- **No image?** Leave `media` out — the card shows a designed text card with the `metric` (or the title) in big type.

## Add a skill (About → "I work with …")

1. In `src/content.ts`, add it to `about.skills` (the typewriter cycles them in order).
2. Add it to the skills line in `docs/CONTENT.md`.
3. Commit: `git add src/content.ts docs/CONTENT.md && git commit -m "Add skill: …"`

## Add a certificate

> Certificates aren't shown on the site yet (they're in ROADMAP → Future). Adding them now means they'll appear when that strip is built.

1. In `src/content.ts`, add to `certificates`:
   ```ts
   { name: 'Certificate name', issuer: 'Issuer', year: '2026', verifyUrl: 'https://…' },
   ```
2. Add the same line under "Education & Certifications" in `docs/CONTENT.md`.
3. Commit: `git add src/content.ts docs/CONTENT.md && git commit -m "Add certificate: …"`

## Add or change a contact link / button

Edit the `links` array in `src/content.ts` (order = button order; `primary: true` = the filled button; `external: true` = opens in a new tab). The hero and mobile menu show the ids listed in `hero.buttons`.

## Swap an image

- **Same file name:** replace the file in `/photo` (e.g. `photo/about/me-1.jpg`), run `npm run assets`, check, then:
  ```bash
  git add public/media && git commit -m "Update portrait photo"
  ```
- **New file name:** also change its `"src"` in `scripts/approved.json` (keep the same `"id"`, so `content.ts` doesn't change), then run `npm run assets` and commit `scripts/approved.json` too.
- **Remove an image:** delete its line from `approved.json` *and* its id from `content.ts`; `npm run assets` deletes the old files from `public/media`.

## Update the CV

Replace `photo/cv/Albara_Aljaber_CV.pdf`, then copy it over and commit:
```bash
cp photo/cv/Albara_Aljaber_CV.pdf public/cv/
git add public/cv && git commit -m "Update CV"
```

---

### Commands at a glance

| Command | What it does |
|---|---|
| `npm run dev` | Local site with live reload |
| `npm run assets` | Whole image pipeline: frames + contact sheets + generated images + export |
| `npm run export` | Just the export step (faster, when only `approved.json` changed) |
| `npm run build` | Production build — run before pushing to be sure nothing is broken |
