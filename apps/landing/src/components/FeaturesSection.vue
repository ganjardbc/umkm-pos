<template>
  <section id="features" class="py-20 px-4">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">
        {{ t.features.title }}
      </h2>
      <p class="text-gray-500 dark:text-gray-400 text-center mb-12 max-w-xl mx-auto">
        {{ t.features.subtitle }}
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="(item, index) in t.features.items"
          :key="index"
          class="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow"
        >
          <div class="w-12 h-12 bg-primary-light dark:bg-primary/90 rounded-lg flex items-center justify-center mb-4">
            <span class="text-xl text-primary dark:text-white font-bold">{{ Number(index) + 1 }}</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ item.title }}</h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  t: any
}>()
</script>
