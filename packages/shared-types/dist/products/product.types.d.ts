export interface ProductSummary {
    id: string;
    name: string;
    sku?: string;
    price: number;
    stock?: number;
}
export type DiscountType = 'percentage' | 'fixed';
export interface TransactionItemDiscount {
    discount_type?: DiscountType | null;
    discount_value?: number | null;
    discount_amount?: number;
}
