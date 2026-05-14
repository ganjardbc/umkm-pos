<template>
  <UiToast />
  <UiConfirmDialog />
  <UiGlobalLoading />

  <component :is="isAuthRoute ? AuthLayout : DefaultLayout">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import DefaultLayout from '@/layouts/default.vue';
import AuthLayout from '@/layouts/auth.vue';

import UiToast from '@/components/UiToast.vue';
import UiConfirmDialog from '@/components/UiConfirmDialog.vue';
import UiGlobalLoading from '@/components/UiGlobalLoading.vue';

import { useAuthStore } from '@/modules/auth/stores/index.ts';

import { useDarkMode } from '@/composables/useDarkMode.ts';

// Dark mode - initialize on app load
const { initializeTheme } = useDarkMode();

onMounted(() => {
  initializeTheme();
});

const router = useRouter();
const authStore = useAuthStore();
const { deviceType } = storeToRefs(authStore);

const isAuthRoute = computed(() => {
  return router.currentRoute.value.matched.some(
    (record) => record.meta.layout === 'auth'
  );
});

// Watch device type changes (example logic, can be modified as needed)
const innerWidth = ref(window.innerWidth);

const updateDeviceType = (newWidth: number) => {
  if (newWidth <= 768) {
    deviceType.value = 'mobile';
  } else if (newWidth <= 1024) {
    deviceType.value = 'tablet';
  } else {
    deviceType.value = 'web';
  }
};

const handleResize = () => {
  innerWidth.value = window.innerWidth;
};

watch(innerWidth, updateDeviceType, { immediate: true });

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>
