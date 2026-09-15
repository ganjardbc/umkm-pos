export const FEATURE_NAME = 'notification';
export const MODULE_VERSION = '1.0.0';

export const PREFIX_ROUTE_PATH = '/notification';
export const PREFIX_ROUTE_NAME = 'notification';

import { PREFIX_ROUTE_PATH as TRANSACTION_ROUTE_PATH } from '@/modules/transaction/services/constants';
import { PREFIX_ROUTE_PATH as STOCK_ROUTE_PATH } from '@/modules/stock/services/constants';
import { PREFIX_ROUTE_PATH as SHIFT_ROUTE_PATH } from '@/modules/shift/services/constants';
import { PREFIX_ROUTE_PATH as PRODUCT_LIST_ROUTE_PATH } from '@/modules/product-lists/services/constants';
import { PREFIX_ROUTE_PATH as OUTLET_ROUTE_PATH } from '@/modules/outlet/services/constants';

// Fired on window whenever notifications change (mark read / mark all),
// so the sidebar bell and the notification page stay in sync without polling.
export const NOTIFICATION_UPDATED_EVENT = 'notification:updated';

export type NotificationTone = 'green' | 'blue' | 'amber' | 'violet' | 'slate';

export type NotificationTypeConfig = {
  label: string;
  icon: string;
  tone: NotificationTone;
  route?: string;
};

export const NOTIFICATION_TYPES: Record<string, NotificationTypeConfig> = {
  order_created: { label: 'Pesanan Baru', icon: 'pi pi-shopping-cart', tone: 'green', route: TRANSACTION_ROUTE_PATH },
  order_item_added: { label: 'Tambahan Pesanan', icon: 'pi pi-cart-plus', tone: 'blue', route: TRANSACTION_ROUTE_PATH },
  transaction: { label: 'Transaksi', icon: 'pi pi-receipt', tone: 'blue', route: TRANSACTION_ROUTE_PATH },
  inventory: { label: 'Stok', icon: 'pi pi-box', tone: 'amber', route: STOCK_ROUTE_PATH },
  shift: { label: 'Shift', icon: 'pi pi-clock', tone: 'violet', route: SHIFT_ROUTE_PATH },
  system: { label: 'Sistem', icon: 'pi pi-info-circle', tone: 'slate' },
  general: { label: 'Umum', icon: 'pi pi-bell', tone: 'slate' },
};

// Detail pages keyed by the notification's `ref_type`. A notification with a
// `ref_id` whose `ref_type` is listed here opens that entity's detail page;
// anything else falls back to the list route of its notification type.
export const NOTIFICATION_REF_DETAIL_ROUTES: Record<string, (id: string) => string> = {
  transaction: (id) => `${TRANSACTION_ROUTE_PATH}/detail/${id}`,
  shift: (id) => `${SHIFT_ROUTE_PATH}/detail/${id}`,
  product: (id) => `${PRODUCT_LIST_ROUTE_PATH}/detail/${id}`,
  outlet: (id) => `${OUTLET_ROUTE_PATH}/detail/${id}`,
};

export type NotificationTarget = { path: string; isDetail: boolean };

export const getNotificationTarget = (item: {
  type?: string | null;
  ref_type?: string | null;
  ref_id?: string | null;
}): NotificationTarget | null => {
  const detail = item.ref_type ? NOTIFICATION_REF_DETAIL_ROUTES[item.ref_type] : undefined;
  if (detail && item.ref_id) return { path: detail(item.ref_id), isDetail: true };
  const list = getNotificationType(item.type).route;
  return list ? { path: list, isDetail: false } : null;
};

// Full literal class strings so Tailwind can detect them.
export const NOTIFICATION_TONE_CLASSES: Record<NotificationTone, string> = {
  green: 'bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300',
};

export const getNotificationType = (type?: string | null): NotificationTypeConfig =>
  NOTIFICATION_TYPES[type ?? ''] ?? NOTIFICATION_TYPES.general;

export const getNotificationToneClass = (type?: string | null) =>
  NOTIFICATION_TONE_CLASSES[getNotificationType(type).tone];
