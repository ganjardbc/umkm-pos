export const getters = {
  cartTotal: (state: any) => {
    return state.cartItems.reduce((total: number, item: any) => {
      return total + (Number(item.price) * item.quantity);
    }, 0);
  },
  cartItemCount: (state: any) => {
    return state.cartItems.reduce((count: number, item: any) => {
      return count + item.quantity;
    }, 0);
  },
  getCartItemById: (state: any) => (key: string) => {
    return state.cartItems.find((item: any) => (item.key ?? item.id) === key);
  },
  // Stock is per product, so lines that differ only by options share it.
  productQtyInCart: (state: any) => (productId: string) => {
    return state.cartItems
      .filter((item: any) => item.id === productId)
      .reduce((count: number, item: any) => count + item.quantity, 0);
  },
  isShiftOpen: (state: any) => {
    return state.shiftStatus?.shift_required === false || state.shiftStatus?.is_open === true;
  },
  currentShiftId: (state: any) => {
    return state.shiftStatus?.shift_id || null;
  },
};
