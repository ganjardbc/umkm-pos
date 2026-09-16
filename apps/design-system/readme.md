# Insell Design System

Insell (insell.id) is a SaaS point-of-sale platform for Indonesian UMKM
(micro/small/medium businesses) — cafés, oleh-oleh (souvenir/gift) shops,
agro-tourism venues, and multi-outlet merchants. Positioning: *"simple
enough for a UMKM to run day one, serious enough for a growing business"* —
approachable and trustworthy, with the operational credibility of a
fintech app. Not playful/gimmicky, not stiff enterprise software.

Sources: brand colors and logo were supplied directly by the product team
(no attached codebase or Figma file). This system is authored from those
inputs plus the brief's structural spec — there is no existing UI to
cross-reference, so component designs here are original, built to spec.

## Index
- `styles.css` — single entry point, imports everything in `tokens/`
- `theme.json` — machine-readable mirror of every token
- `tokens/` — colors, typography, spacing, elevation, motion
- `assets/logo/` — logo lockup + icon badge (as supplied)
- `guidelines/` — foundation specimen cards (Colors, Type, Iconography, Layout, Elevation, Motion, Image, Logo, Dark mode)
- `components/` — Button, Form, Card, Badge/Tag, Navbar, Sidebar, Tabs, Dropdown, Modal, Alert, Toast, Tooltip, Table, StatCard, Progress, Breadcrumb, Pagination, Avatar, EmptyState
- `social/` — Instagram/TikTok carousel canvas templates (1080×1350): cover, detail, closing
- `preview.html` — single-page tour of every foundation and component

## Content fundamentals
- Bilingual-ready: UI copy defaults to Bahasa Indonesia for merchant-facing
  product surfaces (dashboard, POS), plain English is fine for this
  system's own documentation.
- Tone: direct, plain-spoken, competent — like a good accountant, not a
  hype-y startup. No exclamation-mark marketing voice in product UI.
- No emoji in product UI. Emoji may appear sparingly in social captions only.
- Numbers and currency (Rupiah) are shown precisely — this is transactional
  software; never round or approximate in a way that reads as sloppy.

## Visual foundations
- **Color**: one warm primary ramp (orange, brand-fixed at 50/500/600/700)
  and one neutral ramp running cream → navy, used for both light-mode
  ink/borders and dark-mode surfaces (dark mode is a navy tonal shift of
  the same ramp, never generic gray). Semantic colors (success/warning/
  error/info) share primary's lightness/chroma character but vary hue, so
  the accent language stays consistent.
- **Type**: Manrope for display/headings (rounded-geometric, echoes the
  circular badge mark), Inter for body/UI/data (neutral grotesk, holds up
  in dense tables and numerals).
- **Backgrounds**: flat color fields and cream/white surfaces — no
  gradients except the brand mark itself and hero accents on the
  on-ground (primary-field) context. No textures, no illustration
  patterns.
- **Elevation**: soft, navy-tinted shadows (never pure black) at 5 steps;
  cards default to a 1px border + shadow-sm, not shadow alone.
- **Motion**: fast, purposeful — 150–220ms standard ease for hover/press,
  a slight spring only on confirmatory actions (toast enter, success
  states). No bounce on everyday interactions.
- **Radius**: 10px default for cards/inputs, 6px for compact controls
  (tags, small buttons), pill (999px) for badges/status chips.
- **Imagery**: real product photography (food, retail shelves, POS
  hardware) — warm, natural light, no heavy filters. Placeholder blocks
  use striped SVG fills with a monospace caption until real photography
  lands.
- **Hover/press**: hover = one step darker on solid fills, background
  tint on ghost/soft controls; press = one step darker again, no scale/
  shrink.

## Iconography
No icon set was supplied. This system specifies **Lucide** (stroke icons,
1.5–2px stroke, rounded joins) loaded via CDN as the default — its
rounded stroke terminals match Manrope's rounded-geometric character
better than a sharp/mono icon set. Substitution is flagged here for the
product team to confirm or replace.

## Logo usage
- Two lockups are supplied: full wordmark (`insell-logo.png`, badge + "sell.id")
  and the icon-only badge (`insell-icon.png`).
- Clear space: keep at least the height of the badge circle as empty
  margin on all sides of either lockup.
- Minimum size: full lockup no smaller than 96px wide; icon badge no
  smaller than 24px (favicon/avatar use only below 32px).
- Never recolor the gradient, never place the full-color mark on a busy
  photo without a solid or scrim behind it. On the on-ground (primary)
  context, use the white-knockout icon only (see `guidelines/logo.html`).

## Dark mode
`.dark` on any container. Surfaces and borders are derived from the navy
end of the neutral ramp (`--color-neutral-800/900`), not a generic gray
scale — text drops to `--color-neutral-25/200`, and the primary ramp
shifts one step lighter (400) for AA contrast on dark surfaces.
