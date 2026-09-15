<template>
  <div class="ui-card ui-card--dark">
    <div
      v-if="$slots.header"
      class="ui-card__header ui-card__header--dark"
    >
      <slot name="header" />
    </div>

    <slot />

    <div
      v-if="$slots.footer"
      class="ui-card__footer ui-card__footer--dark"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
<style scoped>
@import "tailwindcss";
@import '@/assets/styles/themes.css';

.ui-card {
  @apply relative border-0 border-gray-200 bg-white rounded-xl shadow-md dark:shadow-xl p-4 flex flex-col gap-4;
}

.ui-card--dark {
  @apply dark:border-dark dark:bg-dark-secondary;
}

.ui-card__header {
  @apply w-full pb-4 border-b border-gray-200;
}

.ui-card__header--dark {
  @apply dark:border-dark;
}

.ui-card__footer {
  @apply w-full pt-4 border-t border-gray-200;
}

.ui-card__footer--dark {
  @apply dark:border-dark;
}
</style>