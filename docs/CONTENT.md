# CONTENT.md — the only source of truth for text

Rules: English site. Use this text as written. Numbers only from the CV (`photo/cv/`) or a project README. Missing → `TODO:` + ask Albara.

## Identity
- Name: Albara Aljaber
- Role line: AI Engineer — LLMs · RAG · Arabic NLP
- Hero sentence: "AI Engineer — I build AI systems end to end: LLMs, RAG, NLP, and the tested backends that ship them."
- Intro (hero bottom-left): "Portfolio — 2026" / "I build AI systems — from raw data to production backends."
- Hero photos (fly-through, in this order): `photo/about/me-2`, `me-3`, `me-4`, `me-5` — personal/event photos only, no project screenshots. Alt text: me-2/me-3 "Albara at the World Investment Forum 2026 in Doha", me-4 "Albara's World Investment Forum 2026 badge, UNCTAD", me-5 "Event screen at the World Investment Forum 2026, Doha".
- Location: Doha, Qatar

## About
- Heading: "Engineer by training, *builder* by habit."
- P1: "Data Science & AI graduate from the Hashemite University, based in Doha. I build end-to-end AI systems — from data ingestion and OCR to fine-tuned transformers, RAG pipelines and production-style FastAPI backends."
- P2: "I care about the parts most demos skip: evaluation, cost control, safety and tests."
- Facts: `0.769` Macro-F1 · AL-BAYAN# | `185` Tests · FlyRank | `Doha` Based in

## LLM projects (ring, in this order)

### 01 FlyRank Capstone — Backend AI Engineering Intern (Jul 2026 – Nov 2026)
- Title: Multi-tenant AI platform
- Description: "Embeddable lead-capture platform with an LLM layer: Gemini → Groq → rule-engine fallback chain, PII redaction before every LLM call, per-call cost attribution and daily quotas."
- Key metric: 185 automated tests on real PostgreSQL
- Tags: FastAPI · PostgreSQL · LLMs · Docker
- Media: frames/clips from `photo/videos/flyrank.mp4` + any `photo/projects/flyrank-*`
- Extra (from CV): 83-message Arabic evaluation set and harness to benchmark LLM providers. (No accuracy number on the site.)
- Repo: https://github.com/albara-AI/flyrank-capstone-widget-platform (public)

### 02 Mini-RAG — AI legal assistant for Qatari law (in progress)
- Description: "RAG system for Qatari legal documents — upload API, mixed Arabic–English PDF loading and configurable chunking with overlap. Embeddings and vector search are next."
- Tags: FastAPI · LangChain · MongoDB · Docker
- Status badge: In progress
- Media: `photo/projects/minirag-pipeline.png` (generated from repo structure)
- Repo: https://github.com/albara-AI/Mini-rag

### 03 AL-BAYAN# — Legal document intelligence (graduation project, 2026)
- Description: "End-to-end pipeline: scrapes Official Gazette PDFs, extracts Arabic text with OCR, and classifies documents across 17 legal sectors with a 3-model transformer ensemble."
- Key metric: Macro-F1 0.769 vs 0.558 TF-IDF baseline (+38%)
- Tags: PyTorch · Transformers · RAG · OCR
- Extra (from README): Focal Loss, Hard Negative Mining, per-label thresholds; tag generation with AraT5 + InfoNCE bi-encoder + RAG fallback. Presented at Hashemite University Scientific Day (June 2026), five-member team.
- Media: frames/clips from `photo/videos/albayan.mp4` + `photo/projects/albayan-results-1.png`, `albayan-results-2.png`, `albayan-pipeline.png`
- Repo: https://github.com/albara-AI/arabic-legal-classifier (README copy in `reference/README-albayan.md`)

## Data & ML projects (2×2 grid, in this order)
For each: text from the CV ("Additional projects") or the repo README; numbers only from those. AlexNet was removed (not in the CV; README accuracy ~12%) — 4 projects for the 2×2 grid.
1. Power BI — Olist E-commerce Sales Dashboard
   - Title: Olist E-commerce Sales Dashboard
   - Data: Kaggle Olist Brazilian e-commerce data (9 tables).
   - Pipeline: discovery → cleaning → transformation → integration; remodeled 9 tables into a star schema (1 fact + 5 dimension tables).
   - Report: interactive Power BI report with KPI cards for sales, profit, cost and quantity; filters by date, seller, order status and state. (No KPI numbers on the site until the unfiltered screenshot replaces the current image.)
   - Tags: Power BI · DAX · Star schema · Data cleaning
   - Media: `photo/projects/powerbi-1-1.png` (temporary — filtered view, state = AC; Albara will replace it)
2. Semi-supervised Fashion-MNIST Classifier — "Semi-supervised Fashion-MNIST classifier (TensorFlow, 83.66% test accuracy with 960 labels)." (CV wording)
   - Key metric: 83.66% test accuracy with 960 labels
   - Tags: TensorFlow · Autoencoder · Pseudo-labeling (from README)
   - Source: `photo/projects/ssl_fashion_mnist_best/` (real folder name; ignore its .git)
   - Media: the pipeline screenshot + `plots/05_confusion_matrix.png` (approved)
   - Repo: https://github.com/albara-AI/fashion-mnist-ssl
3. IMDb Top-250 Scraper — "IMDb Top-250 scraper (Selenium, BeautifulSoup, SQLite)." (CV wording; README agrees: scrape → clean → SQLite → SQL queries. No result number.)
   - Tags: Selenium · BeautifulSoup · SQLite
   - Repo: https://github.com/albara-AI/imdb-top250-scraper
4. CO₂ & Loan-Approval Models — "Predictive models validated with 10-fold cross-validation." (README has no result numbers → designed pipeline card.)
   - Repo: https://github.com/albara-AI/ml-co2-loan-analysis
If a project has no image → designed card (metric / pipeline / code) per DESIGN.md, using README data only.

## Contact
- Heading: "Let's build something *intelligent*."
- Download CV: `/cv/Albara_Aljaber_CV.pdf` (copied from `photo/cv/`), `download` attribute, filename `Albara_Aljaber_CV.pdf`
- WhatsApp: `https://wa.me/97431066519?text=` + URL-encoded "Hi Albara, I came across your portfolio and would like to talk." (number and English message confirmed by Albara)
- Email: albaraaljaberwork@gmail.com — `mailto:` link + visible text + Copy button
- LinkedIn: https://linkedin.com/in/albara-aljaber
- GitHub: https://github.com/albara-AI
- Footer: © 2026 Albara Aljaber · Doha, Qatar

## Meta / SEO
- Title: Albara Aljaber — AI Engineer (LLMs · RAG · Arabic NLP)
- Description: AI Engineer in Doha building end-to-end LLM, RAG and NLP systems.
- OG image: generate 1200×630 in site style (name + role on `--paper`).
