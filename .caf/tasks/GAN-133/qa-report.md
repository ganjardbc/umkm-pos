## QA Report — GAN-133
Ticket: GAN-133
Agent: caf-qa
Status: PASS

### Verification Matrix
| # | Acceptance Criteria (requirements.md) | How Verified | Result |
|---|---------------------------------------|--------------|--------|
| 1 | `GET /api/v1/users?search=keyword` filters users belonging to the merchant where `name`, `email`, or `username` contains `keyword`. | Unit test in `apps/api/src/users/users.service.spec.ts` (`should filter by search keyword across name, email, and username`) verifying Prisma `where` clause with `OR` contains query across `name`, `email`, and `username`; executed via `pnpm --filter umkm-pos-api test` | PASS |
| 2 | `GET /api/v1/users` without `search` continues to paginate all users for the merchant. | Unit test in `apps/api/src/users/users.service.spec.ts` (`should return paginated users without search query`) verifying default pagination without `OR` filter; executed via `pnpm --filter umkm-pos-api test` | PASS |
| 3 | All queries remain strictly scoped to the authenticated user's `merchant_id`. | Unit tests in `apps/api/src/users/users.service.spec.ts` and code inspection of `apps/api/src/users/users.service.ts:40-49` verifying `merchant_id: merchantId` in Prisma `where` clause; executed via `pnpm --filter umkm-pos-api test` | PASS |
| 4 | User typing into search input in web UI triggers debounced API call with `search` query and updates the displayed user list. | Code inspection in `apps/web/src/modules/user/pages/index.vue:5-11, 151-175, 247-255` verifying `UiSearch` binding with 400ms `useDebounce`, page reset to 1, and `search` query parameter inclusion in `fetchUser()` and `getListUser()`; verified via `pnpm build` | PASS |

### Findings
None

### Notes
- All backend unit tests (16 test suites, 192 tests) passed.
- Monorepo build, lint, and typecheck all completed with 0 errors.
- Swagger documentation added via `@ApiPropertyOptional` on `UsersQueryDto`.
