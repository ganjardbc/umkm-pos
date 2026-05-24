export type NotificationItem = {
  id: string | number;
  title: string;
  description: string;
  createdAt?: string;
  readAt?: string | null;
  isRead: boolean;
  raw?: Record<string, any>;
};

export function state() {
  return {
    items: [] as NotificationItem[],
    unreadCount: 0,
    isLoading: false,
    errorMessage: '',
  };
}
