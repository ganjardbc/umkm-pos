## Context

A new `apps/landing/` application will be created in the monorepo as a standalone entry point for UMKM POS. It must be lightweight, fast, and visually consistent with the existing web app (`apps/web/`). The landing page links out to the web app's login and register pages — it does not implement auth itself.

## Goals / Non-Goals

**Goals:**
- Single-page landing app with Hero, Features, Pricing, Testimonials, Footer sections
- Responsive layout (mobile-first with Tailwind)
- Dark mode toggle (match web app's `darkMode: 'selector'` strategy)
- Bilingual toggle (Indonesian default, English fallback)
- CTA buttons linking to web app login/register (configurable base URL)
- Use same logo asset as web app
- Dev server on port 5174

**Non-Goals:**
- No vue-router (single page, scroll-based navigation)
- No auth implementation (delegated to web app)
- No API calls (static landing page)
- No shared package dependencies from the monorepo

## Decisions

1. **Framework: Vue 3 + Vite with Tailwind v4** — Same stack as `apps/web/` for developer familiarity and consistency. PrimeVue is optional — the page is simple enough to use pure Tailwind, avoiding the PrimeVue dependency.

2. **No vue-router** — Single page with smooth scroll to sections via anchor links. Simpler and sufficient for a landing page.

3. **Environment-based web app URL** — `VITE_WEB_BASE_URL` (default `http://localhost:5173`). Login link: `{VITE_WEB_BASE_URL}/`, Register: `{VITE_WEB_BASE_URL}/register`.

4. **Locale strategy** — Simple key-value translation objects per locale (`id`, `en`). A `useLocale` composable with a `t(key)` helper. Persisted in `localStorage` under `locale`.

5. **Dark mode strategy** — Tailwind `dark:` variant with `darkMode: 'selector'`. Toggle adds/removes `dark` class on `<html>`. Persisted in `localStorage` under `theme`.

6. **Logo** — Copy `apps/web/public/logo.png` to `apps/landing/public/logo.png` at scaffold time.

## Risks / Trade-offs

- **Logo duplication** — Copying the logo means it must be kept in sync with web app. Acceptable since the logo changes infrequently.
- **No shared translation system** — Translations are app-specific and simple enough for inline objects.
