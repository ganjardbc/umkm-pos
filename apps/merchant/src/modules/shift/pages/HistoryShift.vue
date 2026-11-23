<template>
  <div class="w-full space-y-4">
    <div class="flex flex-col md:flex-row md:items-center gap-4">
      <UiSearch
        v-model="form.search"
        type="search"
        placeholder="Cari riwayat..."
        class="w-full"
        @input="search"
      />
      <DatePicker
        v-model="form.dateRange"
        selection-mode="range"
        :max-date="new Date()"
        date-format="yy-mm-dd"
        placeholder="Periode"
        show-button-bar
        :manual-input="false"
        class="w-full md:w-64"
        @update:model-value="applyFilter"
      />
      <label class="flex items-center gap-2 text-sm whitespace-nowrap">
        <Checkbox v-model="form.onlyDifference" binary @update:model-value="applyFilter" />
        Hanya yang ada selisih
      </label>
    </div>
    <p v-if="hasFilter" class="text-xs text-slate-400">
      Filter memeriksa 100 catatan terbaru.
    </p>

    <UiLoading
      v-if="loading"
      message="Memuat riwayat..."
    />

    <div v-else-if="shifts.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
      <i class="pi pi-inbox mb-3 text-4xl" />
      <p class="text-sm">Riwayat masih kosong.</p>
    </div>

    <UiCard v-else>
      <DataTable :value="shifts" size="small" scrollable>
        <Column header="Tanggal">
          <template #body="{ data }">
            {{ formatDate(data.start_time) }}
            <div class="text-xs text-slate-400">{{ formatRangeTime(data.start_time, data.end_time) }}</div>
          </template>
        </Column>
        <Column header="Kasir">
          <template #body="{ data }">{{ data.shift_owner?.name || '-' }}</template>
        </Column>
        <Column header="Kas Awal">
          <template #body="{ data }">{{ formatCash(data.opening_cash) }}</template>
        </Column>
        <Column header="Kas Akhir">
          <template #body="{ data }">{{ formatCash(data.closing_cash) }}</template>
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
              :value="data.status === 'open' ? 'Buka' : 'Tutup'"
              :severity="data.status === 'open' ? 'success' : 'secondary'"
            />
          </template>
        </Column>
        <Column header="">
          <template #body="{ data }">
            <Button
              severity="secondary"
              variant="outlined"
              icon="pi pi-eye"
              size="small"
              :disabled="!isCanDetail || data.status === 'open'"
              @click="onDetailShift(data)"
            />
          </template>
        </Column>
      </DataTable>
    </UiCard>

    <UiPagination
      v-model="pagination"
      class="px-0!"
      @page="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getErrorMessage, formatDate, formatRangeTime } from '@umkm-pos/ui/helpers/utils';
import { PREFIX_ROUTE_NAME } from '@/modules/shift/services/constants.ts';
import { getListShift } from '@/modules/shift/services/api.ts';
import { formatCash, differenceSeverity } from '@/modules/shift/services/cash.ts';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import { getOutlet, isHasPermission } from '@/helpers/auth.ts';
import { READ } from '@/modules/shift/services/rbac.ts';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import UiSearch from '@umkm-pos/ui/components/UiSearch.vue';
import UiPagination from '@umkm-pos/ui/components/UiPagination.vue';
import UiLoading from '@umkm-pos/ui/components/UiLoading.vue';

const outlet = getOutlet();
const router = useRouter();

// RBAC
const isCanDetail = computed(() => isHasPermission(READ));

// Fetch Data
const loading = ref(false);
const shifts = ref<any[]>([]);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

// The list endpoint has no period or difference filter, so when one is active we load the
// latest 100 shifts and filter/paginate here. shortcut: older history is not reached while filtering.
const hasFilter = computed(() => !!form.value.onlyDifference || !!form.value.dateRange?.[0]);

const matchesFilter = (s: any) => {
  const [from, to] = form.value.dateRange || [];
  const start = new Date(s.start_time).getTime();
  if (from && start < new Date(from).setHours(0, 0, 0, 0)) return false;
  if (to && start > new Date(to).setHours(23, 59, 59, 999)) return false;
  if (form.value.onlyDifference && !(Number(s.cash_difference) !== 0 && s.cash_difference != null)) return false;
  return true;
};

const fetchShift = async () => {
  try {
    loading.value = true;
    const filtering = hasFilter.value;
    const payload = {
      outlet_id: outlet?.id,
      page: filtering ? 1 : pagination.value.page,
      limit: filtering ? 100 : pagination.value.rows,
      search: form.value.search ? form.value.search.trim() : undefined,
    };
    const response = await getListShift(payload);
    const { data, meta } = response?.data?.data || {};

    if (filtering) {
      const all = (data || []).filter(matchesFilter);
      const { page, rows } = pagination.value;
      shifts.value = all.slice((page - 1) * rows, page * rows);
      pagination.value.totalRecords = all.length;
      pagination.value.pageCount = Math.ceil(all.length / rows);
    } else {
      shifts.value = data || [];
      pagination.value.totalRecords = meta?.total;
      pagination.value.pageCount = meta?.totalPages;
    }
  } catch (error) {
    console.log(error);
    showToast({
        type: 'error',
        title: 'Gagal',
        message: getErrorMessage(error) || 'Terjadi kesalahan saat memuat riwayat.',
    });
  } finally {
    loading.value = false;
  }
};

const applyFilter = () => {
  pagination.value.page = 1;
  fetchShift();
};

const onPageChange = (event: any) => {
  pagination.value.page = event.page + 1;
  fetchShift();
};

// Search
const form = ref<{ search: string; dateRange: Date[] | null; onlyDifference: boolean }>({
  search: '',
  dateRange: null,
  onlyDifference: false,
});

let searchDebounceTimer: ReturnType<typeof setTimeout>;
const search = () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    pagination.value.page = 1;
    fetchShift();
  }, 300);
};

const onDetailShift = (shift: any) => {
  router.push({
    name: `${PREFIX_ROUTE_NAME}-detail`,
    params: { id: shift.id },
  });
}

onMounted(() => {
  fetchShift();
});
</script>

<style scoped>
</style>
