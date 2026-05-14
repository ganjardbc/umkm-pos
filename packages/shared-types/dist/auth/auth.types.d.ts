export interface AuthMerchant {
    id: string;
    name: string;
    slug: string;
}
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    username: string;
    merchant_id: string;
    merchant: AuthMerchant;
    is_active: boolean;
}
