<template>
  <div class="ui-sidebar-notification">
    <div
      class="ui-sidebar-notification__toggle cursor-pointer"
      @click="openNotificationMenu"
    >
      <OverlayBadge
        :severity="unreadCount > 0 ? 'success' : 'secondary'"
        :value="unreadCount > 0 ? unreadCount : undefined"
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
      <div class="w-80">
        <div class="w-full pb-3 border-b flex justify-between items-center mb-3">
          <div class="text-sm font-medium">
            Notifications ({{ unreadCount }})
          </div>
          <Button
            v-if="unreadCount > 0"
            label="Mark all read"
            variant="text"
            size="small"
            class="text-xs! p-0!"
            @click="handleMarkAllRead"
          />
        </div>

        <div class="w-full">
          <div v-if="loading" class="flex justify-center items-center py-6">
            <i class="pi pi-spin pi-spinner text-gray-400 text-lg"></i>
          </div>
          
          <div v-else-if="notifications.length > 0" class="space-y-1 max-h-64 overflow-y-auto mb-3">
            <div 
              v-for="item in notifications.slice(0, 5)" 
              :key="item.id" 
              class="p-2.5 rounded-md cursor-pointer hover:bg-gray-50 flex gap-2.5 transition-colors"
              :class="item.is_read ? 'opacity-70 bg-white' : 'bg-blue-50/40 font-medium'"
              @click="onNotificationClick(item)"
            >
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center gap-1.5 mb-0.5">
                  <span class="text-xs text-gray-800 truncate">{{ item.title }}</span>
                  <span v-if="!item.is_read" class="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                </div>
                <p class="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{{ item.message }}</p>
              </div>
            </div>
          </div>

          <div v-else class="py-4">
            <UiEmptyState
              icon="pi pi-bell-slash"
              title="No Notifications"
              description="You're all caught up!"
            />
          </div>
        </div>

        <div class="w-full pt-3 border-t">
          <Button
            severity="secondary"
            variant="outlined"
            size="small"
            label="View All"
            fluid
            @click="onRouteViewAll"
          />
        </div>
      </div>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useNotificationStore } from '@/modules/notification/stores/index.ts';
import UiEmptyState from '@/components/UiEmptyState.vue';

const router = useRouter();
const notificationStore = useNotificationStore();
const { notifications, unreadCount, loading } = storeToRefs(notificationStore);

const opNotificationMenu = ref();
const openNotificationMenu = (event: MouseEvent) => {
  opNotificationMenu.value.toggle(event);
};

const onNotificationClick = async (item: any) => {
  if (!item.is_read) {
    await notificationStore.readNotification(item.id);
  }
  opNotificationMenu.value.hide();
  router.push('/notification');
};

const handleMarkAllRead = async () => {
  await notificationStore.readAllNotifications();
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