export interface CatalogCartItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  stock_qty: number;
  thumbnail: string | null;
  customer_note: string;
}

export function state() {
  return {
    cartItems: [] as CatalogCartItem[],
    session: null as any,
    latestOrder: null as any,
    sessionStatus: 'active',
  };
}
