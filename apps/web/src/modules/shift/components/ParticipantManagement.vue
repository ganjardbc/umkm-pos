<template>
  <UiCard class="participant-management">
    <div class="participant-management__header">
      <h3 class="participant-management__title">User Shifts</h3>
      <div class="flex justify-end gap-2 items-center">
        <Button
          v-if="isShiftOwner && isShiftOpen"
          icon="pi pi-pencil"
          label="Handoff Shift"
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
                value="Shift Owner"
                severity="info"
              />
              <Tag
                v-if="participant.participant_removed_at"
                value="Removed"
                severity="warning"
              />
            </div>
          </div>
          <div class="participant-item__meta">
            <span class="text-xs text-gray-500">
              Added: {{ formatDate(participant.participant_added_at) }}
            </span>
            <Divider v-if="participant.transaction_count" layout="vertical" />
            <span v-if="participant.transaction_count" class="text-xs text-gray-500">
              Transactions: {{ participant.transaction_count }}
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
            title="Restore participant"
          />
        </div>
      </div>
    </div>
    <div v-if="participants.length === 0" class="participant-management__empty">
      <p>No participants yet</p>
    </div>
  </UiCard>

  <!-- Add Participant Dialog -->
  <Dialog
    v-model:visible="showAddDialog"
    header="Add Participant"
    :modal="true"
    class="w-full md:w-96"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">Select User</label>
        <Dropdown
          v-model="selectedUserId"
          :options="usersNotInShift"
          option-label="name"
          option-value="id"
          placeholder="Choose a user"
          class="w-full"
          :loading="loadingUsers"
        />
      </div>
      <div class="flex gap-2 justify-end">
        <Button
          label="Cancel"
          severity="secondary"
          @click="showAddDialog = false"
        />
        <Button
          label="Add"
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
    header="Handoff Shift"
    :modal="true"
    class="w-full md:w-96"
  >
    <div class="space-y-4">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Transfer shift responsibility to another participant
      </p>
      <div>
        <label class="block text-sm font-medium mb-2">Select Target Participant</label>
        <Dropdown
          v-model="selectedHandoffUserId"
          :options="otherParticipants"
          option-label="user_name"
          option-value="user_id"
          placeholder="Choose a participant"
          class="w-full"
          :disabled="isHandoffComplete"
        />
      </div>

      <div class="flex items-center gap-2">
        <InputSwitch 
          v-model="removePreviousOwner"
          :disabled="isHandoffComplete"
        />
        <label class="text-sm">Remove me from participants after handoff</label>
      </div>

      <div v-if="isHandoffComplete" class="text-center text-sm text-green-600 dark:text-green-400">
        ✓ Shift handoff completed successfully
      </div>

      <div class="flex gap-2 justify-end">
        <Button
          label="Cancel"
          severity="secondary"
          :disabled="isHandoffComplete || loading"
          @click="handleCloseHandoffDialog"
        />
        <Button
          label="Handoff"
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
      title: 'Success',
      message: 'Participant added successfully',
    } as any);
    showAddDialog.value = false;
    selectedUserId.value = '';
    emit('participant-added');
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Error',
      message: getErrorMessage(error) || 'Failed to add participant',
    } as any);
  }
};

const confirmRemoveParticipant = (participant: Participant) => {
  participantToRemove.value = participant;
  showConfirm({
    header: 'Remove User',
    message: 'Are you sure you want to remove user from this shift?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Remove',
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
      title: 'Success',
      message: 'Participant removed successfully',
    } as any);
    showRemoveConfirm.value = false;
    participantToRemove.value = null;
    emit('participant-removed');
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Error',
      message: getErrorMessage(error) || 'Failed to remove participant',
    } as any);
  }
};

const confirmRestoreParticipant = (participant: Participant) => {
  participantToRemove.value = participant;
  showConfirm({
    header: 'Restore User',
    message: 'Are you sure you want to restore this user to the shift?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Restore',
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
      title: 'Success',
      message: 'Participant restored successfully',
    } as any);
    participantToRemove.value = null;
    emit('participant-added');
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Error',
      message: getErrorMessage(error) || 'Failed to restore participant',
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
    header: 'Handoff Shift?',
    message: 'Are you sure you want to handoff this shift?',
    rejectLabel: 'Cancel',
    acceptLabel: 'Handoff',
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
      title: 'Success',
      message: 'Shift handed off successfully',
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
      title: 'Error',
      message: getErrorMessage(error) || 'Failed to handoff shift',
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
