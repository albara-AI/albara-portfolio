import { defineConfig, type Plugin } from 'vite';
import { renderHero } from './src/sections/hero';
import { renderNotFound } from './src/pages/not-found';

/** Public address of the site, for absolute link-preview URLs (og:image must
 *  be absolute). Set SITE_URL yourself, or Vercel provides its production
 *  domain at build time. Empty locally → relative URLs. */
const SITE_URL = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
).replace(/\/$/, '');

/**
 * Preload the fonts the first screen needs (the serif name, its italic and
 * Inter body text). Without this the browser only finds them after the JS
 * has built the hero — which delayed the first paint of the name (LCP).
 * Runs on the production build only (file names are hashed there).
 */
function preloadFonts(patterns: RegExp[]): Plugin {
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (!ctx.bundle) return;
        const files = Object.keys(ctx.bundle).filter((f) => patterns.some((p) => p.test(f)));
        return files.map((f) => ({
          tag: 'link',
          attrs: { rel: 'preload', href: `/${f}`, as: 'font', type: 'font/woff2', crossorigin: '' },
          injectTo: 'head-prepend' as const,
        }));
      },
    },
  };
}

/**
 * Put each page's first-screen HTML straight into the HTML file at build
 * time, so it paints as soon as the CSS arrives — without waiting for the JS.
 * The page scripts see the filled element and leave it alone. (Dev renders
 * with JS as before, so edits to content.ts show up on reload.)
 */
function prerender(): Plugin {
  const fills: [string, () => string][] = [
    ['<section class="section hero" id="top" aria-label="Introduction"></section>', renderHero],
    ['<main class="notfound" id="notfound"></main>', renderNotFound],
  ];
  return {
    name: 'prerender',
    apply: 'build',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        for (const [empty, render] of fills) {
          const close = empty.slice(empty.lastIndexOf('</'));
          html = html.replace(empty, empty.replace(close, `${render()}${close}`));
        }
        return html;
      },
    },
  };
}

/** %SITE_URL% in the HTML → the public address (see SITE_URL above). */
function siteUrl(): Plugin {
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', SITE_URL),
  };
}

export default defineConfig({
  build: {
    // Never inline fonts into the CSS: the tiny glyph fonts (src/styles/glyphs.css)
    // would otherwise be embedded twice and block the first paint.
    assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined),
    rollupOptions: {
      // index.html + the 404 page (Vercel serves 404.html for unknown URLs)
      input: { main: 'index.html', notFound: '404.html' },
    },
  },
  plugins: [
    prerender(),
    siteUrl(),
    preloadFonts([
      /instrument-serif-latin-400-normal-[\w-]+\.woff2$/,
      /instrument-serif-latin-400-italic-[\w-]+\.woff2$/,
      /inter-latin-400-normal-[\w-]+\.woff2$/,
    ]),
  ],
});
