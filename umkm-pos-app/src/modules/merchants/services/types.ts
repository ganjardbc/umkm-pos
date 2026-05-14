export interface FormCreate {
  slug: string;
  name: string;
  phone: string;
  address: string;
  logo?: string;
};

export interface FormEdit {
  name: string;
  phone: string;
  address: string;
};
