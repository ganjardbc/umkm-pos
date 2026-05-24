<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Notifications</h1>
      <span class="text-sm text-surface-500">Unread: {{ unreadCount }}</span>
    </div>

    <div v-if="isLoading" class="grid gap-3">
      <Skeleton v-for="index in 3" :key="index" height="5rem" />
    </div>

    <Message v-else-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>

    <div v-else-if="!items.length" class="w-full flex flex-col justify-center items-center" style="height: calc(100vh - 180px);">
      <UiEmptyState
        icon="pi pi-bell"
        title="There is no notifications"
        description="You don't have new notifications for now."
      />
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="notification in items"
        :key="notification.id"
        class="border border-surface-200 dark:border-surface-700 rounded-xl p-4"
      >
        <div class="flex justify-between gap-3">
          <div>
            <h2 class="font-medium">{{ notification.title }}</h2>
            <p class="text-sm text-surface-500 mt-1">{{ notification.description }}</p>
            <p v-if="notification.createdAt" class="text-xs text-surface-400 mt-2">
              {{ new Date(notification.createdAt).toLocaleString() }}
            </p>
          </div>

          <Button
            v-if="!notification.isRead"
            label="Mark as read"
            size="small"
            @click="onMarkAsRead(notification.id)"
          />
          <Tag v-else severity="secondary" value="Read" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import UiEmptyState from '@/components/UiEmptyState.vue';
import { useNotificationStore } from '@/modules/notification/stores';

const notificationStore = useNotificationStore();
const { items, unreadCount, isLoading, errorMessage } = storeToRefs(notificationStore);

onMounted(() => {
  notificationStore.fetchNotifications();
});

const onMarkAsRead = async (id: string | number) => {
  try {
    await notificationStore.markAsRead(id);
  } catch (_error) {
    // keep silent for now, page-level error state handles fetch errors
  }
};
</script>
