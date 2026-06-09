export interface FormCreate {
  slug: string;
  name: string;
  location: string;
  guest_session_secret?: string;
  logo?: string;
  is_active: boolean;
};

export interface FormEdit {
  name: string;
  location: string;
  guest_session_secret?: string;
  is_active: boolean;
};
