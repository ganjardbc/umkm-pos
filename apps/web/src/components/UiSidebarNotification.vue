<template>
  <div class="ui-sidebar-notification">
    <div
      class="ui-sidebar-notification__toggle"
      @click="openNotificationMenu"
    >
      <OverlayBadge
        :severity="unreadCount > 0 ? 'success' : 'secondary'"
      >
        <Button
          severity="secondary" 
          variant="text"
          size="small"
          icon="pi pi-bell"
          rounded
        />
      </OverlayBadge>
    </div>
    <Popover
      ref="opNotificationMenu"
      position="right"
      class="ui-sidebar-notification__popper"
    >
      <div class="w-full pb-3">
        <div class="text-sm font-medium">
          Notifikasi ({{ unreadCount }})
        </div>
      </div>

      <div class="space-y-4 w-80">
        <UiEmptyState
          icon="pi pi-bell-slash"
          title="Tidak Ada Notifikasi"
          description="Semua notifikasi sudah dibaca!"
        />
      </div>

      <div class="w-full pt-3">
        <Button
          severity="secondary"
          variant="outlined"
          size="small"
          label="Lihat Semua"
          fluid
          @click="onRouteViewAll"
        />
      </div>
    </Popover>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { getListNotification } from '@/modules/notification/services/api.ts';
import { useRouter } from 'vue-router';
import UiEmptyState from '@/components/UiEmptyState.vue';

const NOTIFICATION_POLL_INTERVAL_MS = 30000;

const router = useRouter();

const opNotificationMenu = ref();
const openNotificationMenu = (event: MouseEvent) => {
  opNotificationMenu.value.toggle(event);
};

const unreadCount = ref(0);
let pollTimer: ReturnType<typeof setInterval> | undefined;

const loadUnreadCount = async () => {
  try {
    const response = await getListNotification({ page: 1, limit: 5 });
    unreadCount.value = response?.data?.meta?.unreadCount || 0;
  } catch {
    unreadCount.value = 0;
  }
};

const onRouteViewAll = () => {
  opNotificationMenu.value.hide();
  router.push('/notification');
};

onMounted(() => {
  loadUnreadCount();
  pollTimer = setInterval(loadUnreadCount, NOTIFICATION_POLL_INTERVAL_MS);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>
<style>
@import 'tailwindcss';
@import '@/assets/styles/themes.css';

.ui-sidebar-notification {
  @apply relative;
}

.ui-sidebar-notification__toggle {
  @apply p-2 rounded-lg flex items-center gap-2;
}

.ui-sidebar-notification__popper.p-popover:before,
.ui-sidebar-notification__popper.p-popover:after {
  @apply hidden;
}
</style>