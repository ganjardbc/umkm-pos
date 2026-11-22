export interface CartOption {
	option_id: string;
	group_name: string;
	name: string;
	price_delta: number;
}

export interface CartItem {
	// Cart line identity: product id + chosen options. The same product with
	// different options is a separate line.
	key: string;
	// Product id (what the API calls product_id).
	id: string;
	name: string;
	// Unit price including option deltas.
	price: string;
	quantity: number;
	stock_qty: number;
	thumbnail: string | null;
	category: string;
	options: CartOption[];
	customer_note?: string;
}

export function state() {
	return {
		cartItems: [] as CartItem[],
	};
}
