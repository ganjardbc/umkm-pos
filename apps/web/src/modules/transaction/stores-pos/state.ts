export interface CartItem {
	id: string;
	name: string;
	price: string;
	quantity: number;
	stock_qty: number;
	thumbnail: string | null;
	category: string;
	customer_note?: string;
}

export function state() {
	return {
		cartItems: [] as CartItem[],
	};
}
