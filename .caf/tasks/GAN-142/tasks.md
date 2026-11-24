# Tasks: GAN-142

## Frontend Tasks
- [x] (apps/admin) Remove `v-if="role.name !== 'admin'"` from the role selection `Button` in `apps/admin/src/modules/user/components/AssignOutletModal.vue`
- [x] (apps/admin) Verify that all roles (including `admin`) render the selection button with proper select/unselect state toggling

## Verification Tasks
- [x] (apps/admin) Run `pnpm --filter @umkm-pos/admin build` to verify template and type-check passes without errors
