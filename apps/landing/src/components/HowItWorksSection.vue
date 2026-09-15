<template>
  <section id="how-it-works" class="py-20 px-4">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">
        {{ t.howItWorks.title }}
      </h2>
      <p class="text-gray-500 dark:text-gray-400 text-center mb-12 max-w-xl mx-auto">
        {{ t.howItWorks.subtitle }}
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="(step, index) in t.howItWorks.steps"
          :key="index"
          class="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center"
        >
          <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
            {{ Number(index) + 1 }}
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ step.title }}</h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm">{{ step.description }}</p>
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
