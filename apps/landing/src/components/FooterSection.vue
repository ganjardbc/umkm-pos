<template>
  <footer class="py-12 px-4 border-t border-gray-200 dark:border-gray-700">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <img :src="logo" alt="UMKM POS" class="h-12" />
      </div>
      <p class="text-gray-400 dark:text-gray-500 text-xs">{{ t.footer.hakCipta }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import logo from '/logo.png'

defineProps<{
  t: any
}>()
</script>
