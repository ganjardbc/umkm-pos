<template>
  <Dialog
    v-model:visible="visible"
    modal
    class="w-full max-w-md"
    :header="header"
    :closable="!submitting"
  >
    <div v-if="summary" class="space-y-2 text-sm">
      <div v-for="row in summaryRows" :key="row.label" class="flex justify-between">
        <span class="text-gray-500 dark:text-gray-400">{{ row.label }}</span>
        <span class="font-semibold">{{ row.value }}</span>
      </div>
    </div>

    <div v-else class="space-y-3">
      <UiFormGroup :label="mode === 'open' ? 'Kas Awal' : 'Kas Akhir'" variant="vertical">
        <InputNumber
          v-model="amount"
          mode="currency"
          currency="IDR"
          locale="id-ID"
          :min="0"
          fluid
          :disabled="submitting"
          placeholder="Masukkan nominal (boleh 0)"
        />
      </UiFormGroup>
      <Message v-if="errorMessage" severity="error" size="small">
        {{ errorMessage }}
      </Message>
    </div>

    <template #footer>
      <Button
        v-if="summary"
        label="Tutup"
        @click="visible = false"
      />
      <template v-else>
        <Button
          label="Batal"
          severity="secondary"
          variant="outlined"
          :disabled="submitting"
          @click="visible = false"
        />
        <Button
          :label="mode === 'open' ? 'Buka Shift' : 'Tutup Shift'"
          :loading="submitting"
          :disabled="submitting || amount === null"
          @click="onSubmit"
        />
      </template>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { getErrorMessage } from '@umkm-pos/ui/helpers/utils';
import { formatCash } from '@/modules/shift/services/cash.ts';

const props = defineProps<{
  mode: 'open' | 'close';
  // Calls the API; resolves with the response data. Rejects => error shown, dialog stays open.
  submit: (amount: number) => Promise<any>;
}>();

const visible = defineModel<boolean>('visible', { default: false });

const amount = ref<number | null>(null);
const submitting = ref(false);
const errorMessage = ref('');
const summary = ref<any>(null);

watch(visible, (v) => {
  if (v) {
    amount.value = null;
    errorMessage.value = '';
    summary.value = null;
  }
});

const header = computed(() => {
  if (summary.value) return 'Ringkasan Kas Shift';
  return props.mode === 'open' ? 'Buka Shift' : 'Tutup Shift';
});

const summaryRows = computed(() => {
  const s = summary.value || {};
  const expected = Number(s.expected_cash);
  const opening = Number(s.opening_cash);
  const diff = Number(s.cash_difference);
  return [
    { label: 'Kas Awal', value: formatCash(s.opening_cash) },
    // derived: expected = opening + cash sales
    { label: 'Penjualan Tunai', value: formatCash(Number.isNaN(expected - opening) ? null : expected - opening) },
    { label: 'Kas Diharapkan', value: formatCash(s.expected_cash) },
    { label: 'Kas Akhir', value: formatCash(s.closing_cash) },
    { label: 'Selisih', value: formatCash(Number.isNaN(diff) ? null : diff) },
  ];
});

const onSubmit = async () => {
  if (amount.value === null || submitting.value) return;
  submitting.value = true;
  errorMessage.value = '';
  try {
    const result = await props.submit(amount.value);
    if (props.mode === 'close') summary.value = result;
    else visible.value = false;
  } catch (error) {
    errorMessage.value = getErrorMessage(error) || 'Terjadi kesalahan';
  } finally {
    submitting.value = false;
  }
};
</script>
