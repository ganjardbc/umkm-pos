<template>
  <Dialog
    v-model:visible="isLoading"
    modal
    group="headless"
    class="ui-global-loading"
    :style="{ width: '15rem' }"
  >
    <div class="flex flex-col justify-center items-center gap-4">
      <i class="pi pi-spin pi-spinner text-primary" style="font-size: 2rem"></i>
      <span class="text-base font-semibold text-center">
        Please Wait..
      </span>
    </div>
  </Dialog>
</template>
<script lang="ts" setup>
import { useGlobalLoading } from '@/composables/useGlobalLoading';

const { isLoading } = useGlobalLoading();
</script>
<style>
.ui-global-loading .p-dialog-header {
  display: none;
}

.ui-global-loading .p-dialog-content {
  padding-top: 2rem;
  padding-bottom: 2rem;
}
</style>