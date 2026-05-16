<template>
  <section id="hero" class="w-full pt-12 bg-cream dark:bg-gray-950">
    <div class="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-[1fr_380px] items-center">
      <div class="flex-1 flex flex-col justify-center">
        <div class="flex gap-4 items-center mb-4">
          <img :src="logo" alt="UMKM POS" class="h-12" />
        </div>
        
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-navy dark:text-white leading-tight">
          UMKM POS
        </h1>

        <p class="text-lg md:text-xl text-primary font-medium mb-4">
          {{ t.hero.tagline }}
        </p>

        <p class="text-base text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed mb-8">
          {{ t.hero.deskripsi }}
        </p>

        <div class="flex flex-col sm:flex-row gap-3 mb-8">
          <a
            :href="loginUrl"
            class="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25 text-center"
          >
            {{ t.hero.masuk }}
          </a>
          <a
            :href="registerUrl"
            class="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center"
          >
            {{ t.hero.daftar }}
          </a>
        </div>

        <p class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2">
          <span class="inline-block w-1 h-1 rounded-full bg-green-400" />
          {{ t.hero.kepercayaan }}
        </p>
      </div>

      <div class="hidden md:flex aspect-square relative items-center justify-center bg-cream dark:bg-gray-900 overflow-hidden rounded-2xl shadow-lg shadow-primary/25">
        <img
          :src="banner"
          alt="UMKM POS Banner"
          class="w-full h-full object-cover"
        />
      </div>
    </div>

    <div class="bg-cream dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div class="max-w-6xl mx-auto px-6 md:px-12 py-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          <div v-for="(stat, i) in stats" :key="i" class="text-center">
            <p class="text-2xl md:text-3xl font-bold text-primary">{{ stat.value }}</p>
            <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import logo from '/logo.png'
import banner from '/banner.png'

const baseUrl = import.meta.env.VITE_WEB_BASE_URL || 'http://localhost:5173'
const loginUrl = baseUrl
const registerUrl = `${baseUrl}/register`

const props = defineProps<{
  t: any
}>()

const stats = computed(() => [
  { value: '10rb+', label: props.t.hero.stats.pengguna },
  { value: '500rb+', label: props.t.hero.stats.transaksi },
  { value: '5rb+', label: props.t.hero.stats.outlet },
  { value: '5+', label: props.t.hero.stats.tahun },
])
</script>
