# Requirements: GAN-142

## Status: PLAN

## Ticket Context
- **Ticket ID**: GAN-142
- **Title**: [admin] Penetapan role disaring berdasarkan nama 'admin', bukan aturan di API
- **Location**: `apps/admin/src/modules/user/components/AssignOutletModal.vue`

## Problem Statement
In `apps/admin/src/modules/user/components/AssignOutletModal.vue:101`, the role selection button is conditionally rendered with `v-if="role.name !== 'admin'"`. This arbitrary client-side filter prevents platform administrators from assigning the `admin` role to users (e.g., adding a secondary platform administrator or assigning admin privileges) through the UI. 

Furthermore, filtering by hardcoded role name string violates the project RBAC architectural rule stated in `CLAUDE.md` ("Permissions are codes, not role names"). The API backend (`apps/api/src/admin/users/admin-users.service.ts`) does not enforce any restriction on assigning the `admin` role in the platform-admin context. This condition was mistakenly carried over from `apps/merchant`.

## Proposed Solution
Remove the `v-if="role.name !== 'admin'"` condition from the role selection button in `apps/admin/src/modules/user/components/AssignOutletModal.vue`, allowing platform administrators to select and assign all available roles including `admin`.

## Acceptance Criteria
- [ ] In `apps/admin/src/modules/user/components/AssignOutletModal.vue`, the `v-if="role.name !== 'admin'"` directive on the role selection `Button` component is removed.
- [ ] Platform admin users can see and click the "Pilih" / "Batal Pilih" button for all roles in the list, including roles with name `'admin'`.
- [ ] Selecting and assigning the `admin` role completes successfully in the stepper modal and submits the role assignment to the API.
- [ ] Running `pnpm --filter @umkm-pos/admin build` succeeds without TypeScript or template compilation errors.
