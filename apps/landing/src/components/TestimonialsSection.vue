<template>
  <section id="testimonials" class="py-20 px-4">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">
        {{ t.testimonials.title }}
      </h2>
      <p class="text-gray-500 dark:text-gray-400 text-center mb-12 max-w-xl mx-auto">
        {{ t.testimonials.subtitle }}
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="(item, index) in t.testimonials.items"
          :key="index"
          class="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <p class="text-gray-600 dark:text-gray-300 mb-6 italic">"{{ item.quote }}"</p>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-light dark:bg-primary/90 flex items-center justify-center text-primary dark:text-white font-bold">
              {{ item.name.charAt(0) }}
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ item.name }}</p>
              <p class="text-gray-500 dark:text-gray-400 text-xs">{{ item.role }}</p>
            </div>
          </div>
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
