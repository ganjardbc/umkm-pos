<template>
  <div
    class="flex items-center gap-x-4 gap-y-1 flex-wrap px-3 py-2 rounded-lg border border-green-500/40 bg-green-50 dark:bg-dark-secondary text-sm"
  >
    <span class="flex items-center gap-2 font-semibold">
      <span class="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
      Kasir buka, {{ currentShift.shift_owner?.name || '-' }}
    </span>
    <span class="text-gray-600 dark:text-gray-400">Sejak {{ formatTime(currentShift.start_time) }}</span>
    <span class="text-gray-600 dark:text-gray-400">Kas awal {{ formatCash(currentShift.opening_cash) }}</span>
    <span class="text-gray-600 dark:text-gray-400">{{ currentShift.total_transactions || 0 }} transaksi</span>

    <div v-if="canUpdate" class="ml-auto flex gap-2">
      <Button label="Catat Kas" icon="pi pi-wallet" size="small" severity="secondary" @click="showCashEntry = true" />
      <Button label="Tutup Kasir" size="small" severity="danger" @click="showClose = true" />
    </div>

    <CashEntryDialog
      v-model:visible="showCashEntry"
      :submit="(data) => addCashEntry(currentShift.id, data)"
      @saved="reload"
    />
    <CashDialog v-model:visible="showClose" mode="close" :submit="onClose" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useShift } from '@/modules/shift/composables/useShift.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { UPDATE } from '@/modules/shift/services/rbac.ts';
import { addCashEntry, closeShift } from '@/modules/shift/services/api.ts';
import { formatCash } from '@/modules/shift/services/cash.ts';
import CashEntryDialog from '@/modules/shift/components/CashEntryDialog.vue';
import CashDialog from '@/modules/shift/components/CashDialog.vue';
import { formatTime } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';

const { currentShift, fetchShift } = useShift();

const canUpdate = computed(() => isHasPermission(UPDATE));
const showCashEntry = ref(false);
const showClose = ref(false);

const reload = () => fetchShift({ shiftId: currentShift.id });

// Errors propagate to CashDialog, which shows them and keeps the form open.
// After closing, the page falls back to the OpenShift screen via currentShift.status.
const onClose = async (closingCash: number) => {
  const shiftId = currentShift.id;
  const response = await closeShift(shiftId, { closing_cash: closingCash });
  await fetchShift({ shiftId });
  showToast({ type: 'success', title: 'Sukses', message: 'Kasir berhasil ditutup' });
  return response?.data?.data;
};

defineExpose({ reload });
</script>
