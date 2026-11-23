<template>
  <div class="w-full space-y-4">
    <!-- 1. Status -->
    <ShiftStatus :outlet-id="outlet?.id" />

    <template v-if="isOpen">
      <!-- 2. Uang -->
      <div class="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <div v-for="item in moneyCards" :key="item.label" class="p-4 rounded-lg bg-gray-50 dark:bg-dark-secondary space-y-1">
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ item.label }}</div>
          <div class="text-base font-semibold text-gray-900 dark:text-white">{{ item.value }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">{{ item.hint }}</div>
        </div>

        <!-- Hitung buta (B-1): kasir tidak menerima angkanya. Pemilik/manajer (izin shift.view_expected)
             menerima expected_cash_live dari API; selain itu tetap terkunci sampai kas akhir diisi. -->
        <div v-if="hasLiveExpected" class="p-4 rounded-lg bg-gray-50 dark:bg-dark-secondary space-y-1 col-span-2 xl:col-span-1">
          <div class="text-sm text-gray-600 dark:text-gray-400">Kas Seharusnya</div>
          <div class="text-base font-semibold text-gray-900 dark:text-white">{{ formatCash(currentShift.expected_cash_live) }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Hanya terlihat oleh pemilik. Diperbarui saat halaman dimuat ulang.</div>
        </div>
        <div v-else class="p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 space-y-1 col-span-2 xl:col-span-1">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <i class="pi pi-lock text-xs mr-1" />Kas seharusnya disembunyikan
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Hitung uang di laci dulu. Angka sistem muncul setelah kas akhir diisi.
          </div>
        </div>
      </div>

      <!-- 3. Catatan Kas -->
      <CashEntryList :entries="currentShift.cash_entries || []">
        <template #action>
          <div v-if="canRecordCash" class="flex gap-2">
            <Button label="Kas Masuk" icon="pi pi-plus" size="small" severity="success" @click="openCashEntry('in')" />
            <Button label="Kas Keluar" icon="pi pi-minus" size="small" severity="danger" @click="openCashEntry('out')" />
          </div>
        </template>
      </CashEntryList>

      <CashEntryDialog
        v-model:visible="showCashEntry"
        :initial-type="cashEntryType"
        :submit="(data) => addCashEntry(currentShift.id, data)"
        @saved="reloadShift"
      />

      <!-- 4. Kasir Bertugas -->
      <UiCard v-if="showStaff">
        <div class="w-full flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div class="space-y-1">
            <h2 class="text-lg font-semibold">Kasir Bertugas</h2>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ activeStaffNames || 'Belum ada kasir bertugas.' }}
            </div>
          </div>
          <Button
            :label="showStaffManager ? 'Sembunyikan' : 'Kelola dan Serah Terima'"
            severity="secondary"
            size="small"
            @click="showStaffManager = !showStaffManager"
          />
        </div>
      </UiCard>

      <ParticipantManagement
        v-if="showStaff && showStaffManager"
        :shift-id="currentShift.id"
        :is-shift-owner="isUserOwner"
        :is-shift-open="isOpen"
        @participant-added="reloadStaff"
        @participant-removed="reloadStaff"
        @handoff-complete="onHandoffComplete"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useShift } from '@/modules/shift/composables/useShift.ts';
import { getOutlet, isHasPermission } from '@/helpers/auth.ts';
import { UPDATE } from '@/modules/shift/services/rbac.ts';
import { addCashEntry } from '@/modules/shift/services/api.ts';
import { getListUser } from '@/modules/user/services/api.ts';
import { formatCash } from '@/modules/shift/services/cash.ts';
import ParticipantManagement from '@/modules/shift/components/ParticipantManagement.vue';
import ShiftStatus from '@/modules/shift/components/ShiftStatus.vue';
import CashEntryDialog from '@/modules/shift/components/CashEntryDialog.vue';
import CashEntryList from '@/modules/shift/components/CashEntryList.vue';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';

const outlet = getOutlet();

const {
  currentShift,
  participants,
  shiftRequired,
  isUserOwner,
  isShiftUserCanManage,
  fetchShift,
  fetchShiftParticipants,
} = useShift();

const isOpen = computed(() => currentShift.status === 'open');
const hasLiveExpected = computed(() => isOpen.value && currentShift.expected_cash_live != null);

// Money cards: only what the shift response carries.
const entries = computed(() => currentShift.cash_entries || []);
const countOf = (type: string) => entries.value.filter((e: any) => e.type === type).length;
const moneyCards = computed(() => [
  { label: 'Kas Awal', value: formatCash(currentShift.opening_cash), hint: 'Saat kasir dibuka' },
  { label: 'Kas Masuk', value: formatCash(currentShift.total_cash_in ?? 0), hint: `${countOf('in')} catatan` },
  { label: 'Kas Keluar', value: formatCash(currentShift.total_cash_out ?? 0), hint: `${countOf('out')} catatan` },
  { label: 'Transaksi', value: String(currentShift.total_transactions || 0), hint: 'Tidak termasuk yang dibatalkan' },
]);

// Catatan Kas: same rule as the detail page (API stays the final guard).
const showCashEntry = ref(false);
const cashEntryType = ref<'in' | 'out'>('in');
// The API only accepts entries from active participants of the shift.
const canRecordCash = computed(() => isOpen.value && isHasPermission(UPDATE) && shiftRequired.value && isShiftUserCanManage.value);
const openCashEntry = (type: 'in' | 'out') => {
  cashEntryType.value = type;
  showCashEntry.value = true;
};
const reloadShift = () => fetchShift({ shiftId: currentShift.id });

// Kasir Bertugas: shown only when the outlet has more than one user. Counted via the
// existing users list (meta.total); if the user may not read it, fall back to the
// shift's own participants.
const outletUserCount = ref<number | null>(null);
const showStaff = computed(() => (outletUserCount.value ?? participants.value.length) > 1);
const showStaffManager = ref(false);
const activeStaffNames = computed(() =>
  participants.value
    .filter((p: any) => !p.participant_removed_at)
    .map((p: any) => p.user_name)
    .join(', '),
);

const reloadStaff = async () => {
  if (currentShift.id) {
    await fetchShift({ shiftId: currentShift.id });
    await fetchShiftParticipants({ shiftId: currentShift.id });
  }
};
const onHandoffComplete = reloadStaff;

onMounted(async () => {
  try {
    const response = await getListUser({ limit: 1, page: 1 });
    const total = response?.data?.data?.meta?.total;
    outletUserCount.value = typeof total === 'number' ? total : null;
  } catch {
    outletUserCount.value = null;
  }
});
</script>
