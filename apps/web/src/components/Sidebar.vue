<script setup lang="ts">
import { version } from '../../../../package.json';
</script>

<template>
  <aside class="w-64 bg-gray-800 text-white h-screen flex flex-col">
    <div class="flex-1 p-4">
      <!-- Sidebar content -->
      <nav class="space-y-2">
        <slot />
      </nav>
    </div>
    <div class="p-4 border-t border-gray-700 mt-auto">
      <!-- app-version --><div class="text-xs text-gray-400 text-center py-2">v{{ version }}</div>
    </div>
  </aside>
</template>
