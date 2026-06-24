<script setup lang="ts">
import pkg from '../../package.json';
const version = pkg.version;
</script>

<template>
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
    <div class="flex-1 overflow-y-auto">
      <!-- Sidebar content -->
    </div>
    <div class="p-4 text-xs text-gray-500 text-center border-t border-gray-200">
      Versi {{ version }}
    </div>
  </aside>
</template>
