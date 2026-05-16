<template>
  <section id="pricing" class="py-20 px-4 bg-cream dark:bg-gray-900">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">
        {{ t.pricing.title }}
      </h2>
      <p class="text-gray-500 dark:text-gray-400 text-center mb-12 max-w-xl mx-auto">
        {{ t.pricing.subtitle }}
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="(plan, index) in t.pricing.plans"
          :key="index"
          class="relative p-8 rounded-xl border bg-white dark:bg-gray-800 transition-shadow"
          :class="plan.featured
            ? 'border-primary dark:border-primary/80 shadow-lg scale-105 md:scale-105'
            : 'border-gray-200 dark:border-gray-700 hover:shadow-lg'"
        >
          <div v-if="plan.featured" class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-sm rounded-full font-medium">
            Populer
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ plan.name }}</h3>
          <div class="mb-6">
            <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ plan.price }}</span>
            <span class="text-gray-500 dark:text-gray-400">{{ plan.period }}</span>
          </div>
          <ul class="space-y-3 mb-8">
            <li v-for="(feature, fi) in plan.features" :key="fi" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span class="text-green-500">✓</span>
              {{ feature }}
            </li>
          </ul>
          <a
            :href="registerUrl"
            class="block text-center py-3 rounded-lg font-semibold transition-colors"
            :class="plan.featured
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            {{ plan.cta }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const baseUrl = import.meta.env.VITE_WEB_BASE_URL || 'http://localhost:5173'
const registerUrl = `${baseUrl}/register`

defineProps<{
  t: any
}>()
</script>
