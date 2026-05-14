<template>
  <div
    class="w-full h-full md:max-w-3xl mx-auto flex flex-col justify-center items-center py-8"
    style="height: calc(100vh - 90px);"
  >
    <router-link to="/" class="flex items-center mb-4">
      <Image :src="defaultLogo" alt="Image" class="w-58" />
    </router-link>
    <div class="w-full text-lg text-gray-400 text-center">
      The simple point of sale for UMKM.
    </div>
  </div>
</template>

<script setup lang="ts">
import defaultLogo from '@/assets/insell-logo.png';
</script>

<style scoped></style>
