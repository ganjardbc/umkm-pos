import { ref } from 'vue';

// Chrome/Edge/Android only: other browsers never fire beforeinstallprompt (no Safari iOS prompt).
const deferredPrompt = ref<any>(null);
export const canInstall = ref(false);

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt.value = event;
    canInstall.value = true;
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null;
    canInstall.value = false;
  });
}

export const installApp = async () => {
  const prompt = deferredPrompt.value;
  if (!prompt) return;
  prompt.prompt();
  await prompt.userChoice;
  deferredPrompt.value = null;
  canInstall.value = false;
};
