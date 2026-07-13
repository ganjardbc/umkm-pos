# Graph Report - .  (2026-07-13)

## Corpus Check
- Large corpus: 848 files · ~436,325 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 4143 nodes · 7864 edges · 316 communities (223 shown, 93 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 218 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Backend Rbac Module
- Frontend Role Module
- Frontend Product Lists Module
- Frontend Settings Module
- Backend Settings Module
- Backend Products Categories Module
- Frontend Outlet Module
- Frontend Product Lists Module
- Frontend Role Module
- Frontend Settings Module
- Frontend Transaction Module
- Frontend Transaction Module
- Backend Audit Logs Module
- Frontend Product Categories Module
- Frontend Auth Module
- 
- Backend Reports Module
- Backend Shifts Module
- Frontend Merchants Module
- Backend Shifts Module
- Frontend User Module
- 
- Frontend User Module
- Backend Outlets Module
- Backend Stock Module
- Frontend Reports Module
- Frontend Dashboard Helpers Module
- Community 27
- Backend Uploads Module
- Frontend Dashboard Module
- Backend Notifications Module
- Backend Merchants Module
- Backend Products Categories Module
- Frontend Shift Module
- Backend Users Module
- Backend Uploads Module
- Community 36
- Frontend Dashboard Module
- Frontend Transaction Module
- Community 39
- Community 40
- Backend Shifts Module
- 
- Backend Transactions Module
- Backend Store Tables Module
- Community 45
- Community 46
- Frontend Shift Module
- 
- Backend Products Module
- Backend Users Module
- Frontend Notification Module
- Backend Products Module
- Frontend Dashboard Module
- Community 54
- Community 55
- Community 56
- Frontend Composables Module
- Frontend Dashboard Module
- Frontend Dashboard Module
- Community 60
- Community 61
- Frontend Customer Catalog Module
- Frontend Transaction Module
- 
- 
- 
- Backend Customer Catalog Module
- Backend Metrics Module
- Frontend Product Lists Module
- Frontend Transaction Module
- 
- 
- Backend Customer Catalog Module
- Backend Merchants Module
- Backend Store Tables Module
- Frontend Transaction Module
- Frontend Shift Module
- Community 78
- Backend Customer Catalog Module
- Backend Transactions Module
- Community 81
- Frontend Pos Module
- Frontend Customer Catalog Module
- Frontend Dashboard Module
- Community 85
- 
- Backend Auth Module
- Backend Transactions Module
- Community 89
- Frontend Dashboard Module
- 
- 
- Backend Auth Module
- Frontend Shift Module
- Frontend Components Module
- Community 96
- 
- 
- Community 99
- Backend Audit Logs Module
- Frontend Components Module
- 
- Community 103
- Frontend Customer Catalog Module
- Frontend Customer Catalog Module
- Frontend Dashboard Module
- 
- Community 108
- Community 109
- Frontend Shift Module
- Community 111
- 
- 
- 
- Backend App Module
- Backend Transactions Module
- Frontend Components Module
- Frontend Merchants Module
- Frontend Notification Module
- Frontend Outlet Module
- Frontend Permission Module
- Frontend Product Categories Module
- Frontend Product Lists Module
- Frontend Profile Module
- Frontend Reports Module
- Frontend Role Module
- Frontend Settings Module
- Frontend Stock Module
- Frontend User Module
- Community 130
- Backend App Module
- Backend Auth Module
- Backend Outlets Module
- Backend Transaction Items Module
- Community 135
- 
- Community 137
- Frontend Customer Catalog Module
- Frontend Outlet Module
- Community 140
- Community 141
- Backend Auth Module
- Community 143
- Frontend Customer Catalog Module
- Frontend Transaction Module
- 
- 
- Community 148
- Frontend Dashboard Module
- Frontend Transaction Module
- Community 151
- Community 152
- 
- 
- Community 155
- Community 156
- Backend Audit Logs Module
- Backend Transactions Module
- Community 159
- Community 160
- Frontend Customer Catalog Module
- Frontend Helpers Module
- Community 163
- Community 164
- Community 165
- Community 166
- Backend Shifts Module
- Backend Transaction Items Module
- Frontend Components Module
- Frontend Components Module
- 
- Community 172
- Community 173
- Community 174
- Community 175
- Community 176
- Frontend Components Module
- Frontend Reports Module
- Community 179
- Community 181
- Community 182
- Community 183
- Community 184
- Frontend Components Module
- Frontend Customer Catalog Module
- Frontend Notification Module
- Frontend Permission Module
- Frontend Product Module
- Frontend Reports Module
- Frontend Role Module
- Frontend Shift Module
- Frontend Shift Module
- Frontend Stock Module
- Frontend Transaction Module
- Frontend User Module
- Community 197
- Community 198
- Community 199
- Community 200
- Community 201
- 
- 
- Community 204
- Community 205
- Community 206
- Community 207
- Community 208
- Community 209
- Community 210
- Community 211
- Community 212
- Community 213
- Community 214
- 
- Community 216
- Community 217
- Community 218
- Community 219
- Community 220
- Community 221
- Community 222
- Community 223
- Community 224
- Community 225
- Community 226
- Community 227
- Community 228
- Community 229
- Community 230
- Community 231
- Community 232
- Community 233
- Community 234
- Community 235
- Community 236
- Community 237
- Community 238
- Community 239
- Community 240
- Community 241
- Community 242
- Community 243
- Community 244
- Community 245
- Community 246
- Community 247
- Community 248
- Community 249
- Community 250
- Community 251
- Community 252
- Community 253
- Community 254
- Community 255
- Community 256
- Backend Common Interfaces Module
- Backend Shifts Module
- Community 259
- Community 260
- Community 261
- Community 262
- Community 263
- Community 264
- Community 265
- Community 266
- Community 267
- Community 268
- Community 269
- Community 270
- Community 271
- Community 272
- Community 273
- Community 274
- Community 275
- Frontend Profile Module
- Community 280
- Community 281
- Community 282
- Community 284
- Community 285
- Community 291
- Community 292
- Community 293
- Community 294
- Community 301

## God Nodes (most connected - your core abstractions)
1. `showToast()` - 157 edges
2. `getErrorMessage()` - 137 edges
3. `RequirePermission()` - 120 edges
4. `CurrentUser` - 113 edges
5. `PrismaService` - 80 edges
6. `showLoading` - 68 edges
7. `hideLoading` - 68 edges
8. `PaginationDto` - 53 edges
9. `showConfirm()` - 46 edges
10. `getOutlet()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `NestJS Guidelines — WisataPOS` --references--> `@nestjs/swagger`  [EXTRACTED]
  docs/backend/nestjs-guidelines.md → apps/api/package.json
- `icons.svg (landing icon sprite)` --shares_data_with--> `apps/landing/ (new Vue 3 + Vite landing app)`  [INFERRED]
  apps/landing/public/icons.svg → .ai/tasks/CREATE-LANDING-APP/design.md
- `opsx-explore command` --semantically_similar_to--> `apps/api opsx-explore command`  [INFERRED] [semantically similar]
  .opencode/commands/opsx-explore.md → apps/api/.opencode/commands/opsx-explore.md
- `apps/api opsx-apply command` --semantically_similar_to--> `openspec-apply-change skill`  [INFERRED] [semantically similar]
  apps/api/.opencode/commands/opsx-apply.md → .opencode/skills/openspec-apply-change/SKILL.md
- `apps/api opsx-archive command` --semantically_similar_to--> `openspec-archive-change skill`  [INFERRED] [semantically similar]
  apps/api/.opencode/commands/opsx-archive.md → .opencode/skills/openspec-archive-change/SKILL.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **graphify Integration Documented Across Multiple AI-Tool Configs** — agents, gemini, _agents_rules_graphify, _agents_workflows_graphify [INFERRED 0.85]
- **Read-Only Scanner + Approval-Gate Pattern Participants** — _agents_agents_auditor_agent, _agents_agents_audit_scan_agent, _agents_agents_audit_to_ticket_agent, concept_read_only_scanner_approval_gate [EXTRACTED 1.00]
- **CAF Agent Pipeline Flow (Planner→Backend/Frontend→QA→Reviewer→Docs)** — _agents_agents_planner_agent, _agents_agents_backend_agent, _agents_agents_frontend_agent, _agents_agents_qa_agent, _agents_agents_reviewer_agent, _agents_agents_documentation_agent [EXTRACTED 1.00]
- **CAF-RESTRUCTURE-001 plan/comparison/verify feed into folder restructuring & agent creation** — ai_tasks_caf_restructure_001_plan, ai_tasks_caf_restructure_001_agents_comparison, ai_tasks_caf_restructure_001_verify_report [EXTRACTED 0.95]
- **CREATE-LANDING-APP spec-driven task artifacts (requirements, design, tasks, spec)** — ai_tasks_create_landing_app_requirements, ai_tasks_create_landing_app_design, ai_tasks_create_landing_app_tasks, ai_tasks_create_landing_app_specs_landing_page_spec [EXTRACTED 0.90]
- **GAN-37 outlet product_count feature (requirements -> tasks -> verify)** — ai_tasks_gan_37_requirements, ai_tasks_gan_37_tasks, ai_tasks_gan_37_verify_report [EXTRACTED 0.95]
- **GAN-43 full PIV artifact cycle (requirements -> tasks -> verify -> qa -> review)** — ai_tasks_gan_43_requirements, ai_tasks_gan_43_tasks, ai_tasks_gan_43_verify_report, ai_tasks_gan_43_qa_report, ai_tasks_gan_43_review_notes [INFERRED 0.85]
- **GAN-52 full PIV artifact cycle (requirements -> tasks -> verify -> qa -> review)** — ai_tasks_gan_52_requirements, ai_tasks_gan_52_tasks, ai_tasks_gan_52_verify_report, ai_tasks_gan_52_qa_report, ai_tasks_gan_52_review_notes [INFERRED 0.85]
- **HOTFIX-RBAC-CROSS-TENANT implementation trio (service + controller + spec)** — apps_api_src_rbac_rbac_service, apps_api_src_rbac_rbac_controller, apps_api_src_rbac_rbac_service_spec [EXTRACTED 1.00]
- **AI agent pipeline retry cycle: backend/frontend fix loop driven by qa-report.md and review-notes.md** — claude_agents_backend, claude_agents_frontend, claude_agents_qa, claude_agents_reviewer [EXTRACTED 0.85]
- **OpenSpec change lifecycle: propose -> apply -> archive, backed by matching prompts and skills** — kiro_prompts_opsx_propose, kiro_prompts_opsx_apply, kiro_prompts_opsx_archive [EXTRACTED 0.85]
- **Human-in-the-loop audit-to-ticket flow: auditor scan -> audit-report.md -> per-item approval -> Linear issue** — claude_agents_auditor, audit_report_md_ai_audits, mcp_linear [EXTRACTED 0.85]
- **OpenCode AI agent development pipeline: plan -> architect (optional) -> backend/frontend -> qa -> reviewer -> documentation** — opencode_agent_planner, opencode_agent_architect, opencode_agent_backend, opencode_agent_frontend, opencode_agent_qa, opencode_agent_reviewer, opencode_agent_documentation [INFERRED 0.85]
- **Read-only audit workflow: auditor scan -> audit-scan command output -> human-approved audit-to-ticket conversion** — opencode_agent_auditor, opencode_commands_audit_scan, opencode_commands_audit_to_ticket [EXTRACTED 1.00]
- **Multi-cashier shift schema: shifts + shift_participants + shift_audit_logs form the participant-based architecture** — multi_cashier_shifts_shift_participants_table, multi_cashier_shifts_shift_audit_logs_table, multi_cashier_shifts_shifts_service [EXTRACTED 1.00]
- **OpenSpec workflow lifecycle: explore → propose → apply → archive** — opencode_skills_openspec_explore_skill, opencode_skills_openspec_propose_skill, opencode_skills_openspec_apply_change_skill, opencode_skills_openspec_archive_change_skill [EXTRACTED 0.90]
- **Manual pre-pipeline checkpoints: audit-scan, audit-to-ticket, plan-ticket, qa-check** — opencode_skills_audit_scan_skill, opencode_skills_audit_to_ticket_skill, opencode_skills_plan_ticket_skill, opencode_skills_qa_check_skill [INFERRED 0.75]
- **AI context documents describing API domain rules and architecture** — apps_api_project_context, apps_api_architecture, apps_api_domain_rules, apps_api_api_conventions [EXTRACTED 0.95]
- **OpenSpec change lifecycle skills (api): propose command, propose skill, config schema** — apps_api_opencode_commands_opsx_propose, apps_api_opencode_skills_openspec_propose_skill, apps_api_openspec_config [INFERRED 0.85]
- **Multi-cashier shift migration documentation set** — apps_api_migrations_readme, apps_api_migrations_migration_guide, apps_api_migrations_implementation_summary [EXTRACTED 1.00]
- **Web app fluid OpenSpec workflow commands: apply, archive, explore** — apps_web_opencode_commands_opsx_apply, apps_web_opencode_commands_opsx_archive, apps_web_opencode_commands_opsx_explore [INFERRED 0.85]
- **OpenSpec change lifecycle: propose -> apply -> archive using config schema** — apps_web__opencode_skills_openspec_propose_skill, apps_web__opencode_skills_openspec_apply_change_skill, apps_web__opencode_skills_openspec_archive_change_skill, apps_web_openspec_config [INFERRED 0.85]
- **Standard OpenSpec change artifacts created together (proposal/design/tasks)** — openspec_change_artifact_proposal, openspec_change_artifact_design, openspec_change_artifact_tasks [EXTRACTED 1.00]
- **Dashboard reports validation pipeline: params validated in api.ts, response shape validated in validation.ts, errors surfaced in chart components** — apps_web_src_modules_dashboard_services_api_ts, apps_web_src_modules_dashboard_utils_validation_ts, dailyreportschart_component [INFERRED 0.75]
- **Multi-tenant scoping enforcement spans ADR-001, DB schema design, and NestJS/Prisma implementation guidance** — docs_decisions_adr_001_multi_tenant_data_scoping, db_multi_tenant_scoping, nestjs_multi_tenant_checklist [INFERRED 0.85]
- **POS transaction commit is described consistently across system design, NestJS guidelines, and Prisma guidelines** — docs_architecture_design_pos_transaction_flow, nestjs_pos_atomic_transaction, prisma_atomic_transaction_pattern [INFERRED 0.85]
- **Settings feature fully documented across backend summary, complete implementation, and file manifest archive reports** — archive_backend_implementation_summary, archive_complete_settings_implementation, archive_files_created [INFERRED 0.85]
- **Settings feature documentation bundle** — docs_decisions__archive_kiro_reports_settings_feature_plan, docs_decisions__archive_kiro_reports_settings_implementation_summary, docs_decisions__archive_kiro_reports_settings_integration_checklist, docs_decisions__archive_kiro_reports_settings_feature_complete [INFERRED 0.75]
- **Stock API validation-bug fix lifecycle** — docs_decisions__archive_kiro_reports_stock_api_anomaly_analysis, docs_decisions__archive_kiro_reports_stock_api_fix_summary, docs_decisions__archive_kiro_reports_stock_api_fix_verification, concept_stock_logs_query_dto [INFERRED 0.85]
- **Restore participant feature (API + FE)** — docs_decisions__archive_kiro_reports_restore_participant_api, docs_decisions__archive_kiro_reports_restore_participant_fe_implementation, concept_restore_participant_feature [INFERRED 0.85]
- **file-upload-to-s3 change documents jointly define the file-upload capability** — openspec_changes_archive_2026_05_11_file_upload_to_s3_proposal, openspec_changes_archive_2026_05_11_file_upload_to_s3_design, openspec_changes_archive_2026_05_11_file_upload_to_s3_tasks, openspec_changes_archive_2026_05_11_file_upload_to_s3_specs_file_upload_spec [EXTRACTED 1.00]
- **add-image-uploads-to-features change documents jointly define feature-image-uploads and reusable-upload-infrastructure capabilities** — openspec_changes_archive_2026_05_14_add_image_uploads_to_features_proposal, openspec_changes_archive_2026_05_14_add_image_uploads_to_features_design, openspec_changes_archive_2026_05_14_add_image_uploads_to_features_tasks, openspec_changes_archive_2026_05_14_add_image_uploads_to_features_specs_feature_image_uploads_spec, openspec_changes_archive_2026_05_14_add_image_uploads_to_features_specs_reusable_upload_infrastructure_spec [EXTRACTED 1.00]
- **add-image-uploads-to-features proposal forms two new capabilities** — openspec_changes_archive_2026_05_14_add_image_uploads_to_features_proposal, concept_reusable_upload_infrastructure_capability, concept_feature_image_uploads_capability [EXTRACTED 1.00]

## Communities (316 total, 93 thin omitted)

### Community 0 - "Backend Rbac Module"
Cohesion: 0.05
Nodes (48): AssignPermissionDto, ApiProperty, IsNotEmpty, IsString, IsUUID, AssignRoleDto, ApiProperty, IsNotEmpty (+40 more)

### Community 1 - "Frontend Role Module"
Cohesion: 0.04
Nodes (67): showToast(), getErrorMessage(), confirmSubmitOrder(), submitOrder(), fetchDetail(), fetchDetail(), getDetailMerchants(), initialValues (+59 more)

### Community 2 - "Frontend Product Lists Module"
Cohesion: 0.04
Nodes (66): props, useFileUpload(), hideLoading, { show, hide }, getActiveCategories(), fetchCategories(), initialValues, listOfCategories (+58 more)

### Community 3 - "Frontend Settings Module"
Cohesion: 0.04
Nodes (50): avatarUrl, handleLogout(), hydrateAvatarUrl(), { isUserInShift }, opProfileMenu, personalInfo, router, getMerchant() (+42 more)

### Community 4 - "Backend Settings Module"
Cohesion: 0.05
Nodes (46): ChangeEmailDto, ApiProperty, IsEmail, IsNotEmpty, IsString, ChangePasswordDto, ApiProperty, IsNotEmpty (+38 more)

### Community 5 - "Backend Products Categories Module"
Cohesion: 0.06
Nodes (45): PROD-102 Requirements, PROD-102 Tasks, PaginationDto, ApiPropertyOptional, IsInt, IsOptional, Max, Min (+37 more)

### Community 6 - "Frontend Outlet Module"
Cohesion: 0.05
Nodes (52): GAN-43 QA Report, GAN-43 Requirements, GAN-43 Review Notes, GAN-43 Tasks, GAN-43 Verify Report, emit, form, isEditing (+44 more)

### Community 7 - "Frontend Product Lists Module"
Cohesion: 0.05
Nodes (51): PROD-101 Requirements, PROD-101 Tasks, PROD-101 Verify Report, getOutlet(), isLowStock(), fetchDetail(), fetchStockLogs(), isCanAdjust (+43 more)

### Community 8 - "Frontend Role Module"
Cohesion: 0.05
Nodes (41): emit, onPageChange(), Pagination, modelValue, formatDate(), formatDateTime(), formatRangeDate(), formatRangeDateTime() (+33 more)

### Community 9 - "Frontend Settings Module"
Cohesion: 0.05
Nodes (49): currentEmail, fetchCurrentEmail(), initialValuesStep1, initialValuesStep2, isCanUpdate, isLoaded, newEmailForVerification, onFormSubmitStep1() (+41 more)

### Community 10 - "Frontend Transaction Module"
Cohesion: 0.05
Nodes (46): formatPrice(), cancelTransaction(), fetchDetail(), isCanCancel, isCanPrint, loading, onCancelTransaction(), route (+38 more)

### Community 11 - "Frontend Transaction Module"
Cohesion: 0.06
Nodes (39): deviceName, downloadReceipt(), emits, handleConnect(), handleDisconnect(), handlePrint(), handlePrintTest(), isConnected (+31 more)

### Community 12 - "Backend Audit Logs Module"
Cohesion: 0.08
Nodes (37): AuditLogsModule, Module, AuthModule, Module, CustomerCatalogModule, Module, DatabaseModule, Module (+29 more)

### Community 13 - "Frontend Product Categories Module"
Cohesion: 0.06
Nodes (39): showLoading, initialValues, onFormSubmit(), resolver, router, categoryDetail, categoryID, fetchDetail() (+31 more)

### Community 14 - "Frontend Auth Module"
Cohesion: 0.05
Nodes (39): components, entireModules, modules, setupRouter(), customPreset, pinia, router, vueInit (+31 more)

### Community 15 - ""
Cohesion: 0.07
Nodes (50): ADR-003 merchant_id scoping invariant, Audit Report 2026-07-05 (apps/api RBAC + merchant_id scoping), Audit Report 2026-07-10 (apps/api/src/rbac, manual from hotfix), Audit Report: transaction module (frontend), audit-report.md (.ai/audits/DATE/), caf.config.yaml, caf-orchestrator (final pipeline implementation), architect agent (+42 more)

### Community 16 - "Backend Reports Module"
Cohesion: 0.11
Nodes (22): ExcelExportService, Injectable, QueryReportDto, ApiPropertyOptional, IsInt, IsOptional, IsString, Max (+14 more)

### Community 17 - "Backend Shifts Module"
Cohesion: 0.06
Nodes (8): JwtStrategy, Injectable, PrismaService, Injectable, ShiftsService, Injectable, Injectable, UploadsService

### Community 18 - "Frontend Merchants Module"
Cohesion: 0.06
Nodes (34): initialValues, onFormSubmit(), resolver, router, {
  selectedUploadId,
  imagePreview,
  onUploadImage,
  onRemoveImage,
}, hasExistingLogo, initialValues, isLoaded (+26 more)

### Community 19 - "Backend Shifts Module"
Cohesion: 0.08
Nodes (24): PermissionGuard, Injectable, SetProductImageDto, ApiProperty, IsNotEmpty, IsUUID, AddParticipantDto, ApiProperty (+16 more)

### Community 20 - "Frontend User Module"
Cohesion: 0.06
Nodes (35): fetchOutlet(), form, isCanCreate, isCanDelete, isCanUpdate, loading, onDeleteOutlet(), onPageChange() (+27 more)

### Community 21 - ""
Cohesion: 0.08
Nodes (22): GAN-52 Requirements, HOTFIX-RBAC-CROSS-TENANT Verify Report, Task Completion Workflow, assertOutletBelongsToMerchant() private helper, ADR-001 Multi-tenant data scoping via auth, ADR-002 DB-first schema convention, ADR-003 Merchant access control, ADR-004 DTO inheritance for query params (+14 more)

### Community 22 - "Frontend User Module"
Cohesion: 0.07
Nodes (32): assignRole(), fetchDetail(), fetchUserRole(), isCanUpdate, loadingUserRoles, onCheckRole(), revokeRole(), route (+24 more)

### Community 23 - "Backend Outlets Module"
Cohesion: 0.09
Nodes (25): CreateOutletDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNotEmpty, IsOptional, IsString, Matches (+17 more)

### Community 24 - "Backend Stock Module"
Cohesion: 0.07
Nodes (31): ADJUSTMENT_REASONS, AdjustmentReason, CreateStockAdjustmentDto, ApiProperty, ApiPropertyOptional, IsIn, IsInt, IsNotEmpty (+23 more)

### Community 25 - "Frontend Reports Module"
Cohesion: 0.07
Nodes (29): downloadFile(), chartCanvas, handleExport(), isExporting, outlet, handleExport(), handleExport(), handleExport() (+21 more)

### Community 26 - "Frontend Dashboard Helpers Module"
Cohesion: 0.08
Nodes (12): current, getStored(), getSystemPreference(), resolveTheme(), Theme, useTheme(), useTemplateCounter(), ThemeConfig (+4 more)

### Community 27 - "Community 27"
Cohesion: 0.15
Nodes (30): Architect Agent definition, Audit Scan Agent definition, Audit To Ticket Agent definition, Auditor Agent definition, Backend Agent definition, Documentation Agent definition, Frontend Agent definition, Plan Ticket Agent (Preview) definition (+22 more)

### Community 28 - "Backend Uploads Module"
Cohesion: 0.08
Nodes (7): LocalStorageDriver, Injectable, S3StorageDriver, Injectable, StorageDriver, S3ConfigService, Injectable

### Community 29 - "Frontend Dashboard Module"
Cohesion: 0.06
Nodes (28): Props, activeShiftsCount, dailyReportsData, dailyReportsError, dailyReportsLoading, dateRange, dateRangeError, fetchSummaryStats() (+20 more)

### Community 30 - "Backend Notifications Module"
Cohesion: 0.08
Nodes (22): ListNotificationsDto, ApiPropertyOptional, IsBoolean, IsInt, IsOptional, Min, Transform, NotificationsController (+14 more)

### Community 31 - "Backend Merchants Module"
Cohesion: 0.13
Nodes (16): MerchantsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+8 more)

### Community 32 - "Backend Products Categories Module"
Cohesion: 0.11
Nodes (19): CategoriesController, ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags (+11 more)

### Community 33 - "Frontend Shift Module"
Cohesion: 0.08
Nodes (19): formatDuration(), initializeSummaryChart(), loading, loadMetrics(), Metric, metrics, Participant, props (+11 more)

### Community 34 - "Backend Users Module"
Cohesion: 0.14
Nodes (16): ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete, Get (+8 more)

### Community 35 - "Backend Uploads Module"
Cohesion: 0.11
Nodes (20): ApiConsumes, SignedUrlResponseDto, ApiProperty, UploadMetadataResponseDto, UploadResponseDto, multerOptions, ApiBearerAuth, ApiBody (+12 more)

### Community 36 - "Community 36"
Cohesion: 0.07
Nodes (29): dependencies, vue, devDependencies, tailwindcss, @tailwindcss/vite, @types/node, typescript, vite (+21 more)

### Community 37 - "Frontend Dashboard Module"
Cohesion: 0.16
Nodes (23): Props, BaseReportParams, ChartComponentProps, DailyReportItem, DailyReportsResponse, DashboardParams, DateRange, FormattedDateRange (+15 more)

### Community 38 - "Frontend Transaction Module"
Cohesion: 0.08
Nodes (25): authStore, cashChangeAmount, cashPaidAmount, { deviceType }, emit, fetchTables(), hasInsufficientCash, isCanCheckout (+17 more)

### Community 39 - "Community 39"
Cohesion: 0.08
Nodes (27): ^build, coverage/**, ^lint, .output/**, ^typecheck, dependsOn, outputs, cache (+19 more)

### Community 40 - "Community 40"
Cohesion: 0.07
Nodes (26): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, incremental (+18 more)

### Community 41 - "Backend Shifts Module"
Cohesion: 0.22
Nodes (15): CurrentUser, ShiftsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller (+7 more)

### Community 42 - ""
Cohesion: 0.14
Nodes (17): ProductsController, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, Body, Controller (+9 more)

### Community 43 - "Backend Transactions Module"
Cohesion: 0.14
Nodes (18): RequirePermission(), CancelTransactionDto, IsOptional, IsString, MaxLength, TransactionsController, ApiBearerAuth, ApiOperation (+10 more)

### Community 44 - "Backend Store Tables Module"
Cohesion: 0.14
Nodes (13): CreateStoreTableDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString (+5 more)

### Community 45 - "Community 45"
Cohesion: 0.08
Nodes (25): dependencies, axios, chart.js, html2canvas, pinia, pinia-plugin-persistedstate, primeicons, primevue (+17 more)

### Community 46 - "Community 46"
Cohesion: 0.08
Nodes (25): devDependencies, autoprefixer, dayjs, hygen, playwright, postcss-load-config, @primevue/auto-import-resolver, ts-node (+17 more)

### Community 47 - "Frontend Shift Module"
Cohesion: 0.09
Nodes (22): availableUsers, confirmRemoveParticipant(), confirmRestoreParticipant(), handleCloseHandoffDialog(), handleConfirmHandoff(), handleHandoff(), isHandoffComplete, loadAvailableUsers() (+14 more)

### Community 48 - ""
Cohesion: 0.13
Nodes (24): Technical Design: Multi-Cashier Shift Support, Requirements Document: Multi-Cashier Shift Support, Implementation Plan: Multi-Cashier Shift Support, Design Document: POS Terminal Interface, POS Terminal Interface - Production Readiness Report, Requirements Document: POS Terminal Interface, Implementation Plan: POS Terminal Interface, POS Terminal Interface - Verification Checklist (+16 more)

### Community 49 - "Backend Products Module"
Cohesion: 0.17
Nodes (15): ProductsController, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, Body, Controller (+7 more)

### Community 50 - "Backend Users Module"
Cohesion: 0.09
Nodes (20): CreateUserDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString (+12 more)

### Community 51 - "Frontend Notification Module"
Cohesion: 0.13
Nodes (15): Props, loadUnreadCount(), opNotificationMenu, router, unreadCount, error, handleMarkAll(), loading (+7 more)

### Community 52 - "Backend Products Module"
Cohesion: 0.13
Nodes (14): CreateProductDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString (+6 more)

### Community 53 - "Frontend Dashboard Module"
Cohesion: 0.11
Nodes (14): Props, Props, Props, CHART_COLORS, chartCanvas, isExporting, outlet, Props (+6 more)

### Community 54 - "Community 54"
Cohesion: 0.09
Nodes (21): compilerOptions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, noFallthroughCasesInSwitch, noUncheckedSideEffectImports, noUnusedLocals, noUnusedParameters (+13 more)

### Community 55 - "Community 55"
Cohesion: 0.23
Nodes (15): src/app.module.ts (AppModule), apps/api AGENTS.md (Repository Guidelines), apps/api CLAUDE.md, PROJECT_CONTEXT.md (WisataPOS API), apps/api README.md, Multi-tenant merchant_id scoping rule, Offline sync idempotency requirement, POS atomic transaction commit pattern (+7 more)

### Community 56 - "Community 56"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+12 more)

### Community 57 - "Frontend Composables Module"
Cohesion: 0.11
Nodes (14): authStore, currentLayout, { deviceType }, { initializeTheme }, innerWidth, router, toast, { toastQueue } (+6 more)

### Community 58 - "Frontend Dashboard Module"
Cohesion: 0.14
Nodes (21): DailyReportsChart component usage example, TopProductsChart component usage example, Parameter Validation Implementation doc, dashboard services/api.ts, validateLimit() function, validateOutletId() function, Data Format Validation Implementation doc, dashboard utils/validation.ts (+13 more)

### Community 59 - "Frontend Dashboard Module"
Cohesion: 0.13
Nodes (16): formatCurrency(), formatNumber(), initializeCharts(), initializeOutletChart(), initializeProductsChart(), outletChartCanvas, productsChartCanvas, Props (+8 more)

### Community 60 - "Community 60"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+12 more)

### Community 61 - "Community 61"
Cohesion: 0.10
Nodes (19): compilerOptions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, noFallthroughCasesInSwitch, noUnusedLocals, noUnusedParameters, paths (+11 more)

### Community 62 - "Frontend Customer Catalog Module"
Cohesion: 0.11
Nodes (18): catalogStore, contentPaddingClass, customerInitial, goBack(), goTo(), initializeSession(), isHomeRoute, isStartRoute (+10 more)

### Community 63 - "Frontend Transaction Module"
Cohesion: 0.12
Nodes (18): calculatorBuffer, calculatorKeys, cashAmount, cashBills, changeAmount, emit, is_offline, isCashInsufficient (+10 more)

### Community 64 - ""
Cohesion: 0.13
Nodes (20): feature-image-uploads capability (merchant/outlet/user image & avatar endpoints), file-upload capability (S3-backed uploads module), reusable-upload-infrastructure capability (useFileUpload composable, UiFileUpload component, shared upload service), Product Requirements — WisataPOS, Monorepo Runbook Commands, file-upload-to-s3 design.md, file-upload-to-s3 change metadata (.openspec.yaml), file-upload-to-s3 proposal.md (+12 more)

### Community 65 - ""
Cohesion: 0.15
Nodes (20): Price snapshot invariant (transaction_items immutable price/name), ERD Summary — WisataPOS, customer_sessions entity, daily_reports entity, inventory_movements entity, merchants entity, notifications entity, outlet_product_inventory entity (+12 more)

### Community 66 - ""
Cohesion: 0.15
Nodes (19): Agent Handoff Convention, PIV Workflow (Plan-Implement-Verify retry tiers), Architect Agent, Backend Agent, CAF.md § Pola Kerja: PIV / Retry Bertingkat, Documentation Agent, Frontend Agent, PIV Level 1: internal agent retry loop (max 3x) (+11 more)

### Community 67 - "Backend Customer Catalog Module"
Cohesion: 0.23
Nodes (10): CustomerCatalogController, ApiOperation, ApiTags, Body, Controller, Get, Param, Post (+2 more)

### Community 68 - "Backend Metrics Module"
Cohesion: 0.13
Nodes (11): MetricsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Get, Param (+3 more)

### Community 69 - "Frontend Product Lists Module"
Cohesion: 0.12
Nodes (16): adjustmentTypeOptions, allReasonOptions, emits, initialValues, onCancel(), onFormSubmit(), props, reasonOptions (+8 more)

### Community 70 - "Frontend Transaction Module"
Cohesion: 0.12
Nodes (17): getListProduct(), addProductToCart(), authStore, { deviceType }, fetchProduct(), form, isMobile, isWeb (+9 more)

### Community 71 - ""
Cohesion: 0.15
Nodes (18): Admin merchant identified by slug 'merchant-admin', ADMIN_MERCHANT_SLUG = 'merchant-admin' constant, ADR-003: merchant access control (admin slug merchant-admin), MERCHANT_ACCESS_CONTROL.md (kiro archive), Decimal precision standard DECIMAL(14,2) for currency, Index strategy (FK columns, WHERE/sort columns, composite index), Multi-tenant scoping columns (merchant_id, outlet_id + FK + index), Naming convention (snake_case plural tables, snake_case columns) (+10 more)

### Community 72 - ""
Cohesion: 0.18
Nodes (18): ADR-001: multi-tenant data scoping, ADR-002: DB-first schema convention, ADR-005: product category as dedicated table (pending), .ai/workflows/agent-handoff.md, CAF-QA-AGENT-INTEGRATION plan.md, CAF-RESTRUCTURE-001 agents-comparison.md, CAF-RESTRUCTURE-001 verify-report.md, Architect Agent (.claude/agents/architect.md) (+10 more)

### Community 73 - "Backend Customer Catalog Module"
Cohesion: 0.16
Nodes (13): CatalogProductsQueryDto, ApiPropertyOptional, IsOptional, IsString, IsUUID, StartCustomerSessionDto, ApiProperty, ApiPropertyOptional (+5 more)

### Community 74 - "Backend Merchants Module"
Cohesion: 0.17
Nodes (12): CreateMerchantDto, ApiProperty, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, SetMerchantImageDto (+4 more)

### Community 75 - "Backend Store Tables Module"
Cohesion: 0.16
Nodes (13): StoreTablesController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Delete, Get (+5 more)

### Community 76 - "Frontend Transaction Module"
Cohesion: 0.14
Nodes (11): actions, getters, useAuthStore, state(), authStore, { deviceType }, {
  isShiftUserCanManage,
  currentShift,
  fetchShift,
}, isWeb (+3 more)

### Community 77 - "Frontend Shift Module"
Cohesion: 0.13
Nodes (15): emit, handleConfirmHandoff(), handleHandoff(), isHandoffComplete, { loading, handoffShift }, otherParticipants, props, removePreviousOwner (+7 more)

### Community 78 - "Community 78"
Cohesion: 0.12
Nodes (17): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, @nestjs/jwt, @nestjs/passport, @prisma/client, swagger-ui-express, @umkm-pos/shared-types (+9 more)

### Community 81 - "Community 81"
Cohesion: 0.12
Nodes (15): authStore, breadcrumbs, { deviceType }, {
  fetchShift,
  fetchShiftParticipants,
}, home, isBack, isCollapsed, { isDark, toggleDarkMode, initializeTheme } (+7 more)

### Community 82 - "Frontend Pos Module"
Cohesion: 0.14
Nodes (14): fetchOutletShift(), authStore, { deviceType }, fetchOutletShift(), {
  isShiftUserCanManage,
  currentShift,
  fetchShift,
}, isWeb, outlet, posStore (+6 more)

### Community 83 - "Frontend Customer Catalog Module"
Cohesion: 0.13
Nodes (12): orderStatusClass, orderStatusText, outlet, props, catalogStore, order, outletId, route (+4 more)

### Community 84 - "Frontend Dashboard Module"
Cohesion: 0.18
Nodes (4): PERMISSIONS, PERMISSIONS, PERMISSIONS, PERMISSIONS

### Community 85 - "Community 85"
Cohesion: 0.12
Nodes (16): default, devDependencies, typescript, exports, files, dist, typescript, main (+8 more)

### Community 86 - ""
Cohesion: 0.14
Nodes (16): Transaction Endpoints (/transactions), Stock invariant (products.stock_qty live count + stock_logs audit trail), POS Transaction Flow (Atomic, prisma.$transaction), Tech Stack — WisataPOS, Backend stack (NestJS, TypeScript, Prisma, MySQL, JWT, bcrypt, class-validator), Frontend stack (Vue 3, Vite, Pinia, Vue Router, PrimeVue, Tailwind v4, Axios), Prisma Guidelines — WisataPOS, POS Atomic Transaction implementation (commitTransaction) (+8 more)

### Community 87 - "Backend Auth Module"
Cohesion: 0.19
Nodes (16): MerchantInfoDto, OutletInfoDto, RegisterDto, ApiProperty, ApiPropertyOptional, IsArray, IsEmail, IsNotEmpty (+8 more)

### Community 88 - "Backend Transactions Module"
Cohesion: 0.18
Nodes (16): CreateTransactionDto, TransactionItemInputDto, ApiProperty, ApiPropertyOptional, IsArray, IsBoolean, IsInt, IsNotEmpty (+8 more)

### Community 89 - "Community 89"
Cohesion: 0.24
Nodes (16): auth module README (Pinia template module), dashboard module README (Pinia template module), landing module README (Pinia template module), merchants module README (Pinia template module), notification module README (Pinia template module), outlet module README (Pinia template module), permission module README (Pinia template module), pos module README (Pinia template module) (+8 more)

### Community 90 - "Frontend Dashboard Module"
Cohesion: 0.23
Nodes (14): fetchAllReports(), retryDailyReports(), retryOutletComparison(), retrySalesSummary(), retryTopProducts(), fetchAllReports(), retryDashboardOverview(), getDailyReports() (+6 more)

### Community 91 - ""
Cohesion: 0.19
Nodes (15): ADR-004: DTO inheritance for query params, Stock Endpoints (/stock/logs, /stock/adjust, /stock/inventory), Stock Module README (Pinia template), Transaction Module README (Pinia template), User Module README (Pinia template), Module Breakdown — WisataPOS, Backend Modules table (apps/api/src/), Frontend Modules table (apps/web/src/modules/) (+7 more)

### Community 92 - ""
Cohesion: 0.17
Nodes (15): CREATE-LANDING-APP design.md, CREATE-LANDING-APP requirements.md, CREATE-LANDING-APP specs/landing-page.spec.md, CREATE-LANDING-APP tasks.md, apps/landing/ (new Vue 3 + Vite landing app), icons.svg (landing icon sprite), bluesky-icon symbol, discord-icon symbol (+7 more)

### Community 93 - "Backend Auth Module"
Cohesion: 0.20
Nodes (11): AuthController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Get (+3 more)

### Community 94 - "Frontend Shift Module"
Cohesion: 0.19
Nodes (12): { isLoading }, isLoading, useGlobalLoading(), emit, fetchOutletShift(), handleCloseConfirm(), handleCloseShift(), {
  isUserInShift,
  isUserRemovedFromShift,
  currentShift,
  loading,
  fetchShiftParticipants,
} (+4 more)

### Community 95 - "Frontend Components Module"
Cohesion: 0.14
Nodes (13): activeOutlet, authStore, confirm, { deviceType }, hydrateOutletLogos(), isMobile, listOutlet, merchant (+5 more)

### Community 96 - "Community 96"
Cohesion: 0.13
Nodes (14): devDependencies, turbo, turbo, name, packageManager, private, scripts, build (+6 more)

### Community 97 - ""
Cohesion: 0.21
Nodes (7): GAN-52 QA Report, GAN-52 Review Notes, GAN-52 Tasks, GAN-52 Verify Report, PERMISSIONS, PERMISSIONS, Non-blocking finding: detail kategori route uses [CREATE] permission instead of [READ]

### Community 98 - ""
Cohesion: 0.14
Nodes (14): PROD-102 Verify Report, Auth Endpoints (/auth/register, /auth/login, /auth/me, /auth/logout), Merchant Endpoints (/merchants/me), Notification Endpoints (/notifications), Outlet Endpoints (/outlets), Pagination Standard (page/limit/search/sort/order), Product Endpoints (/products, /product-categories), RBAC Endpoints (/rbac/roles, /rbac/permissions, /rbac/user-roles) (+6 more)

### Community 99 - "Community 99"
Cohesion: 0.14
Nodes (14): scripts, build, dev, format, lint, start, start:debug, start:dev (+6 more)

### Community 100 - "Backend Audit Logs Module"
Cohesion: 0.15
Nodes (7): AuditLogsController, ApiBearerAuth, ApiTags, Controller, UseGuards, AuditLogsService, Injectable

### Community 101 - "Frontend Components Module"
Cohesion: 0.14
Nodes (9): filteredSidebars, route, SidebarItem, sidebars, emit, MenuItem, submenuCollapsed, emit (+1 more)

### Community 102 - ""
Cohesion: 0.22
Nodes (14): /opsx:apply prompt, /opsx:archive prompt, /opsx:explore prompt, /opsx:propose prompt, openspec-apply-change skill, openspec-archive-change skill, openspec-explore skill, openspec-propose skill (+6 more)

### Community 103 - "Community 103"
Cohesion: 0.47
Nodes (11): check_docker_requirements(), check_local_requirements(), deploy_docker(), deploy_pm2(), log_error(), log_info(), log_success(), log_warn() (+3 more)

### Community 104 - "Frontend Customer Catalog Module"
Cohesion: 0.29
Nodes (9): clearCustomerSession(), getCustomerSession(), getCustomerSessionToken(), getCatalogShiftStatus(), getCatalogTables(), getCustomerSessionMe(), getCustomerSessionStatus(), postCatalogOrder() (+1 more)

### Community 105 - "Frontend Customer Catalog Module"
Cohesion: 0.17
Nodes (12): catalogStore, categories, handleAddToCart(), loading, loadProducts(), outletId, products, route (+4 more)

### Community 106 - "Frontend Dashboard Module"
Cohesion: 0.21
Nodes (12): chartCanvas, emit, exportError, formatCurrency(), formatNumber(), handleRetry(), initializeChart(), isCanViewChart (+4 more)

### Community 107 - ""
Cohesion: 0.23
Nodes (4): ADR-0002, StoreTablesService, ADR-0001, Injectable

### Community 108 - "Community 108"
Cohesion: 0.23
Nodes (8): AuthMerchant, AuthUser, ApiResponse, PaginationMeta, HealthStatus, ServiceHealth, ProductSummary, UserSummary

### Community 109 - "Community 109"
Cohesion: 0.26
Nodes (5): TransformInterceptor, Injectable, ApiResponse, ErrorResponse, PaginatedResponse

### Community 110 - "Frontend Shift Module"
Cohesion: 0.17
Nodes (9): {
  currentShift,
  participants,
  fetchShift,
  fetchShiftParticipants,
}, emit, isShiftOwner, onHandoffComplete(), outlet, user, activeTab, route (+1 more)

### Community 111 - "Community 111"
Cohesion: 0.17
Nodes (11): compilerOptions, declaration, module, moduleResolution, outDir, rootDir, skipLibCheck, strict (+3 more)

### Community 112 - ""
Cohesion: 0.24
Nodes (11): .ai/skills/api-contract.md, .ai/skills/code-review.md, .ai/skills/nestjs-module.md, .ai/skills/pinia-store.md, .ai/skills/prisma-schema.md, .ai/skills/vue-module.md, CAF-RESTRUCTURE-001 — Audit & Rencana Restrukturisasi Folder, CREATE-LANDING-APP .openspec.yaml (+3 more)

### Community 113 - ""
Cohesion: 0.18
Nodes (11): Customer Self-Order Public Endpoints (/public/*), Standard API response format (success/data/meta, error/code), System Design — WisataPOS, Auth Flow (JWT login -> JwtAuthGuard -> CurrentUser), Customer Self-Order Flow (QR scan -> session -> order), File Upload Design (MinIO/S3, uploads table), NestJS Modular Monolith architecture style, Offline Support (is_offline, device_id, /sync/transactions) (+3 more)

### Community 114 - ""
Cohesion: 0.20
Nodes (11): @nestjs/swagger, Layer Architecture (Controller -> Service -> PrismaService -> MySQL), NestJS Guidelines — WisataPOS, Common decorators (@CurrentUser, @RequirePermission, @Public), Controller pattern (thin, DTO+decorator+service call only), DTO pattern (class-validator + Swagger @ApiProperty), NestJS built-in exception usage guidance, Module registration in app.module.ts (+3 more)

### Community 115 - "Backend App Module"
Cohesion: 0.29
Nodes (5): AppController, Controller, Get, AppService, Injectable

### Community 116 - "Backend Transactions Module"
Cohesion: 0.18
Nodes (10): ApiProperty, ApiPropertyOptional, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength (+2 more)

### Community 117 - "Frontend Components Module"
Cohesion: 0.20
Nodes (6): confirm, { confirmQueue }, confirmQueue, ConfirmQueueItem, ShowConfirmParams, useGlobalConfirm()

### Community 118 - "Frontend Merchants Module"
Cohesion: 0.25
Nodes (6): merchantsStore, message, actions, getters, useMerchantsStore, state()

### Community 119 - "Frontend Notification Module"
Cohesion: 0.25
Nodes (6): message, notificationStore, actions, getters, useNotificationStore, state()

### Community 120 - "Frontend Outlet Module"
Cohesion: 0.25
Nodes (6): message, outletStore, actions, getters, useOutletStore, state()

### Community 121 - "Frontend Permission Module"
Cohesion: 0.25
Nodes (6): message, permissionStore, actions, getters, usePermissionStore, state()

### Community 122 - "Frontend Product Categories Module"
Cohesion: 0.25
Nodes (6): categoriesStore, message, actions, getters, useCategoriesStore, state()

### Community 123 - "Frontend Product Lists Module"
Cohesion: 0.25
Nodes (6): message, productStore, actions, getters, useProductStore, state()

### Community 124 - "Frontend Profile Module"
Cohesion: 0.25
Nodes (6): message, profileStore, actions, getters, useProfileStore, state()

### Community 125 - "Frontend Reports Module"
Cohesion: 0.25
Nodes (6): message, reportsStore, actions, getters, useReportsStore, state()

### Community 126 - "Frontend Role Module"
Cohesion: 0.25
Nodes (6): message, roleStore, actions, getters, useRoleStore, state()

### Community 127 - "Frontend Settings Module"
Cohesion: 0.25
Nodes (6): message, settingsStore, actions, getters, useSettingsStore, state()

### Community 128 - "Frontend Stock Module"
Cohesion: 0.25
Nodes (6): message, stockStore, actions, getters, useStockStore, state()

### Community 129 - "Frontend User Module"
Cohesion: 0.25
Nodes (6): message, userStore, actions, getters, useUserStore, state()

### Community 130 - "Community 130"
Cohesion: 0.29
Nodes (10): opsx-propose command (api), openspec-apply-change skill, openspec-archive-change skill, openspec-explore skill, openspec-propose skill, openspec/config.yaml, opsx-apply command (web), opsx-archive command (web) (+2 more)

### Community 131 - "Backend App Module"
Cohesion: 0.27
Nodes (5): AppModule, Module, Injectable, ValidationPipe, bootstrap()

### Community 132 - "Backend Auth Module"
Cohesion: 0.29
Nodes (6): LoginDto, ApiProperty, IsEmail, IsNotEmpty, IsString, MinLength

### Community 133 - "Backend Outlets Module"
Cohesion: 0.33
Nodes (5): SetOutletImageDto, ApiProperty, IsNotEmpty, IsUUID, UpdateOutletDto

### Community 134 - "Backend Transaction Items Module"
Cohesion: 0.20
Nodes (7): TransactionItemsController, ApiBearerAuth, ApiTags, Controller, UseGuards, TransactionItemsService, Injectable

### Community 135 - "Community 135"
Cohesion: 0.24
Nodes (10): Landing index.html (UMKM POS - Simple Point of Sale), Landing app README (Vue 3 + TS + Vite template), apps/web AGENTS.md (Repository Guidelines), apps/web CLAUDE.md, apps/web docker-compose.yml (sikeci-web-app), web index.html (Insell APP), apps/web README.md (App Scope & Features), SPEC_SUMMARY.md (Specification Summary) (+2 more)

### Community 136 - ""
Cohesion: 0.33
Nodes (10): opsx-propose command, openspec-apply-change skill, openspec-archive-change skill, openspec-explore skill, openspec-propose skill, openspec CLI tool, openspec config.yaml (spec-driven schema), design.md artifact (how) (+2 more)

### Community 137 - "Community 137"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, new-module, preview, type (+1 more)

### Community 138 - "Frontend Customer Catalog Module"
Cohesion: 0.20
Nodes (7): catalogStore, customerInitial, latestOrder, outlet, outletInitial, route, router

### Community 139 - "Frontend Outlet Module"
Cohesion: 0.20
Nodes (6): customerCatalogUrl, emit, props, qrCardRef, qrCodeDataUrl, visible

### Community 140 - "Community 140"
Cohesion: 0.25
Nodes (9): apps/api opsx-apply command, apps/api opsx-archive command, apps/api opsx-explore command, opsx-explore command, opsx-propose command, openspec-apply-change skill, openspec-archive-change skill, openspec-explore skill (+1 more)

### Community 141 - "Community 141"
Cohesion: 0.22
Nodes (9): devDependencies, eslint, @types/jest, @types/node, @types/uuid, @types/node, eslint, @types/jest (+1 more)

### Community 143 - "Community 143"
Cohesion: 0.25
Nodes (7): errorMessage, form, loading, props, resetForm(), submitRegistration(), successMessage

### Community 144 - "Frontend Customer Catalog Module"
Cohesion: 0.28
Nodes (6): actions, getters, useCatalogStore, CatalogCartItem, CatalogShiftStatus, state()

### Community 145 - "Frontend Transaction Module"
Cohesion: 0.36
Nodes (5): actions, getters, usePosStore, CartItem, state()

### Community 146 - ""
Cohesion: 0.22
Nodes (5): categoryDetail, categoryID, isCanUpdate, route, router

### Community 147 - ""
Cohesion: 0.29
Nodes (8): GAN-37 requirements.md, GAN-37 tasks.md, GAN-37 verify-report.md, docs/api/api-contract.md, GAN-37: outlet list product_count badge, apps/web/src/modules/outlet/pages/index.vue, outlet_product_inventory (Prisma table), apps/api/src/outlets/outlets.service.ts

### Community 148 - "Community 148"
Cohesion: 0.25
Nodes (7): exclude, extends, dist, node_modules, **/*spec.ts, test, ./tsconfig.json

### Community 149 - "Frontend Dashboard Module"
Cohesion: 0.36
Nodes (4): actions, getters, useTemplateStore, state()

### Community 150 - "Frontend Transaction Module"
Cohesion: 0.36
Nodes (4): actions, getters, useTransactionStore, state()

### Community 151 - "Community 151"
Cohesion: 0.25
Nodes (7): compilerOptions, baseUrl, paths, files, src/*, @/*, references

### Community 152 - "Community 152"
Cohesion: 0.29
Nodes (7): default, exports, main, name, type, types, version

### Community 153 - ""
Cohesion: 0.32
Nodes (8): AuditLogsService, Multi-Cashier Shifts Checkpoint Verification Report, MetricsDisplay.vue, MetricsService, ParticipantManagement.vue, ShiftHandoff.vue, apps/web pos/pages/index.vue (multi-cashier update), ShiftsService

### Community 154 - ""
Cohesion: 0.25
Nodes (6): AuditLog, Currentshift, Metrics, Owner, Participant, shiftState

### Community 155 - "Community 155"
Cohesion: 0.38
Nodes (7): apps/api/deploy.sh, CI workflow (ci.yml), CI job: api (lint/test/build), CI job: deploy-api (SSH deploy to VPS), CI job: prepare (path filter/decide), CI job: summary, @umkm-pos/shared-types package

### Community 156 - "Community 156"
Cohesion: 0.29
Nodes (6): author, description, license, name, private, version

### Community 157 - "Backend Audit Logs Module"
Cohesion: 0.29
Nodes (6): ApiOperation, ApiQuery, ApiResponse, Get, Param, Query

### Community 158 - "Backend Transactions Module"
Cohesion: 0.29
Nodes (7): FindAllTransactionsDto, ApiPropertyOptional, IsBoolean, IsOptional, IsString, IsUUID, Transform

### Community 159 - "Community 159"
Cohesion: 0.48
Nodes (7): banner.png — 'Sistem POS Terintegrasi' marketing infographic, Employee Management (access rights, performance), Multi-Outlet (sync across branches), POS Cashier (fast transactions, easy payment), Product Management (catalog, variants, pricing), Sales Reports (complete sales reporting & analysis), Stock Management (real-time inventory monitoring)

### Community 160 - "Community 160"
Cohesion: 0.29
Nodes (5): current, Locale, prefersIndonesian, stored, Translations

### Community 161 - "Frontend Customer Catalog Module"
Cohesion: 0.38
Nodes (6): setCustomerSession(), form, route, router, submit(), startCustomerSession()

### Community 162 - "Frontend Helpers Module"
Cohesion: 0.48
Nodes (6): exportDailyReportsToExcel(), ExportOptions, exportOutletComparisonToExcel(), exportSummaryToExcel(), exportToExcel(), exportTopProductsToExcel()

### Community 163 - "Community 163"
Cohesion: 0.48
Nodes (7): Architect Agent definition (opencode), Backend Agent definition (opencode), Documentation Agent definition (opencode), Frontend Agent definition (opencode), Planner Agent definition (opencode), QA Agent definition (opencode), Reviewer Agent definition (opencode)

### Community 164 - "Community 164"
Cohesion: 0.29
Nodes (6): main, name, private, type, types, version

### Community 165 - "Community 165"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 167 - "Backend Shifts Module"
Cohesion: 0.33
Nodes (6): QueryShiftsDto, ApiPropertyOptional, IsOptional, IsUUID, IsDateString, IsEnum

### Community 168 - "Backend Transaction Items Module"
Cohesion: 0.33
Nodes (4): ApiOperation, ApiResponse, Get, Param

### Community 169 - "Frontend Components Module"
Cohesion: 0.40
Nodes (5): active, emits, handleChange(), options, props

### Community 170 - "Frontend Components Module"
Cohesion: 0.33
Nodes (5): bgColor, icon, iconColor, props, size

### Community 171 - ""
Cohesion: 0.33
Nodes (5): StockLogsQueryDto, ApiPropertyOptional, ADR-0004, IsOptional, IsUUID

### Community 172 - "Community 172"
Cohesion: 0.40
Nodes (5): Shift Endpoints (/shifts), MULTI_CASHIER_SHIFTS_ANALYSIS.md (kiro archive), Shift design (end_time null=open, shift_participants multi-cashier), Multi-cashier shift model (shift_participants, shift_owner_id, shift_audit_logs), Multi-Tenant Enforcement Checklist

### Community 173 - "Community 173"
Cohesion: 0.80
Nodes (4): IMPLEMENTATION_SUMMARY.md (Task 1.5 migration), MIGRATION_GUIDE.md (Multi-Cashier Shifts), migrations/README.md, Multi-Cashier Shift Migration (shift_owner_id, shift_participants, shift_audit_logs)

### Community 174 - "Community 174"
Cohesion: 0.40
Nodes (3): adapter, prisma, url

### Community 176 - "Community 176"
Cohesion: 0.40
Nodes (5): Uploaded photo of a man with spiky black hair at a media/red-carpet event (MTV backdrop visible), resembling a musician/celebrity portrait - unrelated to typical POS product/receipt imagery, afternoon.png (flat-illustration landscape: sun over green hills with trees), evening.png - stylized sunset/dusk illustration (uploaded asset), apps/api/uploads directory (user/merchant uploaded file storage), Time-of-day theming concept (evening/dusk)

### Community 177 - "Frontend Components Module"
Cohesion: 0.60
Nodes (4): emit, onRemove(), onSelect(), { previewUrl }

### Community 178 - "Frontend Reports Module"
Cohesion: 0.50
Nodes (4): emit, handleDownload(), isLoading, Props

### Community 179 - "Community 179"
Cohesion: 0.80
Nodes (5): BACKEND_IMPLEMENTATION_SUMMARY.md (kiro archive, settings module), COMPLETE_SETTINGS_IMPLEMENTATION.md (kiro archive), FILES_CREATED.txt (kiro archive, settings feature file manifest), IMPLEMENTATION_COMPLETE.txt (kiro archive, settings feature), Settings module (profile, password, email, account, site settings)

### Community 181 - "Community 181"
Cohesion: 0.50
Nodes (3): dependencies, @opencode-ai/plugin, @opencode-ai/plugin

### Community 182 - "Community 182"
Cohesion: 1.00
Nodes (4): Auth Module README, Common Module README, Settings Module README, RBAC Permission System (@RequirePermission, PermissionGuard, permission codes)

### Community 183 - "Community 183"
Cohesion: 0.50
Nodes (4): apps/landing marketing landing page, hero.png (landing page hero image), Vite (frontend build tool), Vite logo (boilerplate asset)

### Community 185 - "Frontend Components Module"
Cohesion: 0.50
Nodes (3): current, props, total

### Community 186 - "Frontend Customer Catalog Module"
Cohesion: 0.67
Nodes (3): emit, onCheckout(), showCartModal

### Community 189 - "Frontend Product Module"
Cohesion: 0.50
Nodes (3): activeTab, route, router

### Community 198 - "Community 198"
Cohesion: 0.50
Nodes (3): plugin, $schema, file:///Users/ganjarhadiatna/Projects/umkm-pos/.kilo/plugins/graphify.js

### Community 199 - "Community 199"
Cohesion: 0.50
Nodes (3): dependencies, @kilocode/plugin, @kilocode/plugin

### Community 200 - "Community 200"
Cohesion: 0.50
Nodes (3): dependencies, @opencode-ai/plugin, @opencode-ai/plugin

### Community 201 - "Community 201"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 202 - ""
Cohesion: 0.67
Nodes (3): Audit Report: Product, Product Categories, Product Lists, apps/web/src/modules/product-categories, apps/web/src/modules/product-lists

### Community 203 - ""
Cohesion: 1.00
Nodes (3): CAF-GOLDEN-EXAMPLES-001: Golden Examples — Plan, CAF-GOLDEN-EXAMPLES-001 verify-report.md, docs/golden-examples/ (backend + frontend)

### Community 204 - "Community 204"
Cohesion: 0.67
Nodes (3): afternoon.png - flat vector landscape illustration (uploaded asset), apps/api/uploads directory - user/merchant-uploaded file storage (UUID-prefixed filenames), POS UI theme/background illustration set (time-of-day themed, e.g. afternoon)

### Community 205 - "Community 205"
Cohesion: 0.67
Nodes (3): afternoon.png - flat illustration of sunset/sunrise over green hills with trees, API uploads directory (user/merchant uploaded assets), Time-of-day themed decorative illustration set (e.g. morning/afternoon/evening banners)

### Community 206 - "Community 206"
Cohesion: 0.67
Nodes (3): insell.id brand identity, umkm-pos product (marketed as insell.id), insell.id brand logo

### Community 210 - "Community 210"
Cohesion: 0.67
Nodes (3): apps/web/src/assets (static asset directory), logo.png (LinkedIn-style icon logo), umkm-pos-app (Vue 3 frontend)

### Community 212 - "Community 212"
Cohesion: 1.00
Nodes (3): CATEGORY_FEATURE_PLAN.md (kiro archive), FRONTEND_CATEGORY_IMPLEMENTATION.md (kiro archive), Product Category feature (product_categories table, merchant-scoped)

### Community 213 - "Community 213"
Cohesion: 1.00
Nodes (3): Auditor Agent definition (opencode), /audit-scan command (read-only Auditor Agent invocation), /audit-to-ticket command (human-in-the-loop Linear ticket creation)

## Ambiguous Edges - Review These
- `AGENTS.md` → `Audit Scan Agent definition`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to
- `AGENTS.md` → `Audit To Ticket Agent definition`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to
- `AGENTS.md` → `Plan Ticket Agent (Preview) definition`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to
- `AGENTS.md` → `QA Check Agent (Manual) definition`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to
- `CAF-GOLDEN-EXAMPLES-001: Golden Examples — Plan` → `apps/api/src/outlets/outlets.service.ts`  [AMBIGUOUS]
  .ai/tasks/CAF-GOLDEN-EXAMPLES-001/plan.md · relation: conceptually_related_to
- `apps/web/src/modules/transaction/components/Cart.vue` → `apps/api/src/outlets/outlets.service.ts`  [AMBIGUOUS]
  .ai/audits/transaction-module-2026-07-11.md · relation: conceptually_related_to
- `Landing index.html (UMKM POS - Simple Point of Sale)` → `apps/web README.md (App Scope & Features)`  [AMBIGUOUS]
  apps/landing/index.html · relation: conceptually_related_to
- `auth module README (Pinia template module)` → `settings module README (RBAC settings feature docs)`  [AMBIGUOUS]
  apps/web/src/modules/settings/README.md · relation: semantically_similar_to
- `Monorepo Runbook Commands` → `OpenSpec config.yaml (spec-driven schema)`  [AMBIGUOUS]
  docs/runbooks/monorepo-commands.md · relation: conceptually_related_to
- `Uploaded photo of a man with tousled black hair against an orange event backdrop (appears to be a celebrity/red-carpet photo, not a store product)` → `Concept: apps/api/uploads directory (user-uploaded asset storage for the POS system, e.g. product photos, avatars)`  [AMBIGUOUS]
  apps/api/uploads/5d865c4d-7a30-4e17-a8d9-dad21e218024-485389259_973834331599600_5536609844464615716_n.jpg · relation: shares_data_with
- `Multi-Outlet (sync across branches)` → `Employee Management (access rights, performance)`  [AMBIGUOUS]
  apps/landing/public/banner.png · relation: conceptually_related_to

## Knowledge Gaps
- **1178 isolated node(s):** `$schema`, `file:///Users/ganjarhadiatna/Projects/umkm-pos/.kilo/plugins/graphify.js`, `@kilocode/plugin`, `linear-server`, `@opencode-ai/plugin` (+1173 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **93 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `AGENTS.md` and `Audit Scan Agent definition`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `AGENTS.md` and `Audit To Ticket Agent definition`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `AGENTS.md` and `Plan Ticket Agent (Preview) definition`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `AGENTS.md` and `QA Check Agent (Manual) definition`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `CAF-GOLDEN-EXAMPLES-001: Golden Examples — Plan` and `apps/api/src/outlets/outlets.service.ts`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `apps/web/src/modules/transaction/components/Cart.vue` and `apps/api/src/outlets/outlets.service.ts`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Landing index.html (UMKM POS - Simple Point of Sale)` and `apps/web README.md (App Scope & Features)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._