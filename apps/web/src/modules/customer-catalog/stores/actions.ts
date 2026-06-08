import type { CatalogCartItem } from './state';
import { clearCustomerSession, getCustomerSession } from '@/helpers/customer-session.ts';
import {
  getCustomerSessionMe,
  getCustomerSessionStatus,
  postCatalogOrder,
} from '../services/api.ts';

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
    (this as any).clearCart();
  },

  async submitOrder(payload: any) {
    const response = await postCatalogOrder(payload);
    const order = response.data?.data || null;
    (this as any).latestOrder = order;
    (this as any).clearCart();
    return order;
  },

  addToCart(product: any) {
    const existingItem = (this as any).cartItems.find(
      (item: CatalogCartItem) => item.id === product.id,
    );

    if (existingItem) {
      if (existingItem.quantity < product.stock_qty) {
        existingItem.quantity++;
      }
    } else {
      (this as any).cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock_qty: product.stock_qty,
        thumbnail: product.thumbnail || null,
        customer_note: '',
      });
    }
  },

  removeFromCart(productId: string) {
    const index = (this as any).cartItems.findIndex(
      (item: CatalogCartItem) => item.id === productId,
    );
    if (index > -1) {
      (this as any).cartItems.splice(index, 1);
    }
  },

  incrementQuantity(productId: string) {
    const item = (this as any).cartItems.find(
      (item: CatalogCartItem) => item.id === productId,
    );
    if (item && item.quantity < item.stock_qty) {
      item.quantity++;
    }
  },

  decrementQuantity(productId: string) {
    const item = (this as any).cartItems.find(
      (item: CatalogCartItem) => item.id === productId,
    );
    if (item) {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        this.removeFromCart(productId);
      }
    }
  },

  clearCart() {
    (this as any).cartItems = [];
  },
};
