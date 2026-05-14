export interface LoginPayload {
  email: string;
  password: string;
}

export interface MerchantInfo {
  slug: string;
  name: string;
  phone?: string;
  address?: string;
  logo?: string;
}

export interface OutletInfo {
  slug: string;
  name: string;
  location?: string;
  logo?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  merchant: MerchantInfo;
  outlets: OutletInfo[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username: string;
  merchant_id: string;
  merchant: {
    id: string;
    name: string;
    slug: string;
  };
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
  rbac: any[];
}

export interface RegisterResponse extends AuthResponse {
  merchant: {
    id: string;
    name: string;
    slug: string;
  };
  outlets: Array<{
    id: string;
    name: string;
    slug: string;
    location?: string;
  }>;
}
