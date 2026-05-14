/**
 * Product interface - Represents a product in the system
 */
export interface Product {
  id: string;
  merchant_id: string;
  slug: string;
  name: string;
  category_id?: string;
  category?: string;
  thumbnail: string;
  price: number;
  cost: number;
  stock_qty: number;
  min_stock: number;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FormCreate {
  slug: string,
  name: string,
  category_id?: string | null,
  thumbnail: string,
  upload_id?: string | null,
  price: number,
  cost: number,
  stock_qty: number,
  min_stock: number,
  is_active: boolean,
};

export interface FormEdit {
  name: string,
  category_id?: string | null,
  thumbnail?: string,
  upload_id?: string | null,
  price: number,
  cost: number,
  min_stock: number,
  is_active: boolean,
};

export interface AdjustStock {
  product_id: string,
  change_qty: number,
  reason: string,
  note: string,
};
