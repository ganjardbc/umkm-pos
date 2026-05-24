import { getListnotification, putnotification } from '@/modules/notification/services/api.ts';
import type { NotificationItem } from './state.ts';

const pickArray = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
};

const mapNotification = (item: any): NotificationItem => {
  const id = item?.id ?? item?._id ?? item?.uuid ?? String(Math.random());
  const title = item?.title ?? item?.subject ?? item?.name ?? 'Notification';
  const description = item?.description ?? item?.message ?? item?.content ?? '-';
  const readAt = item?.readAt ?? item?.read_at ?? null;
  const isRead = Boolean(item?.isRead ?? item?.is_read ?? readAt);

  return {
    id,
    title,
    description,
    createdAt: item?.createdAt ?? item?.created_at,
    readAt,
    isRead,
    raw: item,
  };
};

export const actions = {
  async fetchNotifications(this: any, params: Record<string, any> = {}) {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const response = await getListnotification(params);
      const payload = response?.data ?? response;
      const items = pickArray(payload).map(mapNotification);

      this.items = items;
      this.unreadCount = items.filter((item: NotificationItem) => !item.isRead).length;
    } catch (error: any) {
      this.errorMessage = error?.response?.data?.message || error?.message || 'Failed to load notifications.';
      this.items = [];
      this.unreadCount = 0;
    } finally {
      this.isLoading = false;
    }
  },

  async markAsRead(this: any, id: string | number) {
    const target = this.items.find((item: NotificationItem) => item.id === id);
    if (!target || target.isRead) return;

    const previousItems = [...this.items];

    this.items = this.items.map((item: NotificationItem) => (
      item.id === id
        ? { ...item, isRead: true, readAt: item.readAt || new Date().toISOString() }
        : item
    ));
    this.unreadCount = this.items.filter((item: NotificationItem) => !item.isRead).length;

    try {
      await putnotification(id, { isRead: true });
    } catch (_error) {
      this.items = previousItems;
      this.unreadCount = previousItems.filter((item: NotificationItem) => !item.isRead).length;
      throw _error;
    }
  }
};
