import { computed, onMounted, ref, watch } from 'vue';
import dayjs from 'dayjs';
import { getOutlet } from '@/helpers/auth.ts';

// Date-range filter shared by report pages: defaults to the last 30 days and
// exposes ready-to-send query params (date_from, date_to, outlet_id).
export function useDateRange() {
  const dateRange = ref<Date[] | null>(null);
  const dateRangeError = ref<string | null>(null);

  const validate = (): boolean => {
    dateRangeError.value = null;
    const [start, end] = dateRange.value || [];

    if (!start || !end) {
      dateRangeError.value = 'Pilih tanggal mulai dan tanggal selesai';
    } else if (start > end) {
      dateRangeError.value = 'Tanggal mulai harus sebelum atau sama dengan tanggal selesai';
    } else if (end > new Date()) {
      dateRangeError.value = 'Tanggal selesai tidak boleh di masa depan';
    }
    return !dateRangeError.value;
  };

  const params = computed(() => {
    const [start, end] = dateRange.value || [];
    if (!start || !end) return null;
    return {
      date_from: dayjs(start).format('YYYY-MM-DD'),
      date_to: dayjs(end).format('YYYY-MM-DD'),
      outlet_id: getOutlet()?.id,
    };
  });

  watch(dateRange, () => {
    if (dateRange.value?.length === 2) validate();
  }, { deep: true });

  onMounted(() => {
    dateRange.value = [dayjs().subtract(30, 'day').toDate(), new Date()];
  });

  return { dateRange, dateRangeError, params };
}
