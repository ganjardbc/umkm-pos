## Review Notes — GAN-124
Ticket: GAN-124
Agent: caf-reviewer
Verdict: APPROVE

### Security Audit
None. This is a pure UI-text change set (labels, placeholders, validation messages, toasts, breadcrumbs, route meta titles, chart labels/tooltips) across `apps/web`. No new endpoints, no changes to auth/permission logic, no user input handling changes, no dependency changes. Re-ran `pnpm --filter umkm-pos-app build` locally to confirm `vue-tsc -b && vite build` completes with 0 errors, matching verify-report.md/qa-report.md; working tree stayed clean afterward (no stray generated-file diffs).

### Qualitative Review
- Coverage matches `requirements.md` scope: auth login/register, profile, dashboard (page + all chart components + stat cards), settings (all 5 sub-pages + constants + router breadcrumbs), and 403/404 error pages + their route meta titles. Verified diff file-by-file against the requirements checklist — all items present.
- Glossary terms preserved correctly: `export`/`import`/`upload`/`download`/`barcode`/`QR code`/`invoice` are untouched or explicitly kept English in translated strings (e.g. `console.error('Export gagal:', ...)` keeps "Export" in English, only "gagal" added).
- Terminology is consistent across modules: "Kata Sandi" for password, "Batal" for cancel, "Simpan" family for save, "Beranda" for breadcrumb home, "Berhasil"/"Gagal" for toast success/error — used uniformly in auth, profile, settings.
- Date locale in `DailyReportsChart.vue` was changed from `toLocaleDateString('en-US', ...)` to `'id-ID'` for x-axis labels. This is a reasonable and arguably necessary companion change (an ID-wording chart with US-formatted dates would look inconsistent) and is covered by the existing build/QA pass; flagging only so this locale-format decision is on record as intentional, not an oversight.
- Two minor wording/polish nits (non-blocking):
  1. `apps/web/src/modules/settings/pages/change-email.vue` line ~111: countdown text was translated as `` `Kirim ulang dalam ${resendCountdown}d` `` (from `` `Resend in ${resendCountdown}s` ``). The trailing `d` is ambiguous in Indonesian (could read as "hari"/days abbreviation rather than seconds/"detik"). Suggest `${resendCountdown} detik` or `${resendCountdown} dtk` for clarity — cosmetic, not a functional bug since `s`→`d` is literally a countdown value shown correctly regardless of suffix.
  2. `site-settings.vue` still shows the English word "Reset" in the button label, dialog header ("Reset Pengaturan"), and `acceptLabel: 'Reset'` for the settings-reset confirm dialog. "Reset" isn't in the preserved-glossary list; a more idiomatic label would be "Atur Ulang". Low priority, commonly understood loanword in Indonesian tech UI.
- Incidental/out-of-scope diff noise: `apps/web/components.d.ts` (an auto-generated `unplugin-vue-components` declaration file) has cosmetic comment-line changes (`// oxlint-disable`, `// ------`, and a moved `biome-ignore` comment) unrelated to the wording ticket. Harmless (no type-level changes, still `export {}` + same component map), but ideally would have been left untouched or reverted — likely a side effect of a local generator/tooling run getting committed alongside the intended edits.
- `apps/web/src/modules/dashboard/pages/overview.vue` still contains English strings (e.g. "Please select both start and end dates", `title="Dashboard Overview"`). Confirmed via `grep` that this file is not referenced in `dashboard/router/index.ts` (dead/unrouted file), so it's outside the reachable UI surface and outside the ticket's explicit file list in `requirements.md`. Not a blocker, but worth a follow-up ticket or cleanup decision (delete unused file vs. translate it) so it doesn't cause confusion later.

### Verdict Rationale
The diff is scoped exactly to the ticket's stated modules, preserves the glossary, keeps terminology internally consistent, doesn't touch layout/CSS/API/functional logic (only one locale-format tweak for date labels, which is a reasonable and low-risk companion to the wording change), and both an independent local rebuild and the prior verify/QA reports confirm typecheck + build pass. The only findings are cosmetic (a translation nit, one untranslated loanword, incidental generated-file comment diff, and a pre-existing unrouted file with stale English text) — none block merge.

### For Developer
- Optional polish before/after merge: fix the `${resendCountdown}d` suffix in `change-email.vue` to something unambiguous like "detik", and consider "Atur Ulang" instead of "Reset" in `site-settings.vue` for full Indonesian consistency.
- Consider reverting the incidental `apps/web/components.d.ts` comment changes if they weren't intentional, to keep the diff minimal and generated-file churn out of the PR.
- `dashboard/pages/overview.vue` is unrouted and still in English — recommend a follow-up decision (delete vs. translate) rather than silently leaving stale/dead UI text in the codebase.
