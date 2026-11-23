<template>
  <UiAppShell
    home-path="/landing"
    :logo="defaultLogo"
    :icon="defaultIcon"
    :title="title"
    :is-back="isBack"
    :breadcrumbs="breadcrumbs"
    :device-type="deviceType"
    :sidebar-header-border="false"
  >
    <template #sidebar-menu="{ isCollapsed, navigate }">
      <UiSidebarMenu
        :menus="menus"
        :has-permission="isHasPermission"
        :is-collapsed="isCollapsed"
        @navigate="navigate"
      />
    </template>

    <template #header-right="{ isCollapsed, navigate }">
      <Button
        v-if="canShift"
        :severity="shiftRequired && isShiftOpen ? 'success' : 'secondary'"
        variant="outlined"
        size="small"
        class="mr-2 gap-2"
        aria-label="Buka/Tutup Kasir"
        @click="() => { router.push(PRP_SHIFT); navigate(); }"
      >
        <i class="pi pi-clock" />
        <span class="hidden xl:inline whitespace-nowrap">Buka/Tutup Kasir</span>
      </Button>

      <div class="flex items-center gap-1">
        <UiSidebarNotification
          :is-collapsed="isCollapsed"
          @navigate="navigate"
        />
        <UiSidebarProfile
          :login-path="PRP_AUTH"
          :profile-path="PRP_PROFILE"
          :is-collapsed="isCollapsed"
          :badge-severity="shiftRequired ? (isUserInShift ? 'success' : 'danger') : null"
          :status-tag="shiftRequired ? {
            severity: isUserInShift ? 'success' : 'secondary',
            value: isUserInShift ? 'Bertugas' : 'Tidak Bertugas',
          } : null"
          :links="profileLinks"
          @navigate="navigate"
        >
          <template #actions="{ close }">
            <Button
              v-if="canInstall"
              severity="secondary"
              variant="text"
              icon="pi pi-download"
              size="small"
              label="Pasang Aplikasi"
              fluid
              class="justify-start! items-center!"
              @click="() => { close(); installApp(); }"
            />
          </template>
        </UiSidebarProfile>
      </div>

      <Divider layout="vertical" class="mx-2!" />

      <UiSidebarOutlet
        :is-collapsed="isCollapsed"
        @navigate="navigate"
      />
    </template>

    <slot />
  </UiAppShell>
</template>

<script lang="ts" setup>
import { onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import defaultIcon from '@/assets/logo.png';
import defaultLogo from '@/assets/insell-logo.png';

import UiAppShell from '@umkm-pos/ui/layouts/UiAppShell.vue';
import UiSidebarMenu from '@umkm-pos/ui/components/UiSidebarMenu.vue';
import UiSidebarProfile from '@umkm-pos/ui/components/UiSidebarProfile.vue';
import { useDarkMode } from '@umkm-pos/ui/composables/useDarkMode';

import UiSidebarOutlet from '@/components/UiSidebarOutlet.vue';
import UiSidebarNotification from '@/components/UiSidebarNotification.vue';

import { canInstall, installApp } from '@/helpers/pwa.ts';
import menus from '@/services/menus.ts';
import { getOutlet, isHasPermission } from '@/helpers/auth.ts';
import { useAuthStore } from '@/modules/auth/stores/index.ts';
import { useShift } from '@/modules/shift/composables/useShift.ts';
import { getOutletShift } from '@/modules/shift/services/api.ts';
import { PREFIX_ROUTE_PATH as PRP_SHIFT } from '@/modules/shift/services/constants.ts';
import { PERMISSIONS as SHIFT_PERMISSIONS } from '@/modules/shift/services/rbac.ts';
import { PREFIX_ROUTE_PATH as PRP_AUTH } from '@/modules/auth/services/constants.ts';
import { PREFIX_ROUTE_PATH as PRP_PROFILE } from '@/modules/profile/services/constants.ts';
import { PREFIX_ROUTE_PATH as PRP_MERCHANT } from '@/modules/merchants/services/constants.ts';
import { READ as MERCHANT_READ } from '@/modules/merchants/services/rbac.ts';
import { PREFIX_ROUTE_PATH as PRP_SETTINGS } from '@/modules/settings/services/constants.ts';

const route = useRoute();
const router = useRouter();
const isBack = computed(() => Boolean(route.meta.isBack));
const title = computed(() => String(route.meta.title ?? '-'));
const breadcrumbs = computed(() => Array.isArray(route.meta.breadcrumbs) ? route.meta.breadcrumbs : []);

const outlet = getOutlet();

const { initializeTheme } = useDarkMode();

const authStore = useAuthStore();
const { deviceType } = storeToRefs(authStore);

// Profile popover links beyond "Profil"; Merchant is permission-gated.
const profileLinks = computed(() => [
  ...(isHasPermission(MERCHANT_READ)
    ? [{ label: 'Merchant', icon: 'pi pi-shop', to: PRP_MERCHANT }]
    : []),
  { label: 'Pengaturan', icon: 'pi pi-cog', to: PRP_SETTINGS },
]);

// Computed for Shift
const {
  isUserInShift,
  isShiftClosed,
  shiftRequired,
  fetchShiftSetting,
  fetchShift,
  fetchShiftParticipants,
} = useShift();

// Same rule the sidebar menu used: any shift.* permission.
const canShift = computed(() => SHIFT_PERMISSIONS.some((p) => isHasPermission(p)));
const isShiftOpen = computed(() => !isShiftClosed.value);

const fetchOutletShift = async () => {
  fetchShiftSetting(outlet.id);
  try {
    const response = await getOutletShift(outlet.id);
    const shiftData = response?.data?.data || {};
    if (shiftData?.id) {
      await fetchShift({ shiftId: shiftData.id });
      await fetchShiftParticipants({ shiftId: shiftData.id });
    }
  } catch (error) {
    console.error('Failed to fetch outlet shift:', error);
  }
};

// Watch for outlet changes
watch(
  () => outlet?.id,
  (newOutletId) => {
    if (newOutletId) {
      fetchOutletShift();
    }
  },
  { immediate: true },
);

onMounted(() => {
  initializeTheme();
  fetchOutletShift();
});
</script>
