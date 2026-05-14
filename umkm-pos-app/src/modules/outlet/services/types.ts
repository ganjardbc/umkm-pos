export interface FormCreate {
  slug: string;
  name: string;
  location: string;
  logo?: string;
  is_active: boolean;
};

export interface FormEdit {
  name: string;
  location: string;
  is_active: boolean;
};
