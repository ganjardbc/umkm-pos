<template>
  <div class="ui-sidebar-notification">
    <div
      class="ui-sidebar-notification__toggle"
      @click="openNotificationMenu"
    >
      <OverlayBadge v-if="hasUnread" :value="badgeValue" severity="danger">
        <Button severity="secondary" variant="text" size="small" icon="pi pi-bell" rounded />
      </OverlayBadge>
      <Button v-else severity="secondary" variant="text" size="small" icon="pi pi-bell" rounded />
    </div>
    <Popover ref="opNotificationMenu" position="right" class="ui-sidebar-notification__popper" @show="onOpenPopover">
      <div class="w-full pb-3">
        <div class="text-sm font-medium">Notifications ({{ unreadCount }} unread)</div>
      </div>

      <div v-if="isLoading" class="space-y-2 w-80">
        <Skeleton v-for="index in 3" :key="index" height="3.5rem" />
      </div>

      <div v-else-if="!items.length" class="space-y-4 w-80">
        <UiEmptyState icon="pi pi-bell-slash" title="No Notifications" description="You're all caught up!" />
      </div>

      <div v-else class="space-y-2 w-80 max-h-96 overflow-auto">
        <button
          v-for="notification in items.slice(0, 5)"
          :key="notification.id"
          type="button"
          class="w-full text-left p-3 rounded-lg border border-surface-200 dark:border-surface-700"
          @click="onMarkAsRead(notification.id)"
        >
          <p class="text-sm font-medium">{{ notification.title }}</p>
          <p class="text-xs text-surface-500 mt-1 line-clamp-2">{{ notification.description }}</p>
          <Tag v-if="!notification.isRead" severity="danger" value="Unread" class="mt-2" />
        </button>
      </div>

      <div class="w-full pt-3">
        <Button severity="secondary" variant="outlined" size="small" label="View All" fluid @click="onRouteViewAll" />
      </div>
    </Popover>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import UiEmptyState from '@/components/UiEmptyState.vue';
import { useNotificationStore } from '@/modules/notification/stores';

const router = useRouter();
const notificationStore = useNotificationStore();
const { items, unreadCount, isLoading } = storeToRefs(notificationStore);

const opNotificationMenu = ref();
const hasUnread = computed(() => unreadCount.value > 0);
const badgeValue = computed(() => (unreadCount.value > 99 ? '99+' : unreadCount.value));

const openNotificationMenu = (event: MouseEvent) => {
  opNotificationMenu.value.toggle(event);
};

const onOpenPopover = async () => {
  if (!items.value.length) {
    await notificationStore.fetchNotifications({ limit: 5 });
  }
};

const onMarkAsRead = async (id: string | number) => {
  await notificationStore.markAsRead(id);
};

const onRouteViewAll = () => {
  opNotificationMenu.value.hide();
  router.push('/notification');
};
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
