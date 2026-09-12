## Review Notes — GAN-130
Ticket: GAN-130
Agent: caf-reviewer
Verdict: APPROVE

### Security Audit
None. Multi-tenant scoping remains intact (`id: userMerchantId` is consistently enforced in Prisma queries). The `search` query parameter is strongly typed and validated with `class-validator` (`@IsOptional()`, `@IsString()`).

### Qualitative Review
- **Architecture & Design**: `MerchantsQueryDto` cleanly extends `PaginationDto`, adhering to NestJS DTO validation and OpenAPI/Swagger documentation patterns.
- **Service Implementation**: In `MerchantsService.findAll`, the search filter (`name: { contains: search }`) is applied cleanly to both `merchants.findMany` and `merchants.count` within the `$transaction` block.
- **Test Coverage**: Comprehensive unit test suite in `apps/api/src/merchants/merchants.service.spec.ts` covering `findAll` (with and without search parameter, custom pagination, and logo signed URL attachments) as well as all merchant CRUD endpoints.
- **Verification**: All 201 unit tests across 15 test suites pass, TypeScript type checking passes, ESLint passes with zero errors, and build completes successfully.

### Verdict Rationale
The implementation directly and elegantly addresses the issue where merchant list searching was not filtering results. Multi-tenant security rules are preserved, code follows existing project conventions, and unit tests provide complete coverage.

### For Developer
Great job on writing clean, modular DTOs and adding comprehensive test coverage for `MerchantsService`.
