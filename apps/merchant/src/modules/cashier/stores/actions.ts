import type { CartItem, CartOption } from './state';

export const makeLineKey = (productId: string, options: CartOption[] = []) =>
	[productId, ...options.map((option) => option.option_id).sort()].join('::');

export const actions = {
	addToCart(product: any, options: CartOption[] = []) {
		const self = this as any;
		const inCart = self.productQtyInCart(product.id);
		if (inCart >= product.stock_qty) return;

		const key = makeLineKey(product.id, options);
		const existingItem = self.cartItems.find((item: CartItem) => item.key === key);

		if (existingItem) {
			existingItem.quantity++;
		} else {
			const unitPrice = Number(product.price) + options.reduce((sum, option) => sum + option.price_delta, 0);
			self.cartItems.push({
				key,
				id: product.id,
				name: product.name,
				price: String(unitPrice),
				quantity: 1,
				stock_qty: product.stock_qty,
				thumbnail: product.thumbnail,
				category: product.category,
				options,
			});
		}
	},
	
	removeFromCart(key: string) {
		const index = (this as any).cartItems.findIndex((item: CartItem) => item.key === key);
		if (index > -1) {
			(this as any).cartItems.splice(index, 1);
		}
	},
	
	updateQuantity(key: string, quantity: number) {
		const self = this as any;
		const item = self.cartItems.find((item: CartItem) => item.key === key);
		if (item) {
			const others = self.productQtyInCart(item.id) - item.quantity;
			if (quantity > 0 && others + quantity <= item.stock_qty) {
				item.quantity = quantity;
			}
		}
	},
	
	incrementQuantity(key: string) {
		const self = this as any;
		const item = self.cartItems.find((item: CartItem) => item.key === key);
		if (item && self.productQtyInCart(item.id) < item.stock_qty) {
			item.quantity++;
		}
	},
	
	decrementQuantity(key: string) {
		const item = (this as any).cartItems.find((item: CartItem) => item.key === key);
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

	// Task 19: Auto-populate products from queue entry
	populateFromQueueEntry(queueEntry: any) {
		// Clear existing cart
		(this as any).cartItems = [];
		
		// Add products from queue entry
		if (queueEntry.products && Array.isArray(queueEntry.products)) {
			for (const product of queueEntry.products) {
				(this as any).cartItems.push({
					key: makeLineKey(product.product_id),
					id: product.product_id,
					name: product.product_name || product.product_id,
					price: product.price || 0,
					quantity: product.qty || 1,
					stock_qty: product.stock_qty || 999,
					thumbnail: product.thumbnail || null,
					category: product.category || '',
					options: [],
				});
			}
		}
	},
};
