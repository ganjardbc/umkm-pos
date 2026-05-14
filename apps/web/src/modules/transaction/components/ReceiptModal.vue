<template>
  <Dialog
    v-model:visible="visibility"
    modal
    group="headless"
    class="receipt-modal w-120"
  >
    <template #header>
      <h1 class="text-xl font-semibold">
        Print Receipt
      </h1>
    </template>

    <div class="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
      <ReceiptPreview :transaction="selected" />
    </div>

    <template #footer>
      <!-- Footer -->
      <div class="w-full flex flex-col gap-4">
        <Button
          label="Download Receipt"
          icon="pi pi-download"
          size="medium"
          fluid
          @click="downloadReceipt"
          :loading="isDownloading"
        />
        <Button
          severity="secondary"
          label="Cancel"
          size="medium"
          fluid
          @click="onCancel"
        />
      </div>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import html2canvas from 'html2canvas';
import ReceiptPreview from './ReceiptPreview.vue';
import { generateReceiptHTML, type ReceiptData } from '../utils/receiptGenerator';

const emits = defineEmits(['cancel']);

const props = defineProps({
  selected: {
    type: Object as () => ReceiptData,
    required: true,
    default: () => ({}),
  }
})

const visibility = defineModel<boolean>("visibility", {
  required: true
});

const isDownloading = ref(false);

const downloadReceipt = async () => {
  if (!props.selected?.id) return;

  try {
    isDownloading.value = true;

    // Create temporary container with generated HTML
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = generateReceiptHTML(props.selected);
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    document.body.appendChild(tempContainer);

    const canvas = await html2canvas(tempContainer, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
    });

    document.body.removeChild(tempContainer);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `receipt-${props.selected?.id?.slice(0, 8)}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading receipt:', error);
  } finally {
    isDownloading.value = false;
  }
};

const onCancel = () => {
  emits('cancel');
}
</script>

<style scoped>
.receipt-modal :deep(.p-dialog-content) {
  padding-bottom: 0 !important;
}
</style>
