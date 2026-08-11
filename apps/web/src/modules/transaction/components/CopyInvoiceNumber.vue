<template>
  <button
    v-if="invoiceNumber"
    type="button"
    class="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded px-2 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
    :aria-label="`Copy invoice number ${invoiceNumber}`"
    @click.stop="onCopy"
  >
    <span class="select-text font-mono text-xs text-slate-500 dark:text-slate-400">
      #{{ invoiceNumber }}
    </span>
    <i class="pi pi-copy text-xs text-slate-400" />
  </button>
</template>

<script setup lang="ts">
import { copyToClipboard } from '../utils/clipboard';
import { showToast } from '@/helpers/toast.ts';

const props = defineProps<{
  invoiceNumber?: string | null;
}>();

let isCopying = false;

const onCopy = async () => {
  if (isCopying || !props.invoiceNumber) return;

  isCopying = true;
  try {
    const success = await copyToClipboard(props.invoiceNumber);
    if (success) {
      showToast({
        type: 'success',
        title: 'Copied',
        message: `Invoice number ${props.invoiceNumber} copied to clipboard.`,
        life: 2500,
      });
    } else {
      showToast({
        type: 'error',
        title: 'Copy failed',
        message: `Could not copy automatically. Invoice number: ${props.invoiceNumber}`,
        life: 2500,
      });
    }
  } finally {
    setTimeout(() => {
      isCopying = false;
    }, 500);
  }
};
</script>
