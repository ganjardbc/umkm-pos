export interface Category {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
};


export interface FormCreate {
  name: string;
  description?: string;
  is_active: boolean;
};
