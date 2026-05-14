# Repository Guidelines

## Project Structure & Module Organization
This is a NestJS + Prisma API for UMKM POS. Main code lives in `src/`, organized by feature modules (`auth`, `products`, `transactions`, `shifts`, `reports`, etc.).
- Controllers/services/DTOs are colocated per module: `src/<module>/` and `src/<module>/dto/`.
- Shared cross-cutting utilities are in `src/common/` (guards, decorators, filters, pipes, interceptors).
- Database schema and seed live in `prisma/` (`schema.prisma`, `seed.ts`), while SQL migration notes/scripts are in `migrations/` and `prisma/migrations/`.
- Unit/integration specs are mostly `*.spec.ts` inside `src/`; end-to-end tests are in `test/`.

## Build, Test, and Development Commands
Use `pnpm` in this repository.
- `pnpm start:dev`: run API in watch mode for local development.
- `pnpm build`: compile TypeScript into `dist/`.
- `pnpm start:prod`: run compiled app from `dist/main`.
- `pnpm lint`: run ESLint (with `--fix`) on `src` and `test`.
- `pnpm format`: format `src/**/*.ts` and `test/**/*.ts` with Prettier.
- `pnpm test`: run unit/spec tests.
- `pnpm test:cov`: run tests with coverage output in `coverage/`.
- `pnpm test:e2e`: run e2e suite using `test/jest-e2e.json`.

## Coding Style & Naming Conventions
TypeScript style is enforced by ESLint + Prettier.
- Prettier: single quotes, trailing commas (`.prettierrc`).
- Indentation: follow Prettier defaults (2 spaces).
- Filenames: kebab-case (`create-shift.dto.ts`, `jwt-auth.guard.ts`).
- Nest patterns: `*.controller.ts`, `*.service.ts`, `*.module.ts`, DTOs under `dto/`.
- Prefer explicit DTO validation and keep business logic in services, not controllers.

## Testing Guidelines
- Framework: Jest (`*.spec.ts` in `src`, e2e in `test/*.e2e-spec.ts`).
- Keep tests near feature code when possible.
- Name specs by behavior, e.g., `shifts.service.spec.ts`.
- Before PR: run `pnpm lint && pnpm test && pnpm test:e2e` for backend-impacting changes.

## Commit & Pull Request Guidelines
Git history follows Conventional Commit style:
- Examples: `feat(products): ...`, `fix(shifts): ...`, `docs: ...`, `style(rbac): ...`, `chore: ...`.
- Use format: `<type>(<scope>): <summary>` with concise, imperative summaries.

PRs should include:
- Clear description of behavior changes and affected modules.
- Linked issue/task reference.
- Test evidence (commands run, coverage impact, or API test proof via Postman/cURL).
- Migration notes when schema or SQL changes are included.

## Security & Configuration Tips
- Do not commit real secrets; copy `.env.example` to `.env` for local setup.
- Re-check `ENV_GUIDE.md`, `DATABASE_CONFIG.md`, and `ARCHITECTURE.md` before changing auth, DB, or multi-outlet logic.
