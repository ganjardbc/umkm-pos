## Fix Review Log — GAN-68
Generated: 2026-08-19T05:03:45Z
Triggered by: global

### Comment 3806094086 [INLINE apps/api/src/users/users.controller.ts:48]
> **[CRITICAL]** The API contract specifies required permissions for multiple user endpoints (e.g., 'user.create' for POST, 'user.read' for GET /:id, 'user.update' for PATCH, and 'user.delete' for DELETE). However, the '@RequirePermission' decorator was only added to the 'GET /' (findAll) endpoint. Ensure all other endpoints in 'UsersController' are decorated with their respective required permissions to prevent unauthorized access.
Status: NOT_APPLICABLE
Catatan: Verified current `apps/api/src/users/users.controller.ts` — every endpoint already carries `@RequirePermission`: `create` → `user.create`, `findAll`/`findOne` → `user.read`, `update` → `user.update`, `remove` → `user.delete`, `setAvatar`/`removeAvatar` → `user.update`. `git log`/`git show` confirms only `findAll` was missing the decorator at the time this comment was posted (added in commit cf2ced8, "AI agent pipeline: GAN-68"); the base controller (commit 0a97f26) already had decorators on the other endpoints. Issue no longer present in HEAD. No code change made — duplicate root cause with comment 3810178447.

### Comment 3806094094 [INLINE apps/api/src/users/users.controller.spec.ts:44]
> **[WARNING]** The test passes 'merchantId' directly to 'controller.findAll'. If 'merchantId' is bound from request query parameters or body without validation, it could allow users to query data belonging to other merchants (BOLA/IDOR). Ensure that the controller validates that the authenticated user has access to the requested 'merchantId', or resolve it directly from the authenticated user's session/token.
Status: NOT_APPLICABLE
Catatan: In the real request path `findAll` resolves `merchantId` via `@CurrentUser('merchant_id')`, which is sourced from the JWT payload set by `JwtAuthGuard` — never from client-supplied query/body input. The unit test at line 44 calls `controller.findAll(merchantId, pagination)` directly (bypassing HTTP/guard layers) purely to assert the service is called with the right args; the hardcoded string there is test data, not a code path where merchant_id is client-controlled. No BOLA/IDOR risk in the actual controller. No code change made.

### Comment 3810178447 [INLINE apps/api/src/users/users.controller.ts:51]
> **[CRITICAL]** The API contract specifies required permissions for multiple endpoints (e.g., POST /users, GET /users/:id, PATCH /users/:id, DELETE /users/:id), but only GET /users has the @RequirePermission('user.read') decorator added. Ensure all other endpoints in this controller are decorated with their respective permissions to prevent unauthorized access.
Status: NOT_APPLICABLE
Catatan: Duplicate of comment 3806094086 — same root cause, already resolved. All endpoints in `UsersController` currently carry the correct `@RequirePermission` code (create=user.create, findOne/findAll=user.read, update/setAvatar/removeAvatar=user.update, remove=user.delete). Confirmed by reading current file and `git show cf2ced8` diff. No code change needed.

### Comment 3810178448 [INLINE apps/api/src/users/users.controller.spec.ts:95]
> **[WARNING]** The PermissionGuard appears to query the database (prisma.user_roles.findMany) on every request to check permissions. This introduces a significant performance bottleneck and database load. Consider caching user permissions (e.g., in Redis or JWT claims) to avoid querying the database on every API call.
Status: SKIPPED
Catatan: Valid architectural observation, but it targets `PermissionGuard`'s design (present since the original base commit 0a97f26, unrelated to the diff introduced by this ticket) rather than a defect. Introducing a caching layer (Redis or JWT-embedded permissions) is a cross-cutting infra change affecting every guarded module, out of scope for GAN-68's user-endpoint permission fix, and risks staleness bugs if not carefully invalidated on role/permission changes. Recommend tracking as a separate performance/tech-debt ticket rather than fixing inline here.

### Comment 3810178449 [INLINE apps/api/src/users/users.controller.spec.ts:77]
> **[WARNING]** If the request does not contain a user object (e.g., if the authentication guard is missing or fails), accessing request.user.id in the guard will throw a TypeError. Ensure the guard safely checks if request.user exists before accessing its properties (e.g., request.user?.id).
Status: NOT_APPLICABLE
Catatan: Verified `apps/api/src/common/guards/permission.guard.ts` — `user` is extracted from `request.user` and explicitly null-checked (`if (!user) { throw new ForbiddenException('User not authenticated'); }`) before `user.id` is ever accessed in the subsequent Prisma query. This guard clause predates this PR (unchanged since base commit 0a97f26). No TypeError risk exists in current code; the flagged spec line is just a test mock, not the guarded code path. No code change made.
