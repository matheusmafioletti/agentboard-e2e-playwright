import * as dotenv from 'dotenv';

dotenv.config();

const AUTH_API_URL = process.env.AUTH_API_URL ?? 'http://localhost:8080';

export function generateEmail(prefix = 'user'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.agentboard.dev`;
}

export function generateTenantName(): string {
  return `Tenant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export interface UserCredentials {
  email: string;
  password: string;
  tenantName: string;
  jwt: string;
  tenantId: string;
}

export async function createUserViaApi(
  email: string,
  password: string,
  tenantName: string
): Promise<UserCredentials> {
  const registerResponse = await fetch(`${AUTH_API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password, tenantName }),
  });

  if (!registerResponse.ok) {
    const body = await registerResponse.text();
    throw new Error(`Registration failed (${registerResponse.status}): ${body}`);
  }

  const registerData = await registerResponse.json() as { tenantId: string };

  const loginResponse = await fetch(`${AUTH_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!loginResponse.ok) {
    const body = await loginResponse.text();
    throw new Error(`Login failed (${loginResponse.status}): ${body}`);
  }

  const loginData = await loginResponse.json() as { token: string };

  return {
    email,
    password,
    tenantName,
    jwt: loginData.token,
    tenantId: registerData.tenantId,
  };
}
