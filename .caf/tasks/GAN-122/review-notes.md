## Review Notes — GAN-122
Ticket: GAN-122
Agent: caf-reviewer
Verdict: APPROVE

### Security Audit
None. All RBAC permission checks (`isCanCreate`, `isCanUpdate`, `isCanDelete`) via `isHasPermission()` are maintained and correctly bound to respective UI buttons. Search parameter handling is safely bound. No insecure code or data exposure was introduced.

### Qualitative Review
- **Architecture & Component Consistency**: Clean refactor replacing PrimeVue's `<DataTable>` with a responsive grid layout using `<UiCard>` components (`grid gap-4 lg:grid-cols-2 xl:grid-cols-3`), following existing patterns seen across other card-based modules.
- **Loading & Empty State UX**: Standard `<UiLoading>` component is displayed during fetching, and a styled fallback message ("Merchants are empty." with icon) is cleanly presented when the list is empty.
- **Search & Pagination**: Search input includes debouncing (300ms) with page reset, and `<UiPagination>` works seamlessly with reactive page metadata.
- **Edge Cases & Fallbacks**: Image fallback with placeholder icon handles merchants without logos gracefully. Card headers properly handle long merchant names with text truncation.
- **Build Verification**: Tested with `vue-tsc -b && vite build` — passed cleanly with 0 TypeScript/template errors.

### Verdict Rationale
The implementation strictly fulfills all requirements stated in `requirements.md` without regression. Code quality is clean, readable, and follows the project conventions. Both `verify-report.md` and `qa-report.md` are marked SUCCESS.

### For Developer
No further action needed. Ready for merge.
