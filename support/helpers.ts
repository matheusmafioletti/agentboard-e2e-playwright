import * as dotenv from 'dotenv';
import type { Page } from '@playwright/test';

dotenv.config();

const AUTH_API_URL_DEFAULT = process.env.AUTH_API_URL ?? 'http://localhost:8080';

export function generateEmail(prefix = 'user'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.agentboard.dev`;
}

export function generateTenantName(): string {
  return `Tenant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

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

function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64Payload = token.split('.')[1];
  const jsonString = Buffer.from(base64Payload, 'base64url').toString('utf-8');
  return JSON.parse(jsonString) as Record<string, unknown>;
}

export async function createUserViaApi(
  email: string,
  password: string,
  tenantName: string
): Promise<UserCredentials> {
  const registerResponse = await fetch(`${AUTH_API_URL_DEFAULT}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password, tenantName }),
  });

  if (!registerResponse.ok) {
    const body = await registerResponse.text();
    throw new Error(`Registration failed (${registerResponse.status}): ${body}`);
  }

  const registerData = await registerResponse.json() as {
    tenantId: string;
    userId?: string;
    token?: string;
    role?: string;
  };

  const loginResponse = await fetch(`${AUTH_API_URL_DEFAULT}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!loginResponse.ok) {
    const body = await loginResponse.text();
    throw new Error(`Login failed (${loginResponse.status}): ${body}`);
  }

  const loginData = await loginResponse.json() as {
    token: string;
    tenantId?: string;
    role?: string;
  };

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

export async function createSecondTenantViaApi(
  authApiUrl: string,
  jwt: string,
  tenantName: string
): Promise<{ tenantId: string; tenantName: string }> {
  const response = await fetch(`${authApiUrl}/api/auth/tenants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ tenantName }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Create second tenant failed (${response.status}): ${body}`);
  }

  const data = await response.json() as { tenantId: string; tenantName: string };
  return { tenantId: data.tenantId, tenantName: data.tenantName ?? tenantName };
}

export async function createInviteViaApi(
  authApiUrl: string,
  jwt: string,
  tenantId: string,
  email: string
): Promise<{ token: string; inviteId: string }> {
  const response = await fetch(
    `${authApiUrl}/api/auth/tenants/${tenantId}/invites`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ email }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Create invite failed (${response.status}): ${body}`);
  }

  const data = await response.json() as {
    token: string;
    inviteUrl?: string;
    inviteId?: string;
    id?: string;
  };

  const inviteId =
    data.inviteId ??
    data.id ??
    extractLastPathSegment(data.inviteUrl ?? '') ??
    data.token;

  return { token: data.token, inviteId };
}

function extractLastPathSegment(url: string): string | null {
  const parts = url.split('/').filter(Boolean);
  return parts.length > 0 ? (parts[parts.length - 1] ?? null) : null;
}

export async function createProjectViaApi(
  boardApiUrl: string,
  jwt: string,
  tenantId: string,
  name: string
): Promise<{ id: string; name: string }> {
  const response = await fetch(`${boardApiUrl}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
      'X-Tenant-Id': tenantId,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Create project failed (${response.status}): ${body}`);
  }

  const data = await response.json() as { id: string; name: string };
  return { id: data.id, name: data.name };
}

export async function createWorkItemViaApi(
  boardApiUrl: string,
  jwt: string,
  tenantId: string,
  projectId: string,
  title: string,
  type: 'FEATURE' | 'USER_STORY' | 'TASK',
  parentId?: string
): Promise<{ id: string }> {
  const body: Record<string, string> = { title, type };
  if (parentId) body['parentId'] = parentId;

  const response = await fetch(
    `${boardApiUrl}/api/projects/${projectId}/work-items`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
        'X-Tenant-Id': tenantId,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const body2 = await response.text();
    throw new Error(`Create work item failed (${response.status}): ${body2}`);
  }

  const data = await response.json() as { id: string };
  return { id: data.id };
}

export async function setAuthInLocalStorage(
  page: Page,
  jwt: string,
  userInfo: UserInfo
): Promise<void> {
  // Navigate to ensure we're on the correct origin before setting localStorage
  await page.goto('/');
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('agentboard_token', token);
      localStorage.setItem('agentboard_user', JSON.stringify(user));
    },
    { token: jwt, user: userInfo }
  );
}
