<template>
  <div class="w-full space-y-4">
    <div class="flex flex-col md:flex-row md:items-center gap-4">
      <DatePicker
        v-model="date"
        :max-date="new Date()"
        date-format="yy-mm-dd"
        show-button-bar
        :manual-input="false"
        placeholder="Pilih tanggal"
        show-icon
        class="w-full"
        @update:model-value="fetchReport"
      />
      <Button
        v-if="report"
        label="Bagikan"
        icon="pi pi-share-alt"
        severity="secondary"
        variant="outlined"
        @click="shareReport"
      />
    </div>

    <UiLoading v-if="loading" message="Memuat laporan..." />

    <div v-else-if="report && report.shifts.length === 0" class="flex flex-col items-center py-16 text-gray-400">
      <i class="pi pi-inbox mb-3 text-4xl" />
      <p class="text-sm">Tidak ada kasir yang dibuka pada tanggal ini.</p>
    </div>

    <template v-else-if="report">
      <Message v-if="report.open_shifts" severity="info" icon="pi pi-lock">
        {{ report.open_shifts }} kasir masih buka. Kas seharusnya dan penjualan tunainya baru muncul setelah ditutup, dan belum masuk total.
      </Message>

      <ReportTotals :items="totalCards" />

      <UiCard>
        <h2 class="text-lg font-semibold">Per Kasir Dibuka</h2>
        <DataTable :value="report.shifts" size="small" scrollable>
          <Column header="Waktu">
            <template #body="{ data }">
              {{ formatRangeTime(data.start_time, data.end_time) }}
              <div class="text-xs text-slate-400">{{ data.shift_owner?.name || '-' }}</div>
            </template>
          </Column>
          <Column header="Kas Awal"><template #body="{ data }">{{ formatCash(data.opening_cash) }}</template></Column>
          <Column header="Penjualan Tunai"><template #body="{ data }">{{ formatCash(data.cash_sales) }}</template></Column>
          <Column header="Kas Masuk"><template #body="{ data }">{{ formatCash(data.cash_in) }}</template></Column>
          <Column header="Kas Keluar"><template #body="{ data }">{{ formatCash(data.cash_out) }}</template></Column>
          <Column header="Kas Akhir">
            <template #body="{ data }">
              {{ data.closed_by_system ? 'Tidak dihitung' : formatCash(data.closing_cash) }}
            </template>
          </Column>
          <Column header="Selisih">
            <template #body="{ data }">
              <Tag
                v-if="differenceSeverity(data.cash_difference)"
                :value="formatCash(data.cash_difference)"
                :severity="differenceSeverity(data.cash_difference) ?? undefined"
              />
              <span v-else>-</span>
            </template>
          </Column>
          <Column header="Status">
            <template #body="{ data }">
              <Tag
                :value="data.status === 'open' ? 'Buka' : data.closed_by_system ? 'Ditutup otomatis' : 'Tutup'"
                :severity="data.status === 'open' ? 'success' : 'secondary'"
              />
            </template>
          </Column>
        </DataTable>
      </UiCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { getOutlet } from '@/helpers/auth.ts';
import { getDailyReport } from '@/modules/shift/services/api.ts';
import { formatCash, differenceSeverity } from '@/modules/shift/services/cash.ts';
import { getErrorMessage, formatRangeTime } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import ReportTotals from '@/modules/reports/components/ReportTotals.vue';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import UiLoading from '@umkm-pos/ui/components/UiLoading.vue';

const outlet = getOutlet();
const date = ref<Date | null>(new Date());
const loading = ref(false);
const report = ref<any>(null);

const totalCards = computed(() => {
  const t = report.value?.totals || {};
  return [
    { label: 'Kas Awal', value: formatCash(t.opening_cash) },
    { label: 'Penjualan Tunai', value: formatCash(t.cash_sales) },
    { label: 'Kas Masuk', value: formatCash(t.cash_in) },
    { label: 'Kas Keluar', value: formatCash(t.cash_out) },
    { label: 'Kas Seharusnya', value: formatCash(t.expected_cash) },
    { label: 'Kas Akhir', value: formatCash(t.closing_cash) },
    { label: 'Selisih', value: formatCash(t.cash_difference) },
    { label: 'Transaksi', value: String(t.transactions ?? 0) },
  ];
});

const fetchReport = async () => {
  if (!date.value) return; // cleared via the picker's button bar
  try {
    loading.value = true;
    const response = await getDailyReport(outlet.id, dayjs(date.value).format('YYYY-MM-DD'));
    report.value = response?.data?.data || null;
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal',
      message: getErrorMessage(error) || 'Terjadi kesalahan saat memuat laporan.',
    });
  } finally {
    loading.value = false;
  }
};

const shareReport = async () => {
  const text = [
    `Laporan Harian Kasir - ${outlet?.name || ''} - ${report.value.date}`,
    ...totalCards.value.map((c) => `${c.label}: ${c.value}`),
  ].join('\n');
  try {
    if (navigator.share) await navigator.share({ title: 'Laporan Harian Kasir', text });
    else {
      await navigator.clipboard.writeText(text);
      showToast({ type: 'success', title: 'Sukses', message: 'Laporan disalin' });
    }
  } catch {
    // user cancelled the share sheet
  }
};

onMounted(fetchReport);
</script>
