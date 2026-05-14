<template>
  <UiCard>
    <div class="w-full flex gap-4 items-center justify-between">
      <h1 class="text-lg font-semibold">
        User Shifts
      </h1>
    </div>

    <div class="space-y-4">
      <div
        v-for="(participant, i) in participants"
        :key="i"
        class="participant-item"
      >
        <div class="participant-item__info">
          <div class="flex justify-between">
            <div class="participant-item__name">
              {{ participant?.user_name }}
            </div>
            <div class="flex justify-end gap-2">
              <Tag
                v-if="participant?.is_owner"
                value="Shift Owner"
                severity="info"
              />
              <Tag
                v-if="participant?.participant_removed_at"
                value="Removed"
                severity="warning"
              />
            </div>
          </div>
          <div class="participant-item__meta">
            <span class="text-xs text-gray-500">
              Added: {{ formatDateTime(participant?.participant_added_at) }}
            </span>
            <Divider v-if="participant?.participant_removed_at" layout="vertical" />
            <span v-if="participant?.participant_removed_at" class="text-xs text-gray-500">
              Removed: {{ formatDateTime(participant?.participant_removed_at) }}
            </span>
            <Divider v-if="participant?.transaction_count" layout="vertical" />
            <span v-if="participant?.transaction_count" class="text-xs text-gray-500">
              Transactions: {{ participant?.transaction_count }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="participants.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
      No participants
    </div>
  </UiCard>
</template>

<script lang="ts" setup>
import UiCard from '@/components/UiCard.vue';
import { formatDateTime } from '@/helpers/utils.ts';

interface IParticipant {
  user_id: string;
  user_name: string;
  is_owner: boolean;
  participant_added_at: string;
  participant_removed_at?: string;
  transaction_count: number;
}

defineProps<{
  participants: IParticipant[];
}>();
</script>

<style scoped>
@import "tailwindcss";
@import "@/assets/styles/themes.css";

.participant-item {
  @apply flex items-center justify-between p-3 bg-gray-50 dark:bg-dark rounded-lg border border-gray-200 dark:border-dark;
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
