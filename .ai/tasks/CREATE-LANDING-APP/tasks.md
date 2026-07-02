## 1. Scaffold apps/landing application

- [x] 1.1 Initialize Vue 3 + Vite project in apps/landing
- [x] 1.2 Configure Tailwind CSS v4 with darkMode: 'selector'
- [x] 1.3 Set dev server port to 5174 in vite.config.ts
- [x] 1.4 Copy logo from apps/web/public/logo.png to apps/landing/public/logo.png
- [x] 1.5 Add dev:landing script to root package.json
- [x] 1.6 Verify pnpm install and dev server starts

## 2. Implement locale system

- [x] 2.1 Create translation objects (id.ts, en.ts) with all section keys
- [x] 2.2 Create useLocale composable with t(key) helper and localStorage persistence

## 3. Implement theme system

- [x] 3.1 Create useTheme composable with dark mode toggle, system preference detection, and localStorage persistence

## 4. Build landing page sections

- [x] 4.1 Build App.vue with Header (logo, locale toggle, theme toggle) and smooth-scroll navigation
- [x] 4.2 Build HeroSection component with headline, tagline, and CTA buttons linking to web app
- [x] 4.3 Build FeaturesSection component with feature card grid
- [x] 4.4 Build PricingSection component with pricing tier cards
- [x] 4.5 Build TestimonialsSection component with testimonial card grid
- [x] 4.6 Build FooterSection component with links and copyright
- [x] 4.7 Wire all sections into App.vue and set up VITE_WEB_BASE_URL env variable
