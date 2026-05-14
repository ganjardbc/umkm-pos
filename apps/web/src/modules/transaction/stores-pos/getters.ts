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
	getCartItemById: (state: any) => (id: string) => {
		return state.cartItems.find((item: any) => item.id === id);
	},
};
