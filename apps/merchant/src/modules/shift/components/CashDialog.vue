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
        <span
          class="font-semibold"
          :class="row.label === 'Selisih' ? differenceClass : ''"
        >{{ row.value }}</span>
      </div>
    </div>

    <div v-else class="space-y-3">
      <Message v-if="mode === 'close' && unpaidCount" severity="warn" size="small">
        Ada {{ unpaidCount }} pesanan belum dibayar. Anda tetap bisa menutup kasir.
      </Message>
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
        <small v-if="mode === 'open' && suggestedOpening !== null && suggestedOpening !== undefined" class="text-gray-500 dark:text-gray-400">
          Terisi dari kas akhir terakhir ({{ formatCash(suggestedOpening) }}).
          <template v-if="amount !== null && amount !== suggestedOpening">
            Selisih {{ formatCash(amount - suggestedOpening) }}.
          </template>
        </small>
      </UiFormGroup>
      <div v-if="mode === 'close'" class="space-y-2">
        <Button
          :label="showCounter ? 'Sembunyikan hitung pecahan' : 'Hitung pecahan uang'"
          icon="pi pi-calculator"
          severity="secondary"
          variant="text"
          size="small"
          @click="showCounter = !showCounter"
        />
        <div v-if="showCounter" class="grid grid-cols-2 gap-2">
          <div v-for="d in DENOMINATIONS" :key="d" class="flex items-center gap-2 text-sm">
            <span class="w-24 text-gray-600 dark:text-gray-400">{{ formatCash(d) }}</span>
            <InputNumber
              v-model="counts[d]"
              :min="0"
              :disabled="submitting"
              input-class="w-16!"
              @update:model-value="applyCounts"
            />
          </div>
        </div>
      </div>
      <Message v-if="errorMessage" severity="error" size="small">
        {{ errorMessage }}
      </Message>
    </div>

    <template #footer>
      <template v-if="summary">
        <Button
          label="Bagikan"
          icon="pi pi-share-alt"
          severity="secondary"
          variant="outlined"
          @click="shareSummary"
        />
        <Button label="Selesai" @click="visible = false" />
      </template>
      <template v-else>
        <Button
          label="Batal"
          severity="secondary"
          variant="outlined"
          :disabled="submitting"
          @click="visible = false"
        />
        <Button
          :label="mode === 'open' ? 'Buka Kasir' : 'Tutup Kasir'"
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
import { getOutlet } from '@/helpers/auth.ts';
import { showToast } from '@umkm-pos/ui/helpers/toast';

const props = defineProps<{
  mode: 'open' | 'close';
  // Calls the API; resolves with the response data. Rejects => error shown, dialog stays open.
  submit: (amount: number) => Promise<any>;
  // Open mode: last closing cash of the outlet, prefilled into the input.
  suggestedOpening?: number | null;
  // Close mode: unpaid orders found at the outlet; warns but never blocks.
  unpaidCount?: number | null;
}>();

// Pecahan rupiah (kertas dan logam) for the cash counter.
const DENOMINATIONS = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100];
const showCounter = ref(false);
const counts = ref<Record<number, number | null>>({});
// Counting fills the Kas Akhir input; the input stays editable.
const applyCounts = () => {
  amount.value = DENOMINATIONS.reduce((sum, d) => sum + d * (counts.value[d] || 0), 0);
};

const visible = defineModel<boolean>('visible', { default: false });

const amount = ref<number | null>(null);
const submitting = ref(false);
const errorMessage = ref('');
const summary = ref<any>(null);

watch(visible, (v) => {
  if (v) {
    amount.value = props.mode === 'open' ? (props.suggestedOpening ?? null) : null;
    errorMessage.value = '';
    summary.value = null;
    counts.value = {};
    showCounter.value = false;
  }
});

const header = computed(() => {
  if (summary.value) return 'Ringkasan Tutup Kasir';
  return props.mode === 'open' ? 'Buka Kasir' : 'Tutup Kasir';
});

const summaryRows = computed(() => {
  const s = summary.value || {};
  const expected = Number(s.expected_cash);
  const opening = Number(s.opening_cash);
  const totalIn = Number(s.total_cash_in ?? 0);
  const totalOut = Number(s.total_cash_out ?? 0);
  const diff = Number(s.cash_difference);
  return [
    { label: 'Kas Awal', value: formatCash(s.opening_cash) },
    // derived: expected = opening + cash sales + cash in - cash out
    { label: 'Penjualan Tunai', value: formatCash(Number.isNaN(expected - opening) ? null : Math.round((expected - opening - totalIn + totalOut) * 100) / 100) },
    { label: 'Kas Masuk', value: formatCash(totalIn) },
    { label: 'Kas Keluar', value: formatCash(totalOut) },
    { label: 'Kas Seharusnya', value: formatCash(s.expected_cash) },
    { label: 'Kas Akhir', value: formatCash(s.closing_cash) },
    { label: 'Selisih', value: formatCash(Number.isNaN(diff) ? null : diff) },
  ];
});

// green = pas, yellow = selisih kecil (<= Rp5.000), red = lebih besar. Threshold is a UI hint only.
const differenceClass = computed(() => {
  const diff = Math.abs(Number(summary.value?.cash_difference));
  if (Number.isNaN(diff)) return '';
  if (diff === 0) return 'text-green-600';
  return diff <= 5000 ? 'text-yellow-600' : 'text-red-600';
});

const shareSummary = async () => {
  const text = [
    `Laporan Tutup Kasir${getOutlet()?.name ? ` - ${getOutlet().name}` : ''}`,
    ...summaryRows.value.map((r) => `${r.label}: ${r.value}`),
  ].join('\n');
  try {
    if (navigator.share) await navigator.share({ title: 'Laporan Tutup Kasir', text });
    else {
      await navigator.clipboard.writeText(text);
      showToast({ type: 'success', title: 'Sukses', message: 'Ringkasan disalin' });
    }
  } catch {
    // user cancelled the share sheet
  }
};

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
