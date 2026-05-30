<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold">Notifications</h1>
      <Button label="Mark all as read" size="small" @click="handleMarkAll" :disabled="!unreadCount" />
    </div>

    <UiLoading
      v-if="loading"
      message="Loading notifications..."
    />
    <div v-else-if="error" class="text-sm text-red-500">{{ error }}</div>
    <div v-else-if="!notifications.length" class="w-full flex flex-col justify-center items-center" style="height: calc(100vh - 220px);">
      <UiEmptyState icon="pi pi-bell-slash" title="There is no notifications" description="You don't have new notifications for now." />
    </div>

    <div v-else class="space-y-3">
      <div v-for="item in notifications" :key="item.id" class="border rounded-lg p-4" :class="item.is_read ? 'bg-white' : 'bg-blue-50'">
        <div class="flex justify-between gap-4">
          <div>
            <p class="font-medium">{{ item.title }}</p>
            <p class="text-sm text-gray-600">{{ item.message }}</p>
          </div>
          <Button v-if="!item.is_read" label="Mark read" size="small" variant="text" @click="markAsRead(item.id)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import UiEmptyState from '@/components/UiEmptyState.vue';
import UiLoading from '@/components/UiLoading.vue';
import { getListNotification, markAllNotificationAsRead, markNotificationAsRead } from '@/modules/notification/services/api.ts';

const notifications = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const unreadCount = ref(0);

const loadNotifications = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await getListNotification({ page: 1, limit: 20 });
    notifications.value = response?.data?.data || [];
    unreadCount.value = response?.data?.meta?.unreadCount || 0;
  } catch {
    error.value = 'Failed to load notifications.';
  } finally {
    loading.value = false;
  }
};

const markAsRead = async (id: string) => {
  await markNotificationAsRead(id);
  await loadNotifications();
};

const handleMarkAll = async () => {
  await markAllNotificationAsRead();
  await loadNotifications();
};

onMounted(loadNotifications);
</script>
