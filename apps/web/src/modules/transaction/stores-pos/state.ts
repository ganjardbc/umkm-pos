export interface CartItem {
	id: string;
	name: string;
	price: string;
	quantity: number;
	stock_qty: number;
	thumbnail: string | null;
	category: string;
	discount_type?: 'percentage' | 'fixed' | null;
	discount_value?: number | null;
}

export function state() {
	return {
		cartItems: [] as CartItem[],
	};
}

