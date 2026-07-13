import { env } from '../../support/environment';
import type { InviteResult, TenantResult, UserCredentials } from '../types/auth.types';
import { BaseApiClient } from './BaseApiClient';

function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64Payload = token.split('.')[1];
  const jsonString = Buffer.from(base64Payload, 'base64url').toString('utf-8');
  return JSON.parse(jsonString) as Record<string, unknown>;
}

function extractLastPathSegment(url: string): string | null {
  const parts = url.split('/').filter(Boolean);
  return parts.length > 0 ? (parts[parts.length - 1] ?? null) : null;
}

export class AuthApiClient extends BaseApiClient {
  constructor() {
    super(env.authApiUrl);
  }

  async register(
    email: string,
    password: string,
    tenantName: string
  ): Promise<{
    tenantId: string;
    userId?: string;
    token?: string;
    role?: string;
  }> {
    return this.request(
      '/auth/register',
      {
        method: 'POST',
        headers: this.jsonHeaders(),
        body: JSON.stringify({ name: 'Test User', email, password, tenantName }),
      },
      'Registration'
    );
  }

  async login(
    email: string,
    password: string
  ): Promise<{ token: string; tenantId?: string; role?: string }> {
    return this.request(
      '/auth/login',
      {
        method: 'POST',
        headers: this.jsonHeaders(),
        body: JSON.stringify({ email, password }),
      },
      'Login'
    );
  }

  async createAuthenticatedUser(
    email: string,
    password: string,
    tenantName: string
  ): Promise<UserCredentials> {
    const registerData = await this.register(email, password, tenantName);
    const loginData = await this.login(email, password);

    const jwt = loginData.token;
    const payload = decodeJwtPayload(jwt);
    const userId =
      registerData.userId ??
      (typeof payload.sub === 'string' ? payload.sub : '');
    const role =
      registerData.role ??
      loginData.role ??
      (typeof payload.role === 'string' ? payload.role : 'ADMIN');

    return {
      email,
      password,
      tenantName,
      jwt,
      tenantId: registerData.tenantId,
      userId,
      role,
    };
  }

  async createTenant(jwt: string, tenantName: string): Promise<TenantResult> {
    const data = await this.request<{ tenantId: string; tenantName: string }>(
      '/auth/tenants',
      {
        method: 'POST',
        headers: this.jsonHeaders(jwt),
        body: JSON.stringify({ tenantName }),
      },
      'Create second tenant'
    );

    return { tenantId: data.tenantId, tenantName: data.tenantName ?? tenantName };
  }

  async createInvite(
    jwt: string,
    tenantId: string,
    email: string
  ): Promise<InviteResult> {
    const data = await this.request<{
      token: string;
      inviteUrl?: string;
      inviteId?: string;
      id?: string;
    }>(
      `/auth/tenants/${tenantId}/invites`,
      {
        method: 'POST',
        headers: this.jsonHeaders(jwt),
        body: JSON.stringify({ email }),
      },
      'Create invite'
    );

    const inviteId =
      data.inviteId ??
      data.id ??
      extractLastPathSegment(data.inviteUrl ?? '') ??
      data.token;

    return { token: data.token, inviteId };
  }
}
