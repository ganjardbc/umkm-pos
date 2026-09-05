<template>
  <div class="w-full space-y-4">
    <div class="flex flex-col md:flex-row gap-4">
      <UiSearch
        v-model="form.search"
        type="search"
        class="w-full"
        @input="search"
      />
    </div>

    <UiLoading
      v-if="loading"
      message="Loading shifts..."
    />

    <div v-else-if="shifts.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-400">
      <i class="pi pi-inbox mb-3 text-4xl" />
      <p class="text-sm">Shifts are empty.</p>
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <UiCard
        v-for="(shift, index) in shifts"
        :key="shift.id"
        class="relative overflow-hidden"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
              {{ shift.shift_owner?.name || '-' }}
            </p>
            <p class="mt-0.5 text-xs text-slate-400">
              #{{ getNoTable(index, pagination.page, pagination.rows) }}
            </p>
          </div>
          <div class="flex shrink-0 gap-1">
            <Tag
              :value="shift.status"
              :severity="getStatusSeverity(shift.status)"
              class="capitalize text-xs!"
            />
          </div>
        </div>

        <Divider class="my-0!" />

        <div class="grid grid-cols-2 gap-y-2 text-xs">
          <span class="text-slate-400">Outlet</span>
          <span class="text-right text-slate-700 dark:text-slate-300">{{ shift.outlet?.name || '-' }}</span>

          <span class="text-slate-400">Date</span>
          <span class="text-right text-slate-700 dark:text-slate-300">{{ formatDate(shift.start_time) }}</span>

          <span class="text-slate-400">Time</span>
          <span class="text-right text-slate-700 dark:text-slate-300">{{ formatRangeTime(shift.start_time, shift.end_time) }}</span>

          <span class="text-slate-400">Duration</span>
          <span class="text-right text-slate-700 dark:text-slate-300">{{ getDuration(shift.start_time, shift.end_time) }}</span>
        </div>

        <Divider class="my-0!" />

        <div class="flex items-center justify-end">
          <div class="flex gap-1">
            <Button
              severity="secondary"
              variant="outlined"
              icon="pi pi-eye"
              size="small"
              :disabled="!isCanDetail || shift.status === 'open'"
              @click="onDetailShift(shift)"
            />
          </div>
        </div>
      </UiCard>
    </div>

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
import { getNoTable, getErrorMessage, formatDate, formatRangeTime, getDuration } from '@/helpers/utils.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/shift/services/constants.ts';
import { getListShift } from '@/modules/shift/services/api.ts';
import { showToast } from '@/helpers/toast.ts';
import { getOutlet, isHasPermission } from '@/helpers/auth.ts';
import { READ } from '@/modules/shift/services/rbac.ts';
import UiCard from '@/components/UiCard.vue';
import UiSearch from '@/components/UiSearch.vue';
import UiPagination from '@/components/UiPagination.vue';
import UiLoading from '@/components/UiLoading.vue';

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

const fetchShift = async () => {
  try {
    loading.value = true;

    const payload = {
      outlet_id: outlet?.id,
      page: pagination.value.page,
      limit: pagination.value.rows,
    }
    const response = await getListShift(payload);
    const { data, meta } = response?.data?.data || {};

    shifts.value = data || [];
    pagination.value.totalRecords = meta?.total;
    pagination.value.pageCount = meta?.totalPages;
  } catch (error) {
    console.log(error);
    showToast({
        type: 'error',
        title: 'Error.',
        message: getErrorMessage(error) || 'There was an error.',
    });
  } finally {
    loading.value = false;
  }
};

const onPageChange = (event: any) => {
  pagination.value.page = event.page + 1;
  fetchShift();
};

// Search
const form = ref({
  search: '',
});

const search = () => {
  console.log(form.value);
};

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'open':
      return 'success';
    case 'closed':
      return 'danger';
    default:
      return 'warning';
  }
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
