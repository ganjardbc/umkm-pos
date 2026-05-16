<template>
  <div class="auth-layout auth-layout--dark">
    <!-- Dark Mode Toggle -->
    <div v-if="ENABLE_DARKMODE_TOGGLE" class="auth-layout__dark-mode">
      <Button
        :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
        severity="secondary"
        variant="text"
        rounded
        @click="toggleDarkMode"
      />
    </div>

    <slot />
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import Button from 'primevue/button';

import { useDarkMode } from '@/composables/useDarkMode.ts';

const ENABLE_DARKMODE_TOGGLE = false;

const { isDark, toggleDarkMode, initializeTheme } = useDarkMode();

onMounted(() => {
  // Initialize theme on mount
  initializeTheme();
});
</script>
<style scoped>
@import "tailwindcss";
@import '@/assets/styles/themes.css';

.auth-layout {
  @apply relative w-full h-dvh flex items-center justify-center bg-primary;
}

.auth-layout--dark {
  @apply dark:bg-dark;
}

.auth-layout__dark-mode {
  @apply absolute top-6 right-6;
}
</style>
