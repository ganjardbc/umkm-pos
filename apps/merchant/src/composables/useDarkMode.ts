import { ref, watch, nextTick } from 'vue';

// Create a shared reactive state for dark mode
const sharedIsDark = ref(false);
let isInitialized = false;

export const useDarkMode = () => {
  const toggleDarkMode = () => {
    sharedIsDark.value = !sharedIsDark.value;
  };

  const updateTheme = async () => {
    await nextTick();
    const htmlElement = document.documentElement;
    if (sharedIsDark.value) {
      htmlElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      htmlElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const initializeTheme = async () => {
    if (isInitialized) return;
    
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    sharedIsDark.value = savedTheme === 'dark' || (savedTheme === null && prefersDark);
    await updateTheme();
    isInitialized = true;
  };

  // Watch for changes to isDark and update the theme
  watch(
    () => sharedIsDark.value,
    async () => {
      await updateTheme();
    }
  );

  return {
    isDark: sharedIsDark,
    toggleDarkMode,
    updateTheme,
    initializeTheme
  };
};
