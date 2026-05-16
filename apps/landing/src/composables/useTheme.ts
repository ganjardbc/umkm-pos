import { ref, watchEffect } from 'vue'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

function getSystemPreference(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStored(): Theme | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return null
}

function resolveTheme(): Theme {
  return getStored() || getSystemPreference()
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

const current = ref<Theme>(resolveTheme())

watchEffect(() => applyTheme(current.value))

export function useTheme() {
  function setTheme(theme: Theme) {
    current.value = theme
    localStorage.setItem(STORAGE_KEY, theme)
  }

  function toggleTheme() {
    setTheme(current.value === 'light' ? 'dark' : 'light')
  }

  return {
    theme: current,
    setTheme,
    toggleTheme,
  }
}
