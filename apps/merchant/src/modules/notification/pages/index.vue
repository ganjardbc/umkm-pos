<template>
  <div class="w-full space-y-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <Button
          v-for="option in filterOptions"
          :key="option.value"
          :label="option.label"
          size="small"
          :severity="filter === option.value ? undefined : 'secondary'"
          :variant="filter === option.value ? undefined : 'outlined'"
          :badge="option.value === 'unread' && unreadCount ? String(unreadCount) : undefined"
          badgeSeverity="contrast"
          @click="onFilterChange(option.value)"
        />
      </div>
      <Button
        v-if="isCanUpdate"
        label="Tandai semua dibaca"
        icon="pi pi-check-circle"
        size="small"
        severity="secondary"
        variant="outlined"
        :loading="markingAll"
        :disabled="!unreadCount || markingAll"
        @click="handleMarkAll"
      />
    </div>

    <UiLoading
      v-if="loading"
      message="Memuat notifikasi..."
    />

    <UiCard v-else-if="error">
      <div class="flex items-center gap-3 text-sm text-red-600 dark:text-red-400">
        <i class="pi pi-exclamation-triangle" />
        <span class="flex-1">{{ error }}</span>
        <Button
          label="Coba lagi"
          size="small"
          variant="text"
          severity="secondary"
          @click="loadNotifications"
        />
      </div>
    </UiCard>

    <UiEmptyState
      v-else-if="!notifications.length"
      icon="pi pi-bell-slash"
      :title="filter === 'unread' ? 'Semua sudah dibaca' : 'Tidak ada notifikasi'"
      :description="filter === 'unread'
        ? 'Tidak ada notifikasi yang belum dibaca di outlet ini.'
        : 'Belum ada notifikasi untuk outlet ini.'"
    />

    <div
      v-else
      class="flex flex-col gap-3"
    >
      <UiCard
        v-for="item in notifications"
        :key="item.id"
        class="relative overflow-hidden gap-3!"
      >
        <span
          v-if="!item.is_read"
          class="absolute inset-y-0 left-0 w-1 bg-(--p-primary-color)"
          aria-hidden="true"
        />

        <div class="flex items-start gap-3">
          <div
            class="size-10 shrink-0 rounded-full flex items-center justify-center"
            :class="getNotificationToneClass(item.type)"
          >
            <i :class="getNotificationType(item.type).icon" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <p
                class="text-sm text-slate-900 dark:text-slate-50 break-words"
                :class="item.is_read ? 'font-medium' : 'font-semibold'"
              >
                {{ item.title }}
              </p>
              <span
                v-if="!item.is_read"
                class="mt-1.5 size-2 shrink-0 rounded-full bg-(--p-primary-color)"
                title="Belum dibaca"
              />
            </div>

            <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
              <span
                v-if="!isLabelSameAsTitle(item)"
                class="rounded-full px-2 py-0.5 font-medium"
                :class="getNotificationToneClass(item.type)"
              >
                {{ getNotificationType(item.type).label }}
              </span>
              <span
                v-if="getOutletName(item.outlet_id)"
                class="flex items-center gap-1"
              >
                <i class="pi pi-shop text-[10px]!" />
                {{ getOutletName(item.outlet_id) }}
              </span>
              <span
                class="flex items-center gap-1"
                :title="formatDateTime(item.created_at)"
              >
                <i class="pi pi-clock text-[10px]!" />
                {{ formatRelativeTime(item.created_at) }}
              </span>
            </div>

            <p class="mt-2 text-sm text-slate-700 dark:text-slate-300 break-words">
              {{ item.message }}
            </p>
          </div>
        </div>

        <template v-if="getNotificationTarget(item) || (!item.is_read && isCanUpdate)">
          <Divider class="my-0!" />

          <div class="flex items-center justify-between gap-2">
            <span class="text-xs text-slate-400 dark:text-slate-500">
              {{ formatDateTime(item.created_at) }}
            </span>
            <div class="flex items-center gap-1">
              <Button
                v-if="!item.is_read && isCanUpdate"
                label="Tandai dibaca"
                icon="pi pi-check"
                size="small"
                variant="text"
                severity="secondary"
                :loading="markingId === item.id"
                @click="markAsRead(item)"
              />
              <Button
                v-if="getNotificationTarget(item)"
                :label="getNotificationTarget(item)?.isDetail ? 'Lihat Detail' : 'Lihat'"
                icon="pi pi-arrow-right"
                iconPos="right"
                size="small"
                variant="text"
                @click="openRelated(item)"
              />
            </div>
          </div>
        </template>
      </UiCard>

      <UiPagination
        v-if="pagination.totalRecords > pagination.rows"
        v-model="pagination"
        noPadding
        @page="onPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import UiEmptyState from '@umkm-pos/ui/components/UiEmptyState.vue';
import UiLoading from '@umkm-pos/ui/components/UiLoading.vue';
import UiPagination from '@umkm-pos/ui/components/UiPagination.vue';
import UiCard from '@umkm-pos/ui/components/UiCard.vue';
import { getListOutlet, isHasPermission } from '@/helpers/auth.ts';
import { formatDateTime, formatRelativeTime } from '@umkm-pos/ui/helpers/utils';
import {
  getListNotification,
  markAllNotificationAsRead,
  markNotificationAsRead,
} from '@/modules/notification/services/api.ts';
import {
  NOTIFICATION_UPDATED_EVENT,
  getNotificationTarget,
  getNotificationToneClass,
  getNotificationType,
} from '@/modules/notification/services/constants.ts';
import { UPDATE } from '@/modules/notification/services/rbac.ts';

type Filter = 'all' | 'unread';

const router = useRouter();

const filterOptions: { label: string; value: Filter }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Belum dibaca', value: 'unread' },
];

const notifications = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const unreadCount = ref(0);
const filter = ref<Filter>('all');
const markingId = ref<string | null>(null);
const markingAll = ref(false);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const isCanUpdate = computed(() => isHasPermission(UPDATE));

const outletNames = computed(() => {
  const map = new Map<string, string>();
  (getListOutlet() || []).forEach((entry: any) => {
    const outlet = entry?.outlet ?? entry;
    if (outlet?.id) map.set(outlet.id, outlet.name);
  });
  return map;
});

const getOutletName = (outletId?: string | null) =>
  outletId ? outletNames.value.get(outletId) ?? '' : '';

const isLabelSameAsTitle = (item: any) =>
  getNotificationType(item.type).label.toLowerCase() === String(item.title ?? '').trim().toLowerCase();

const notifyUpdated = () => {
  window.dispatchEvent(new CustomEvent(NOTIFICATION_UPDATED_EVENT));
};

const loadNotifications = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await getListNotification({
      page: pagination.value.page,
      limit: pagination.value.rows,
      ...(filter.value === 'unread' ? { unread: true } : {}),
    });
    const { data, meta } = response?.data?.data || {};
    notifications.value = data || [];
    unreadCount.value = meta?.unreadCount || 0;
    pagination.value.totalRecords = meta?.total || 0;
    pagination.value.pageCount = Math.ceil((meta?.total || 0) / pagination.value.rows);
  } catch {
    error.value = 'Gagal memuat notifikasi.';
  } finally {
    loading.value = false;
  }
};

const onFilterChange = (value: Filter) => {
  if (filter.value === value) return;
  filter.value = value;
  pagination.value.page = 1;
  loadNotifications();
};

const onPageChange = (event: any) => {
  pagination.value.page = event.page + 1;
  loadNotifications();
};

const markAsRead = async (item: any) => {
  if (item.is_read) return;
  markingId.value = item.id;
  try {
    await markNotificationAsRead(item.id);
    item.is_read = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
    notifyUpdated();
    // In the "unread" view a read item no longer belongs to the list.
    if (filter.value === 'unread') await loadNotifications();
  } finally {
    markingId.value = null;
  }
};

const handleMarkAll = async () => {
  markingAll.value = true;
  try {
    await markAllNotificationAsRead();
    notifyUpdated();
    await loadNotifications();
  } finally {
    markingAll.value = false;
  }
};

const openRelated = async (item: any) => {
  const target = getNotificationTarget(item);
  if (!item.is_read && isCanUpdate.value) {
    try {
      await markAsRead(item);
    } catch {
      // Navigation should not be blocked by a failed read receipt.
    }
  }
  if (target) router.push(target.path);
};

onMounted(() => {
  loadNotifications();
  window.addEventListener(NOTIFICATION_UPDATED_EVENT, loadNotifications);
});

onUnmounted(() => {
  window.removeEventListener(NOTIFICATION_UPDATED_EVENT, loadNotifications);
});
</script>
