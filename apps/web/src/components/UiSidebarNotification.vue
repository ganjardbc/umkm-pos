<template>
  <div class="ui-sidebar-notification">
    <div
      class="ui-sidebar-notification__toggle"
      @click="openNotificationMenu"
    >
      <OverlayBadge
        v-if="unreadCount > 0"
        :value="unreadCount > 9 ? '9+' : String(unreadCount)"
        severity="danger"
        size="small"
      >
        <Button
          severity="secondary"
          variant="text"
          size="small"
          icon="pi pi-bell"
          rounded
          aria-label="Notifikasi"
        />
      </OverlayBadge>
      <Button
        v-else
        severity="secondary"
        variant="text"
        size="small"
        icon="pi pi-bell"
        rounded
        aria-label="Notifikasi"
      />
    </div>
    <Popover
      ref="opNotificationMenu"
      position="right"
      class="ui-sidebar-notification__popper"
      @show="loadNotifications"
    >
      <div class="w-80 max-w-[calc(100vw-2rem)]">
        <div class="flex items-center justify-between gap-2 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-slate-900 dark:text-slate-50">Notifikasi</span>
            <span
              v-if="unreadCount"
              class="rounded-full px-2 py-0.5 text-xs font-medium bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400"
            >
              {{ unreadCount }} baru
            </span>
          </div>
          <Button
            v-if="isCanUpdate && unreadCount"
            label="Tandai semua"
            size="small"
            variant="text"
            severity="secondary"
            class="text-xs!"
            :loading="markingAll"
            @click="handleMarkAll"
          />
        </div>

        <div
          v-if="loading && !notifications.length"
          class="flex justify-center py-10"
        >
          <i class="pi pi-spin pi-spinner text-2xl text-slate-400" />
        </div>

        <div
          v-else-if="!notifications.length"
          class="flex flex-col items-center justify-center py-10 text-center"
        >
          <i class="pi pi-bell-slash text-3xl! text-slate-300 dark:text-slate-600 mb-2" />
          <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Tidak Ada Notifikasi</p>
          <p class="text-xs text-slate-400 dark:text-slate-500">Semua notifikasi sudah dibaca!</p>
        </div>

        <div
          v-else
          class="max-h-96 overflow-y-auto flex flex-col gap-2"
        >
          <UiCard
            v-for="item in notifications"
            :key="item.id"
            role="button"
            tabindex="0"
            class="shrink-0 overflow-hidden cursor-pointer p-3! gap-0! shadow-none! border! border-slate-200! dark:border-white/10! transition-colors hover:bg-slate-50! dark:hover:bg-white/5! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--p-primary-color)"
            @click="onItemClick(item)"
            @keydown.enter.prevent="onItemClick(item)"
            @keydown.space.prevent="onItemClick(item)"
          >
            <span
              v-if="!item.is_read"
              class="absolute inset-y-0 left-0 w-1 bg-(--p-primary-color)"
              aria-hidden="true"
            />
            <div class="flex items-start gap-3">
              <span
                class="size-8 shrink-0 rounded-full flex items-center justify-center"
                :class="getNotificationToneClass(item.type)"
              >
                <i
                  class="text-sm!"
                  :class="getNotificationType(item.type).icon"
                />
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <span
                    class="truncate text-sm text-slate-900 dark:text-slate-50"
                    :class="item.is_read ? 'font-medium' : 'font-semibold'"
                  >
                    {{ item.title }}
                  </span>
                  <span
                    v-if="!item.is_read"
                    class="size-2 shrink-0 rounded-full bg-(--p-primary-color)"
                    title="Belum dibaca"
                  />
                </div>
                <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 break-words">
                  {{ item.message }}
                </p>
                <p
                  class="mt-1 text-[11px] text-slate-400 dark:text-slate-500"
                  :title="formatDateTime(item.created_at)"
                >
                  <template v-if="!isLabelSameAsTitle(item)">{{ getNotificationType(item.type).label }} · </template>{{ formatRelativeTime(item.created_at) }}
                </p>
              </div>
            </div>
          </UiCard>
        </div>
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
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { isHasPermission } from '@/helpers/auth.ts';
import { formatDateTime, formatRelativeTime } from '@/helpers/utils.ts';
import UiCard from '@/components/UiCard.vue';
import {
  getListNotification,
  markAllNotificationAsRead,
  markNotificationAsRead,
} from '@/modules/notification/services/api.ts';
import {
  NOTIFICATION_UPDATED_EVENT,
  PREFIX_ROUTE_PATH as NOTIFICATION_ROUTE_PATH,
  getNotificationTarget,
  getNotificationToneClass,
  getNotificationType,
} from '@/modules/notification/services/constants.ts';
import { UPDATE } from '@/modules/notification/services/rbac.ts';

const NOTIFICATION_POLL_INTERVAL_MS = 30000;
const NOTIFICATION_PREVIEW_LIMIT = 5;

const router = useRouter();

const opNotificationMenu = ref();
const openNotificationMenu = (event: MouseEvent) => {
  opNotificationMenu.value.toggle(event);
};

const notifications = ref<any[]>([]);
const unreadCount = ref(0);
const loading = ref(false);
const markingAll = ref(false);
let pollTimer: ReturnType<typeof setInterval> | undefined;

const isCanUpdate = computed(() => isHasPermission(UPDATE));

// One request serves both the badge count and the popover preview list.
const loadNotifications = async () => {
  loading.value = true;
  try {
    const response = await getListNotification({ page: 1, limit: NOTIFICATION_PREVIEW_LIMIT });
    const { data, meta } = response?.data?.data || {};
    notifications.value = data || [];
    unreadCount.value = meta?.unreadCount || 0;
  } catch {
    notifications.value = [];
    unreadCount.value = 0;
  } finally {
    loading.value = false;
  }
};

const isLabelSameAsTitle = (item: any) =>
  getNotificationType(item.type).label.toLowerCase() === String(item.title ?? '').trim().toLowerCase();

const notifyUpdated = () => {
  window.dispatchEvent(new CustomEvent(NOTIFICATION_UPDATED_EVENT));
};

const onItemClick = async (item: any) => {
  if (!item.is_read && isCanUpdate.value) {
    try {
      await markNotificationAsRead(item.id);
      item.is_read = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
      notifyUpdated();
    } catch {
      // Navigation should not be blocked by a failed read receipt.
    }
  }
  opNotificationMenu.value.hide();
  router.push(getNotificationTarget(item)?.path ?? NOTIFICATION_ROUTE_PATH);
};

const handleMarkAll = async () => {
  markingAll.value = true;
  try {
    await markAllNotificationAsRead();
    notifyUpdated();
  } finally {
    markingAll.value = false;
  }
};

const onRouteViewAll = () => {
  opNotificationMenu.value.hide();
  router.push(NOTIFICATION_ROUTE_PATH);
};

onMounted(() => {
  loadNotifications();
  pollTimer = setInterval(loadNotifications, NOTIFICATION_POLL_INTERVAL_MS);
  window.addEventListener(NOTIFICATION_UPDATED_EVENT, loadNotifications);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
  window.removeEventListener(NOTIFICATION_UPDATED_EVENT, loadNotifications);
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
