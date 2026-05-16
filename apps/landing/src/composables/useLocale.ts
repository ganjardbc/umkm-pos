import { ref, computed } from 'vue'
import id from '@/locales/id'
import en from '@/locales/en'

type Locale = 'id' | 'en'
type Translations = typeof id

const STORAGE_KEY = 'locale'

const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
const prefersIndonesian = navigator.language?.startsWith('id')
const current = ref<Locale>(stored || (prefersIndonesian ? 'id' : 'en'))

const translations: Record<Locale, Translations> = { id, en }

export function useLocale() {
  const t = computed(() => translations[current.value])

  function setLocale(locale: Locale) {
    current.value = locale
    localStorage.setItem(STORAGE_KEY, locale)
  }

  function toggleLocale() {
    setLocale(current.value === 'id' ? 'en' : 'id')
  }

  return {
    locale: current,
    t,
    setLocale,
    toggleLocale,
  }
}
