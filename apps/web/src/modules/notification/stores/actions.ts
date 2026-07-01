import { getListNotification, markNotificationAsRead, markAllNotificationAsRead } from '../services/api';
import { getOutlet } from '@/helpers/auth';

export const actions = {
  async fetchNotifications(this: any, params: any = {}) {
    this.loading = true;
    this.error = '';
    try {
      const activeOutlet = getOutlet();
      const response = await getListNotification({
        outlet_id: activeOutlet?.id,
        ...params,
      });
      this.notifications = response?.data?.data || [];
      this.unreadCount = response?.data?.meta?.unreadCount || 0;
    } catch (err: any) {
      this.error = err.message || 'Failed to fetch notifications';
      console.error(err);
    } finally {
      this.loading = false;
    }
  },

  addNotification(this: any, newNotif: any) {
    this.notifications.unshift(newNotif);
    this.unreadCount++;

    if (this.notifications.length > 50) {
      this.notifications.pop();
    }
  },

  async readNotification(this: any, id: string) {
    try {
      const activeOutlet = getOutlet();
      await markNotificationAsRead(id, {
        params: {
          outlet_id: activeOutlet?.id,
        },
      });

      const index = this.notifications.findIndex((n: any) => n.id === id);
      if (index !== -1 && !this.notifications[index].is_read) {
        this.notifications[index].is_read = true;
        if (this.unreadCount > 0) {
          this.unreadCount--;
        }
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  },

  async readAllNotifications(this: any) {
    try {
      const activeOutlet = getOutlet();
      await markAllNotificationAsRead({
        params: {
          outlet_id: activeOutlet?.id,
        },
      });

      this.notifications = this.notifications.map((n: any) => ({
        ...n,
        is_read: true,
      }));
      this.unreadCount = 0;
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  },
};
