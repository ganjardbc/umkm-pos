<template>
  <UiAppShell
    :home-path="PRP_DASHBOARD"
    :logo="defaultLogo"
    :icon="defaultIcon"
    :title="title"
    :is-back="isBack"
    :breadcrumbs="breadcrumbs"
    :device-type="deviceType"
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
      <UiSidebarProfile
        :login-path="PRP_AUTH"
        :profile-path="PRP_PROFILE"
        :is-collapsed="isCollapsed"
        @navigate="navigate"
      />
    </template>

    <slot />
  </UiAppShell>
</template>

<script lang="ts" setup>
import { onMounted, computed } from "vue";
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import defaultIcon from '@/assets/logo.png';
import defaultLogo from '@/assets/insell-logo.png';

import UiAppShell from '@umkm-pos/ui/layouts/UiAppShell.vue';
import UiSidebarMenu from '@umkm-pos/ui/components/UiSidebarMenu.vue';
import UiSidebarProfile from '@umkm-pos/ui/components/UiSidebarProfile.vue';
import { useDarkMode } from '@umkm-pos/ui/composables/useDarkMode';

import menus from '@/services/menus.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { useAuthStore } from '@/modules/auth/stores/index.ts';
import { PREFIX_ROUTE_PATH as PRP_AUTH } from '@/modules/auth/services/constants.ts';
import { PREFIX_ROUTE_PATH as PRP_DASHBOARD } from '@/modules/dashboard/services/constants.ts';
import { PREFIX_ROUTE_PATH as PRP_PROFILE } from '@/modules/profile/services/constants.ts';

const route = useRoute();
const isBack = computed(() => Boolean(route.meta.isBack));
const title = computed(() => String(route.meta.title ?? '-'));
const breadcrumbs = computed(() => Array.isArray(route.meta.breadcrumbs) ? route.meta.breadcrumbs : []);

const { initializeTheme } = useDarkMode();

const authStore = useAuthStore();
const { deviceType } = storeToRefs(authStore);

onMounted(() => {
  initializeTheme();
});
</script>
