export const getters = {
	getItemGrossTotal: () => (item: any) => {
		return Number(item.price || 0) * (item.quantity || 0);
	},
	getItemDiscountAmount: () => (item: any) => {
		const gross = Number(item.price || 0) * (item.quantity || 0);
		if (!item.discount_type || !item.discount_value) return 0;
		if (item.discount_type === 'percentage') {
			const pct = Number(item.discount_value);
			return Number(((gross * pct) / 100).toFixed(2));
		}
		if (item.discount_type === 'fixed') {
			const fixed = Number(item.discount_value);
			return Math.min(fixed, gross);
		}
		return 0;
	},
	getItemSubtotal: () => (item: any) => {
		const gross = Number(item.price || 0) * (item.quantity || 0);
		if (!item.discount_type || !item.discount_value) return gross;
		if (item.discount_type === 'percentage') {
			const pct = Number(item.discount_value);
			const discount = Number(((gross * pct) / 100).toFixed(2));
			return Math.max(0, gross - discount);
		}
		if (item.discount_type === 'fixed') {
			const fixed = Number(item.discount_value);
			return Math.max(0, gross - fixed);
		}
		return gross;
	},
	cartTotal: (state: any) => {
		return state.cartItems.reduce((total: number, item: any) => {
			const gross = Number(item.price || 0) * (item.quantity || 0);
			let discount = 0;
			if (item.discount_type === 'percentage' && item.discount_value) {
				discount = (gross * Number(item.discount_value)) / 100;
			} else if (item.discount_type === 'fixed' && item.discount_value) {
				discount = Math.min(Number(item.discount_value), gross);
			}
			return total + Math.max(0, gross - discount);
		}, 0);
	},
	cartItemCount: (state: any) => {
		return state.cartItems.reduce((count: number, item: any) => {
			return count + item.quantity;
		}, 0);
	},
	getCartItemById: (state: any) => (id: string) => {
		return state.cartItems.find((item: any) => item.id === id);
	},
};
