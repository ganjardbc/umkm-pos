export const getters = {
  hasUnread: (state: any) => state.unreadCount > 0,
  hasItems: (state: any) => state.items.length > 0,
};
