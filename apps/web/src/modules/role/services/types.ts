export interface Form {
  name: string;
  description: string;
}

export interface Permission {
  id: string;
  code: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  permissions: Permission;
}

export interface RoleDetail {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  role_permissions: RolePermission[];
}
