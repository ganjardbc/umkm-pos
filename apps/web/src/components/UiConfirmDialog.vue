<template>
  <ConfirmDialog
    group="headless"
    :style="{ width: '24rem' }"
  >
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div class="flex flex-col items-center px-4 py-6 bg-surface-0 dark:bg-surface-900 rounded-xl">
        <div
          class="rounded-full inline-flex justify-center items-center h-24 w-24 -mt-18"
          :class="[
            getHeaderBgIcon(message?.type),
            getHeaderColorIcon(message?.type),
          ]"
        >
          <i class="pi pi-question-circle text-4xl!"></i>
        </div>
        <div class="font-bold text-xl text-center block mb-2 mt-6">{{ message?.header }}</div>
        <div class="text-gray-400 text-md text-center mb-0">{{ message?.message }}</div>
        <div class="flex items-center gap-4 mt-6">
          <Button
            :label="message?.rejectProps?.label || 'Cancel'"
            :variant="message?.rejectProps?.outlined || 'outlined'"
            :severity="message?.rejectProps?.severity || 'secondary'"
            class="w-40"
            @click="rejectCallback"
          />
          <Button
            :label="message?.acceptProps?.label || 'Save'"
            :variant="message?.acceptProps?.outlined || 'outlined'"
            :severity="getAcceptButtonSeverity(message?.type)"
            class="w-40"
            @click="acceptCallback"
          />
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>
<script lang="ts" setup>
import { watch } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useGlobalConfirm } from '@/composables/useGlobalConfirm';

const confirm = useConfirm();
const { confirmQueue } = useGlobalConfirm();

watch(
  confirmQueue,
  (queue) => {
    if (queue.length > 0) {
      const confirmOptions = queue.shift();
      if (confirmOptions) {
        confirm.require(confirmOptions);
      }
    }
  },
  { deep: true }
);

const getHeaderBgIcon = (type: any) => {
  switch (type) {
    case 'info':
      return 'bg-blue-50';
    case 'success':
      return 'bg-green-50';
    case 'warn':
      return 'bg-orange-50';
    case 'danger':
      return 'bg-red-50';
    default:
      return 'bg-primary-50';
  }
}

const getHeaderColorIcon = (type: any) => {
  switch (type) {
    case 'info':
      return 'text-blue-500';
    case 'success':
      return 'text-green-500';
    case 'warn':
      return 'text-orange-500';
    case 'danger':
      return 'text-red-500';
    default:
      return 'text-primary-500';
  }
}

const getAcceptButtonSeverity = (type: any) => {
  switch (type) {
    case 'info':
      return 'info';
    case 'success':
      return 'success';
    case 'warn':
      return 'warn';
    case 'danger':
      return 'danger';
    default:
      return 'primary';
  }
}
</script>