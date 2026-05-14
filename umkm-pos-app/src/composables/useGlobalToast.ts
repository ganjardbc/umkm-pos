import { ref } from 'vue';
import type { ToastMessageOptions } from 'primevue/toast';

const toastQueue = ref<ToastMessageOptions[]>([]);

export interface ShowToastParams {
  type: 'success' | 'error' | 'info' | 'warn';
  title: string;
  message?: string;
  life?: number;
}

export function useGlobalToast() {
  const showToast = ({ type, title, message, life = 3000 }: ShowToastParams) => {
    toastQueue.value.push({
      severity: type,
      summary: title,
      detail: message,
      life,
    });
  };

  return {
    toastQueue,
    showToast,
  };
}
