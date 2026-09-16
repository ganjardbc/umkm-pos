<template>
  <div class="open-shift">
    <div class="open-shift__content">
      <div class="open-shift__icon">
        <i class="pi pi-clock text-xl text-red-500 dark:text-red-400" />
      </div>

      <div class="space-y-2 text-center">
        <h1 class="text-xl font-semibold">
          Belum Ada Shift Aktif
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Buka shift terlebih dahulu untuk mulai membuat transaksi
          <template v-if="outlet?.name">
            di <b>{{ outlet.name }}</b>
          </template>.
        </p>
      </div>

      <Button
        v-if="canOpenShift"
        label="Buka Shift"
        icon="pi pi-play"
        fluid
        :loading="isOpeningShift"
        :disabled="isOpeningShift || !outlet?.id"
        @click="onOpenShift"
      />
      <Message
        v-else
        severity="warn"
        icon="pi pi-info-circle"
        class="w-full"
      >
        <span class="text-sm">
          Anda tidak memiliki akses untuk membuka shift. Silakan hubungi pemilik outlet.
        </span>
      </Message>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { getOutlet, isHasPermission } from '@/helpers/auth.ts';
import { openShift } from '@/modules/shift/services/api.ts';
import { CREATE as SHIFT_CREATE } from '@/modules/shift/services/rbac.ts';
import { getErrorMessage } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import { useGlobalLoading } from '@umkm-pos/ui/composables/useGlobalLoading.ts';

const emit = defineEmits(['shift-opened']);

const { show, hide } = useGlobalLoading();
const outlet = getOutlet();
const canOpenShift = computed(() => isHasPermission(SHIFT_CREATE));
const isOpeningShift = ref(false);

const onOpenShift = async () => {
  if (isOpeningShift.value || !outlet?.id) return;

  try {
    isOpeningShift.value = true;
    show();

    const response = await openShift({ outlet_id: outlet.id });
    const newShift = response?.data?.data;
    if (newShift?.id) {
      showToast({
        type: 'success',
        title: 'Sukses',
        message: 'Shift berhasil dibuka',
      });
      emit('shift-opened', newShift);
    }
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal',
      message: getErrorMessage(error) || 'Gagal membuka shift',
    });
  } finally {
    isOpeningShift.value = false;
    hide();
  }
};
</script>

<style scoped>
@import "tailwindcss";
@import "@umkm-pos/ui/styles/themes.css";

.open-shift {
  @apply w-full flex items-center justify-center p-4;
  min-height: calc(100vh - 90px);
}

.open-shift__content {
  @apply w-full max-w-sm flex flex-col items-center gap-6 p-8 rounded-lg border border-gray-200 bg-white dark:border-dark-secondary dark:bg-dark-secondary;
}

.open-shift__icon {
  @apply w-20 h-20 flex items-center justify-center rounded-full bg-red-50 dark:bg-dark;
}
</style>
