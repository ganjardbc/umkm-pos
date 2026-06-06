<template>
  <div class="customer-layout customer-layout--dark">
    <router-view />
  </div>
</template>

<style scoped>
@import "tailwindcss";
@import '@/assets/styles/themes.css';

.customer-layout {
  @apply relative w-full h-dvh flex bg-white;
}

.customer-layout--dark {
  @apply dark:bg-dark-secondary dark:border-dark;
}
</style>
