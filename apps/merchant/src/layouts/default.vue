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

    <template #sidebar-footer="{ navigate }">
      <Button
        v-if="ENABLE_DARKMODE_TOGGLE"
        severity="secondary"
        variant="outlined"
        size="medium"
        :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
        @click="toggleDarkMode"
      />
      <router-link to="/settings">
        <Button
          severity="secondary"
          variant="outlined"
          size="medium"
          icon="pi pi-cog"
          @click="navigate"
        />
      </router-link>
      <router-link to="/profile">
        <Button
          severity="secondary"
          variant="outlined"
          size="medium"
          icon="pi pi-user"
          @click="navigate"
        />
      </router-link>
    </template>

    <template #header-right="{ isCollapsed, navigate }">
      <UiSidebarOutlet
        :is-collapsed="isCollapsed"
        @navigate="navigate"
      />

      <Divider layout="vertical" class="mx-2!" />

      <div class="flex items-center gap-1">
        <UiSidebarNotification
          :is-collapsed="isCollapsed"
          @navigate="navigate"
        />
        <UiSidebarProfile
          :login-path="PRP_AUTH"
          :profile-path="PRP_PROFILE"
          :is-collapsed="isCollapsed"
          :badge-severity="isUserInShift ? 'success' : 'danger'"
          :status-tag="{
            severity: isUserInShift ? 'success' : 'secondary',
            value: isUserInShift ? 'In Shift' : 'Not Shift',
          }"
          :links="profileLinks"
          @navigate="navigate"
        />
      </div>
    </template>

    <slot />
  </UiAppShell>
</template>

<script lang="ts" setup>
import { onMounted, computed, watch } from "vue";
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import defaultIcon from '@/assets/logo.png';
import defaultLogo from '@/assets/insell-logo.png';

import UiAppShell from '@umkm-pos/ui/layouts/UiAppShell.vue';
import UiSidebarMenu from '@umkm-pos/ui/components/UiSidebarMenu.vue';
import UiSidebarProfile from '@umkm-pos/ui/components/UiSidebarProfile.vue';
import { useDarkMode } from '@umkm-pos/ui/composables/useDarkMode';

import UiSidebarOutlet from '@/components/UiSidebarOutlet.vue';
import UiSidebarNotification from '@/components/UiSidebarNotification.vue';

import menus from '@/services/menus.ts';
import { getOutlet, isHasPermission } from '@/helpers/auth.ts';
import { useAuthStore } from '@/modules/auth/stores/index.ts';
import { useShift } from '@/modules/shift/composables/useShift.ts';
import { getOutletShift } from '@/modules/shift/services/api.ts';
import { PREFIX_ROUTE_PATH as PRP_AUTH } from '@/modules/auth/services/constants.ts';
import { PREFIX_ROUTE_PATH as PRP_PROFILE } from '@/modules/profile/services/constants.ts';
import { PREFIX_ROUTE_PATH as PRP_MERCHANT } from '@/modules/merchants/services/constants.ts';
import { READ as MERCHANT_READ } from '@/modules/merchants/services/rbac.ts';
import { PREFIX_ROUTE_PATH as PRP_SETTINGS } from '@/modules/settings/services/constants.ts';

const ENABLE_DARKMODE_TOGGLE = false;

const route = useRoute();
const isBack = computed(() => Boolean(route.meta.isBack));
const title = computed(() => String(route.meta.title ?? '-'));
const breadcrumbs = computed(() => Array.isArray(route.meta.breadcrumbs) ? route.meta.breadcrumbs : []);

const outlet = getOutlet();

const { isDark, toggleDarkMode, initializeTheme } = useDarkMode();

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
  fetchShift,
  fetchShiftParticipants,
} = useShift();

const fetchOutletShift = async () => {
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
