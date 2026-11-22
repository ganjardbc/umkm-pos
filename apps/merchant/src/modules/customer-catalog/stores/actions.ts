import type { CatalogCartItem, CatalogCartOption } from './state';
import { clearCustomerSession, getCustomerSession } from '@/helpers/customer-session.ts';
import {
  getCatalogShiftStatus,
  getCustomerSessionMe,
  getCustomerSessionStatus,
  postCatalogOrder,
} from '../services/api.ts';

// The same product with different options is a separate cart line.
export const makeLineKey = (productId: string, options: CatalogCartOption[] = []) =>
  [productId, ...options.map((option) => option.option_id).sort()].join('::');

export const lineKey = (item: CatalogCartItem) => item.key ?? item.id;

export const actions = {
  hydrateSession() {
    (this as any).session = getCustomerSession();
    return (this as any).session;
  },

  async loadSession() {
    const response = await getCustomerSessionMe();
    const data = response.data?.data || null;
    (this as any).session = data || getCustomerSession();
    (this as any).latestOrder = data?.latest_transaction || null;
    (this as any).sessionStatus = data?.status || (this as any).sessionStatus || 'active';
    return data;
  },

  async refreshShiftStatus(outletId: string) {
    if (!outletId) return null;

    try {
      (this as any).shiftStatusLoading = true;
      const response = await getCatalogShiftStatus(outletId);
      const data = response.data?.data || {};
      (this as any).shiftStatus = {
        // Outlets that do not use shifts accept orders without one; only an explicit false opts out.
        shift_required: data.shift_required !== false,
        is_open: data.is_open === true,
        shift_id: data.shift_id || null,
        status: data.status || 'closed',
      };
      return (this as any).shiftStatus;
    } finally {
      (this as any).shiftStatusLoading = false;
    }
  },

  async pollSessionStatus() {
    const response = await getCustomerSessionStatus();
    const data = response.data?.data || {};
    (this as any).sessionStatus = data.session_status || 'active';
    if (data.latest_transaction) {
      const currentOrder = (this as any).latestOrder;
      (this as any).latestOrder = currentOrder?.id === data.latest_transaction.id
        ? { ...currentOrder, ...data.latest_transaction }
        : data.latest_transaction;
    }
    return data;
  },

  resetSession() {
    clearCustomerSession();
    (this as any).session = null;
    (this as any).latestOrder = null;
    (this as any).sessionStatus = 'active';
    (this as any).shiftStatus = null;
    (this as any).shiftStatusLoading = false;
    (this as any).clearCart();
  },

  async submitOrder(payload: any) {
    const response = await postCatalogOrder(payload);
    const order = response.data?.data || null;
    (this as any).latestOrder = order;
    (this as any).clearCart();
    return order;
  },

  addToCart(product: any, options: CatalogCartOption[] = []) {
    const self = this as any;
    if (self.productQtyInCart(product.id) >= product.stock_qty) return;

    const key = makeLineKey(product.id, options);
    const existingItem = self.cartItems.find(
      (item: CatalogCartItem) => lineKey(item) === key,
    );

    if (existingItem) {
      existingItem.quantity++;
    } else {
      const unitPrice =
        Number(product.price) +
        options.reduce((sum, option) => sum + option.price_delta, 0);
      self.cartItems.push({
        key,
        id: product.id,
        name: product.name,
        price: String(unitPrice),
        quantity: 1,
        stock_qty: product.stock_qty,
        thumbnail: product.thumbnail || null,
        customer_note: '',
        options,
      });
    }
  },

  removeFromCart(key: string) {
    const index = (this as any).cartItems.findIndex(
      (item: CatalogCartItem) => lineKey(item) === key,
    );
    if (index > -1) {
      (this as any).cartItems.splice(index, 1);
    }
  },

  incrementQuantity(key: string) {
    const self = this as any;
    const item = self.cartItems.find(
      (item: CatalogCartItem) => lineKey(item) === key,
    );
    if (item && self.productQtyInCart(item.id) < item.stock_qty) {
      item.quantity++;
    }
  },

  decrementQuantity(key: string) {
    const item = (this as any).cartItems.find(
      (item: CatalogCartItem) => lineKey(item) === key,
    );
    if (item) {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        this.removeFromCart(key);
      }
    }
  },

  clearCart() {
    (this as any).cartItems = [];
  },
};
