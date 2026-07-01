## Why

UMKM POS needs a dedicated landing page as the public-facing entry point to introduce the product and direct visitors to login or register in the main web application. Currently there is no standalone landing presence.

## What Changes

- Create a new `apps/landing/` application in the monorepo (Vue 3 + Vite, same stack as `apps/web/`)
- Build a single landing page with Hero, Features, Pricing, Testimonials, and Footer sections
- Add navigation links to the existing web app's login (`/`) and register (`/register`) routes
- Add bilingual support (Indonesian/English) with a language toggle
- Add dark mode support with a toggle
- Use the existing logo asset from the web project
- Configure the landing app to run on its own dev server (port 5174)
- Register the new app in the pnpm workspace

## Capabilities

### New Capabilities
- `landing-page`: Single landing page for UMKM POS with hero section, features, pricing, testimonials, footer, and CTA links to login/register. Supports bilingual content (ID/EN) and dark mode.

### Modified Capabilities

None.

## Impact

- **New app**: `apps/landing/` — Vue 3 + Vite project with Tailwind CSS
- **pnpm workspace**: Auto-included via existing `apps/*` glob
- **Root scripts**: New `dev:landing` script in root `package.json`
- **No changes** to `apps/web/`, `apps/api/`, or any existing packages
