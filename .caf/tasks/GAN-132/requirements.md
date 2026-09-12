# Requirements: GAN-132

## Status: PLAN

## Overview
Fix outlet list search to perform server-side searching across all outlets belonging to the merchant, replacing the current client-side filtering that only filters the currently active page.

## Problem Statement
In `apps/web/src/modules/outlet/pages/index.vue`, searching uses a client-side computed property `filteredOutlets` over the currently loaded page of paginated data. As a result, when merchant outlets exceed one page (e.g., 10 outlets per page), search fails to find matching outlets located on other pages.

## User Story
As an internal merchant staff/manager managing outlets,
I want searching in the outlet list to search across all of my merchant's outlets,
So that I can quickly find any outlet regardless of which page it is located on.

## Acceptance Criteria
1. **Backend - Outlets Query DTO & Search Filter**:
   - `OutletsQueryDto` created in `apps/api/src/outlets/dto/outlets-query.dto.ts` extending `PaginationDto` with optional `search?: string` property.
   - `OutletsController.findAll` updated to receive `OutletsQueryDto`.
   - `OutletsService.findAll` updated to filter outlets by `name` and `location` using `OR: [{ name: { contains: search } }, { location: { contains: search } }]` while strictly enforcing tenant scoping by `merchant_id`.
   - Pagination total count and data list both accurately reflect the search filter.

2. **Frontend - Server-side Search Integration**:
   - `apps/web/src/modules/outlet/pages/index.vue` passes `search: form.search` in `fetchOutlet` payload to `getListOutlet`.
   - Remove client-side computed property `filteredOutlets`; template uses `outlets` directly.
   - `search` method debounces input (300ms), resets `pagination.page` to 1, and triggers `fetchOutlet()`.
   - Clear debounce timer on component unmount (`onUnmounted`).
   - Loading indicator and empty-state messaging behave seamlessly during and after search.

## Out of Scope
- Full-text/fuzzy search algorithms or cross-module search.
- Altering the global `PaginationDto` structure.
- Comprehensive automated E2E test suite additions beyond standard verification.
