export interface CatalogCartOption {
  option_id: string;
  group_name: string;
  name: string;
  price_delta: number;
}

export interface CatalogCartItem {
  // Line identity (product + options). Carts saved before options existed have none: use lineKey().
  key?: string;
  options?: CatalogCartOption[];
  id: string;
  name: string;
  price: string;
  quantity: number;
  stock_qty: number;
  thumbnail: string | null;
  customer_note: string;
}

export interface CatalogShiftStatus {
  is_open: boolean;
  shift_required?: boolean;
  shift_id: string | null;
  status: string;
}

export function state() {
  return {
    cartItems: [] as CatalogCartItem[],
    session: null as any,
    latestOrder: null as any,
    sessionStatus: 'active',
    shiftStatus: null as CatalogShiftStatus | null,
    shiftStatusLoading: false,
  };
}
