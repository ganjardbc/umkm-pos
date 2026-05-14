import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { SiteSettingsDto } from '@/modules/settings/services/types';

const STORAGE_KEY = 'umkm_site_settings';

const defaultSettings: SiteSettingsDto = {
  darkMode: false,
  language: 'en',
  timezone: 'UTC',
  notificationsEnabled: true,
};

export const useSettingsStore = defineStore('settings', () => {
  const siteSettings = ref<SiteSettingsDto>(defaultSettings);

  // Initialize from localStorage
  const initializeSettings = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        siteSettings.value = JSON.parse(stored);
      } catch {
        siteSettings.value = defaultSettings;
      }
    }
  };

  // Getters
  const isDarkMode = computed(() => siteSettings.value.darkMode);
  const language = computed(() => siteSettings.value.language);
  const timezone = computed(() => siteSettings.value.timezone);
  const notificationsEnabled = computed(() => siteSettings.value.notificationsEnabled);

  // Actions
  const updateSiteSettings = (settings: Partial<SiteSettingsDto>) => {
    siteSettings.value = { ...siteSettings.value, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(siteSettings.value));
  };

  const toggleDarkMode = () => {
    updateSiteSettings({ darkMode: !siteSettings.value.darkMode });
  };

  const setLanguage = (lang: string) => {
    updateSiteSettings({ language: lang });
  };

  const setTimezone = (tz: string) => {
    updateSiteSettings({ timezone: tz });
  };

  const toggleNotifications = () => {
    updateSiteSettings({ notificationsEnabled: !siteSettings.value.notificationsEnabled });
  };

  const resetToDefaults = () => {
    siteSettings.value = defaultSettings;
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    siteSettings,
    isDarkMode,
    language,
    timezone,
    notificationsEnabled,
    initializeSettings,
    updateSiteSettings,
    toggleDarkMode,
    setLanguage,
    setTimezone,
    toggleNotifications,
    resetToDefaults,
  };
});
