<template>
  <UiCard class="participant-management">
    <div class="participant-management__header">
      <h3 class="participant-management__title">Peserta Shift</h3>
      <div class="flex justify-end gap-2 items-center">
        <Button
          v-if="isShiftOwner && isShiftOpen"
          icon="pi pi-pencil"
          label="Oper Shift"
          severity="secondary"
          size="small"
          :loading="loading"
          @click="showHandoffDialog = true"
        />
        <Button
          v-if="isShiftOwner && isShiftOpen"
          icon="pi pi-plus"
          rounded
          text
          severity="success"
          :loading="loading"
          @click="showAddDialog = true"
        />
      </div>
    </div>

    <!-- Participants List -->
    <div class="participant-management__list">
      <div
        v-for="participant in participants"
        :key="participant.user_id"
        class="participant-item"
        :class="{ 'participant-item--removed': participant.participant_removed_at }"
      >
        <div class="participant-item__info">
          <div class="flex justify-between">
            <div class="participant-item__name">
              {{ participant.user_name }}
            </div>
            <div class="flex justify-end gap-2">
              <Tag
                v-if="participant.is_owner"
                value="Pemilik Shift"
                severity="info"
              />
              <Tag
                v-if="participant.participant_removed_at"
                value="Dihapus"
                severity="warning"
              />
            </div>
          </div>
          <div class="participant-item__meta">
            <span class="text-xs text-gray-500">
              Ditambahkan: {{ formatDate(participant.participant_added_at) }}
            </span>
            <Divider v-if="participant.transaction_count" layout="vertical" />
            <span v-if="participant.transaction_count" class="text-xs text-gray-500">
              Transaksi: {{ participant.transaction_count }}
            </span>
          </div>
        </div>
        <div v-if="isShiftOwner && isShiftOpen && !participant.is_owner" class="participant-item__actions">
          <Button
            v-if="!participant.participant_removed_at"
            icon="pi pi-trash"
            rounded
            text
            severity="danger"
            size="small"
            @click="confirmRemoveParticipant(participant)"
            :loading="loading"
          />
          <Button
            v-if="participant.participant_removed_at"
            icon="pi pi-undo"
            rounded
            text
            severity="success"
            size="small"
            @click="confirmRestoreParticipant(participant)"
            :loading="loading"
            title="Kembalikan peserta"
          />
        </div>
      </div>
    </div>
    <div v-if="participants.length === 0" class="participant-management__empty">
      <p>Belum ada peserta shift</p>
    </div>
  </UiCard>

  <!-- Add Participant Dialog -->
  <Dialog
    v-model:visible="showAddDialog"
    header="Tambah Peserta"
    :modal="true"
    class="w-full md:w-96"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">Pilih Pengguna</label>
        <Dropdown
          v-model="selectedUserId"
          :options="usersNotInShift"
          option-label="name"
          option-value="id"
          placeholder="Pilih pengguna"
          class="w-full"
          :loading="loadingUsers"
        />
      </div>
      <div class="flex gap-2 justify-end">
        <Button
          label="Batal"
          severity="secondary"
          @click="showAddDialog = false"
        />
        <Button
          label="Tambah"
          @click="handleAddParticipant"
          :loading="loading"
          :disabled="!selectedUserId"
        />
      </div>
    </div>
  </Dialog>

  <!-- Handoff Shift Dialog -->
  <Dialog
    v-model:visible="showHandoffDialog"
    header="Oper Shift"
    :modal="true"
    class="w-full md:w-96"
  >
    <div class="space-y-4">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Oper tanggung jawab shift kepada peserta lain
      </p>
      <div>
        <label class="block text-sm font-medium mb-2">Pilih Peserta Tujuan</label>
        <Dropdown
          v-model="selectedHandoffUserId"
          :options="otherParticipants"
          option-label="user_name"
          option-value="user_id"
          placeholder="Pilih peserta"
          class="w-full"
          :disabled="isHandoffComplete"
        />
      </div>

      <div class="flex items-center gap-2">
        <InputSwitch
          v-model="removePreviousOwner"
          :disabled="isHandoffComplete"
        />
        <label class="text-sm">Keluarkan saya dari peserta shift setelah oper shift</label>
      </div>

      <div v-if="isHandoffComplete" class="text-center text-sm text-green-600 dark:text-green-400">
        ✓ Oper shift berhasil diselesaikan
      </div>

      <div class="flex gap-2 justify-end">
        <Button
          label="Batal"
          severity="secondary"
          :disabled="isHandoffComplete || loading"
          @click="handleCloseHandoffDialog"
        />
        <Button
          label="Oper Shift"
          :loading="loading"
          :disabled="!selectedHandoffUserId || isHandoffComplete"
          @click="handleConfirmHandoff"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { type Participant, useShift } from '@/modules/shift/composables/useShift.ts';
import { getListUser } from '@/modules/user/services/api.ts';
import { showConfirm, showToast } from '@/helpers/toast.ts';
import { getErrorMessage } from '@/helpers/utils.ts';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputSwitch from 'primevue/inputswitch';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import UiCard from '@/components/UiCard.vue';

interface User {
  id: string;
  name: string;
  username: string;
}

const props = defineProps({
  shiftId: {
    type: String,
    required: true,
  },
  isShiftOwner: {
    type: Boolean,
    default: false,
  },
  isShiftOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['participant-added', 'participant-removed', 'handoff-complete']);

const { participants, loading, addParticipant, removeParticipant, restoreParticipant, handoffShift } = useShift();

const showAddDialog = ref(false);
const showHandoffDialog = ref(false);
const showRemoveConfirm = ref(false);
const selectedUserId = ref('');
const selectedHandoffUserId = ref('');
const removePreviousOwner = ref(false);
const isHandoffComplete = ref(false);
const participantToRemove = ref<Participant | null>(null);
const availableUsers = ref<User[]>([]);
const loadingUsers = ref(false);

const otherParticipants = computed(() => {
  return participants.value?.filter(
    (p: Participant) => !p.is_owner && !p.participant_removed_at
  ) || [];
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};

// Filter out users who are already participants
const usersNotInShift = computed(() => {
  const participantIds = new Set(participants.value?.map((p: Participant) => p.user_id) || []);
  return availableUsers.value.filter((user) => !participantIds.has(user.id));
});

const handleAddParticipant = async () => {
  if (!selectedUserId.value) return;

  try {
    await addParticipant({
      shiftId: props.shiftId,
      userId: selectedUserId.value,
    });
    showToast({
      type: 'success',
      title: 'Sukses',
      message: 'Peserta berhasil ditambahkan',
    } as any);
    showAddDialog.value = false;
    selectedUserId.value = '';
    emit('participant-added');
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal',
      message: getErrorMessage(error) || 'Gagal menambahkan peserta',
    } as any);
  }
};

const confirmRemoveParticipant = (participant: Participant) => {
  participantToRemove.value = participant;
  showConfirm({
    header: 'Hapus Peserta',
    message: 'Apakah Anda yakin ingin menghapus pengguna ini dari shift?',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    type: 'warn',
    accept: () => {
      handleRemoveParticipant();
    },
  });
};

const handleRemoveParticipant = async () => {
  if (!participantToRemove.value) return;

  try {
    await removeParticipant({
      shiftId: props.shiftId,
      userId: participantToRemove.value.user_id,
    });
    showToast({
      type: 'success',
      title: 'Sukses',
      message: 'Peserta berhasil dihapus',
    } as any);
    showRemoveConfirm.value = false;
    participantToRemove.value = null;
    emit('participant-removed');
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal',
      message: getErrorMessage(error) || 'Gagal menghapus peserta',
    } as any);
  }
};

const confirmRestoreParticipant = (participant: Participant) => {
  participantToRemove.value = participant;
  showConfirm({
    header: 'Kembalikan Peserta',
    message: 'Apakah Anda yakin ingin mengembalikan pengguna ini ke dalam shift?',
    rejectLabel: 'Batal',
    acceptLabel: 'Kembalikan',
    type: 'info',
    accept: () => {
      handleRestoreParticipant();
    },
  });
};

const handleRestoreParticipant = async () => {
  if (!participantToRemove.value) return;

  try {
    await restoreParticipant({
      shiftId: props.shiftId,
      userId: participantToRemove.value.user_id,
    });
    showToast({
      type: 'success',
      title: 'Sukses',
      message: 'Peserta berhasil dikembalikan',
    } as any);
    participantToRemove.value = null;
    emit('participant-added');
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Gagal',
      message: getErrorMessage(error) || 'Gagal mengembalikan peserta',
    } as any);
  }
};

const loadAvailableUsers = async () => {
  loadingUsers.value = true;
  try {
    const response = await getListUser({ limit: 100, page: 1 });
    const { data } = response?.data?.data || [];
    availableUsers.value = data.map((user: any) => ({
      id: user.id,
      name: user.name,
      username: user.username,
    }));
  } catch (error) {
    console.error('Failed to load users:', error);
  } finally {
    loadingUsers.value = false;
  }
};

const handleConfirmHandoff = () => {
  showConfirm({
    header: 'Oper Shift?',
    message: 'Apakah Anda yakin ingin mengoper shift ini?',
    rejectLabel: 'Batal',
    acceptLabel: 'Oper Shift',
    type: 'warn',
    accept: () => {
      handleHandoff();
    },
  });
};

const handleHandoff = async () => {
  if (!selectedHandoffUserId.value) return;

  try {
    await handoffShift({
      shiftId: props.shiftId,
      targetUserId: selectedHandoffUserId.value,
      removePreviousOwner: removePreviousOwner.value,
    });
    showToast({
      type: 'success',
      title: 'Sukses',
      message: 'Shift berhasil dioper',
    } as any);

    // Mark as complete to disable form
    isHandoffComplete.value = true;
    handleCloseHandoffDialog();

    // Emit event for parent to reload data
    emit('handoff-complete');
  } catch (error) {
    console.error('Handoff error:', error);
    showToast({
      type: 'error',
      title: 'Gagal',
      message: getErrorMessage(error) || 'Gagal mengoper shift',
    } as any);
  }
};

const handleCloseHandoffDialog = () => {
  showHandoffDialog.value = false;
  selectedHandoffUserId.value = '';
  removePreviousOwner.value = false;
  isHandoffComplete.value = false;
};

onMounted(() => {
  loadAvailableUsers();
});
</script>

<style scoped>
@import "tailwindcss";
@import "@/assets/styles/themes.css";

.participant-management__header {
  @apply flex items-center justify-between;
}

.participant-management__title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.participant-management__list {
  @apply grid lg:grid-cols-2 xl:grid-cols-3 gap-4;
}

.participant-management__empty {
  @apply text-center py-4 text-gray-500 dark:text-gray-400;
}

.participant-item {
  @apply flex items-center justify-between p-3 bg-gray-50 dark:bg-dark rounded-lg border border-gray-200 dark:border-dark;
}

.participant-item--removed {
  @apply opacity-60;
}

.participant-item__info {
  @apply flex-1;
}

.participant-item__name {
  @apply flex-1 font-medium text-gray-900 dark:text-white flex items-center;
}

.participant-item__meta {
  @apply flex gap-0 mt-1;
}

.participant-item__actions {
  @apply flex gap-2 ml-4;
}
</style>
