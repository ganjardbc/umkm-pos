import { ref } from 'vue';

const isLoading = ref(false);

export function useGlobalLoading() {
  const show = () => {
    isLoading.value = true;
  };

  const hide = () => {
    isLoading.value = false;
  };

  return {
    isLoading,
    show,
    hide,
  };
}
