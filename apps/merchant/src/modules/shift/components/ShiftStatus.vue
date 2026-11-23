<template>
  <UiCard>
    <!-- Kasir buka -->
    <div v-if="isOpen" class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full bg-green-500 shrink-0" />
        <div>
          <div class="text-base font-semibold">
            Kasir sedang buka
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">· {{ duration }}</span>
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Dibuka {{ currentShift.shift_owner?.name || '-' }} pukul {{ formatTime(currentShift.start_time) }}
          </div>
        </div>
      </div>
      <Button
        v-if="canClose"
        label="Tutup Kasir"
        severity="danger"
        class="w-full md:w-auto"
        :disabled="loading"
        @click="startClose"
      />
    </div>

    <!-- Belum dimuat: jangan tampilkan keadaan "tutup" sebelum data datang -->
    <UiLoading v-else-if="!loaded" message="Memuat..." />

    <!-- Kasir tutup -->
    <UiEmptyState
      v-else
      class="py-8!"
      :title="shiftRequired ? 'Kasir belum dibuka' : 'Buka/tutup kasir tidak diwajibkan'"
      :description="emptyDescription"
    >
      <template #icon>
        <div class="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100 dark:bg-dark">
          <i class="pi pi-lock text-3xl text-gray-400" />
        </div>
      </template>
      <template v-if="shiftRequired && canOpen" #actions>
        <Button
          label="Buka Kasir"
          icon="pi pi-play"
          class="mt-6"
          :disabled="loading"
          @click="startOpen"
        />
      </template>
    </UiEmptyState>

    <Message
      v-if="isOpen && canClose && !isUserOwner"
      severity="info"
      icon="pi pi-info-circle"
      class="mt-4"
    >
      Hanya {{ currentShift.shift_owner?.name }} yang dapat menutup kasir ini.
    </Message>

    <Message
      v-if="isOpen && !isUserInShift && !isUserRemovedFromShift"
      severity="info"
      icon="pi pi-info-circle"
      class="mt-4"
    >
      <b>Anda bukan kasir bertugas saat ini.</b><br>
      <span class="text-sm">
        Untuk ikut bertugas, minta penanggung jawab menambahkan Anda.
      </span>
    </Message>

    <Message
      v-if="isOpen && isUserRemovedFromShift"
      severity="warn"
      icon="pi pi-info-circle"
      class="mt-4"
    >
      <b>Anda telah dikeluarkan dari kasir bertugas.</b><br>
      <span class="text-sm">
        Hubungi penanggung jawab untuk mengaktifkan kembali.
      </span>
    </Message>

    <CashDialog
      v-model:visible="cashVisible"
      :mode="cashMode || 'open'"
      :suggested-opening="suggestedOpening"
      :unpaid-count="unpaidCount"
      :submit="cashMode === 'close' ? handleCloseShift : handleOpenShift"
    />
  </UiCard>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref, computed } from 'vue';
import dayjs from 'dayjs';
import CashDialog from '@/modules/shift/components/CashDialog.vue';
import { useShift } from '@/modules/shift/composables/useShift.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { CREATE, UPDATE } from '@/modules/shift/services/rbac.ts';
import { formatTime } from '@umkm-pos/ui/helpers/utils';
import { showToast } from '@umkm-pos/ui/helpers/toast';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import UiEmptyState from '@umkm-pos/ui/components/UiEmptyState.vue';
import UiLoading from '@umkm-pos/ui/components/UiLoading.vue';
import * as shiftApi from '@/modules/shift/services/api.ts';

const props = defineProps({
  outletId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['shift-loaded']);

const {
  shiftRequired,
  isUserOwner,
  isUserInShift,
  isUserRemovedFromShift,
  currentShift,
  loading,
  fetchShift,
  fetchShiftParticipants,
} = useShift();

const isOpen = computed(() => currentShift.status === 'open');
const canOpen = computed(() => isHasPermission(CREATE));
const canClose = computed(() => isHasPermission(UPDATE));

// Elapsed time, refreshed once a minute.
const now = ref(dayjs());
let timer: ReturnType<typeof setInterval> | undefined;
const duration = computed(() => {
  const minutes = Math.max(0, now.value.diff(dayjs(currentShift.start_time), 'minute'));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h} jam ${m} menit` : `${m} menit`;
});

const loaded = ref(false);
const emptyDescription = computed(() => {
  if (!shiftRequired.value) return 'Outlet ini langsung berjualan tanpa membuka kasir, jadi kas tidak dicatat.';
  if (!canOpen.value) return 'Anda tidak memiliki akses untuk membuka kasir. Hubungi pemilik outlet.';
  return 'Buka kasir untuk mulai menerima transaksi. Kas awal terisi dari kas akhir terakhir dan bisa Anda ubah.';
});

const fetchOutletShift = async () => {
  try {
    const response = await shiftApi.getOutletShift(props.outletId);
    const shiftData = response?.data?.data || {};
    if (shiftData?.id) {
      await fetchShift({ shiftId: shiftData.id });
      await fetchShiftParticipants({ shiftId: shiftData.id });
      emit('shift-loaded', shiftData);
    }
  } catch (error) {
    console.error('Failed to fetch outlet shift:', error);
  } finally {
    loaded.value = true;
  }
};

const cashMode = ref<'open' | 'close' | null>(null);
const suggestedOpening = ref<number | null>(null);
const unpaidCount = ref<number | null>(null);
const startClose = async () => {
  unpaidCount.value = await shiftApi.getUnpaidCount(props.outletId);
  cashMode.value = 'close';
};
// Load before the dialog shows so the prefill is ready when it opens.
const startOpen = async () => {
  suggestedOpening.value = await shiftApi.getLastClosingCash(props.outletId);
  cashMode.value = 'open';
};
const cashVisible = computed({
  get: () => cashMode.value !== null,
  set: (v) => { if (!v) cashMode.value = null; },
});

// Errors propagate to CashDialog, which shows them and keeps the form open.
const handleOpenShift = async (openingCash: number) => {
  const response = await shiftApi.openShift({
    outlet_id: props.outletId,
    opening_cash: openingCash,
  });
  const newShift = response?.data?.data;
  if (newShift?.id) {
    await fetchOutletShift();
    showToast({
      type: 'success',
      title: 'Sukses',
      message: 'Kasir berhasil dibuka',
    });
  }
  return newShift;
};

const handleCloseShift = async (closingCash: number) => {
  const shiftId = currentShift.id;
  const response = await shiftApi.closeShift(shiftId, { closing_cash: closingCash });
  const closed = response?.data?.data;
  // Reload the closed shift itself: the outlet lookup may no longer return it.
  await fetchShift({ shiftId });
  showToast({
    type: 'success',
    title: 'Sukses',
    message: 'Kasir berhasil ditutup',
  });
  return closed;
};

onMounted(() => {
  timer = setInterval(() => { now.value = dayjs(); }, 60_000);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

// Also covers the first load.
watch(
  () => props.outletId,
  (newOutletId) => {
    if (newOutletId) fetchOutletShift();
  },
  { immediate: true },
);
</script>
