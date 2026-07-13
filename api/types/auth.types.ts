export interface UserInfo {
  userId: string;
  email: string;
  tenantId: string;
  tenantName: string;
  role: string;
}

export interface UserCredentials extends UserInfo {
  password: string;
  jwt: string;
}

export interface TenantResult {
  tenantId: string;
  tenantName: string;
}

export interface InviteResult {
  token: string;
  inviteId: string;
}

export interface SelectTenantResult {
  token: string;
}

export interface SelectTenantResult {
  token: string;
}
