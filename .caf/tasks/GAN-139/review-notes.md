## Review Notes — GAN-139
Ticket: GAN-139
Agent: caf-reviewer
Verdict: APPROVE

### Security Audit
None. The changes only affect frontend slug sanitization, enabling user input on the slug field, and client-side Zod validation matching backend constraints (`/^[a-z0-9-]+$/`). No tenant boundary or data leakage risks identified.

### Qualitative Review
- **Shared Helper Quality**: `slugify` helper implemented in `packages/ui/src/helpers/utils.ts` correctly handles case conversion, stripping disallowed characters (including underscores), collapsing multiple spaces/hyphens into single hyphens, and trimming leading/trailing hyphens. It is properly exported and accessible across workspace packages.
- **Form UX & Validation**: Unlocking `readonly` and `disabled` on slug inputs in `apps/admin/src/modules/merchants/pages/create.vue`, `apps/admin/src/modules/outlet/pages/create.vue`, and `apps/merchant/src/modules/outlet/pages/create.vue` allows users to edit generated slugs while Zod schemas ensure invalid formats are blocked on the client side before hitting API endpoints.
- **Scope Discipline**: Changes are cleanly scoped strictly to the four files designated in requirements and task specs. No unrelated modifications or drive-by refactorings were introduced.

### Verdict Rationale
All acceptance criteria outlined in `requirements.md` have been met and verified:
1. `packages/ui/src/helpers/utils.ts` exports `slugify` which sanitizes strings to match `^[a-z0-9-]+$`.
2. Form inputs for slug in admin (merchants and outlet creation) and merchant app (outlet creation) are editable, utilize the shared `slugify` helper, and enforce regex validation via Zod.
3. Typecheck on `@umkm-pos/ui` and production builds on `@umkm-pos/admin` and `@umkm-pos/merchant` completed with 0 errors.

### For Developer
No further actions required for this ticket. The implementation is clean, follows monorepo conventions, and is ready for merge.
