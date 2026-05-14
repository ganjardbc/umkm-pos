import { ref } from 'vue';

/**
 * Example composable for template module
 */
export function useTemplateCounter() {
  const count = ref(0);

  function increment() {
    count.value++;
  }

  function reset() {
    count.value = 0;
  }

  return {
    count,
    increment,
    reset
  };
}
