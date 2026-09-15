export interface RecentMerchant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  _count: {
    outlets: number;
    users: number;
  };
}

export interface DashboardStats {
  window_days: number;
  merchants: {
    total: number;
    new: number;
    active: number;
  };
  outlets: {
    total: number;
    active: number;
  };
  users: {
    total: number;
    active: number;
  };
  recent_merchants: RecentMerchant[];
}
