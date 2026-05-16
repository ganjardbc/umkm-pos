<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
    <header class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="#hero" class="flex items-center gap-2">
          <img :src="logo" alt="UMKM POS" class="h-12" />
        </a>
        <nav class="hidden md:flex items-center gap-6">
          <a href="#features" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{{ t.nav.fitur }}</a>
          <a href="#pricing" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{{ t.nav.harga }}</a>
          <a href="#testimonials" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{{ t.nav.testimoni }}</a>
        </nav>
        <div class="flex items-center gap-3">
          <button
            @click="toggleLocale"
            class="text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {{ locale === 'id' ? 'EN' : 'ID' }}
          </button>
          <button
            @click="toggleTheme"
            class="text-lg px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {{ theme === 'light' ? '🌙' : '☀️' }}
          </button>
        </div>
      </div>
    </header>

    <main>
      <HeroSection :t="t" />
      <FeaturesSection :t="t" />
      <PricingSection :t="t" />
      <TestimonialsSection :t="t" />
      <FooterSection :t="t" />
    </main>
  </div>
</template>

<script setup lang="ts">
import logo from '/logo.png'
import { useLocale } from '@/composables/useLocale'
import { useTheme } from '@/composables/useTheme'
import HeroSection from '@/components/HeroSection.vue'
import FeaturesSection from '@/components/FeaturesSection.vue'
import PricingSection from '@/components/PricingSection.vue'
import TestimonialsSection from '@/components/TestimonialsSection.vue'
import FooterSection from '@/components/FooterSection.vue'

const { t, locale, toggleLocale } = useLocale()
const { theme, toggleTheme } = useTheme()
</script>
