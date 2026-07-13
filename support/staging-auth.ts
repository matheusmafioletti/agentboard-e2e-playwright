import { AuthApiClient } from '../api/clients/AuthApiClient';
import { stagingCredentials } from './environment';
import { setAuthInLocalStorage } from './browser';
import type { Page } from '@playwright/test';

export async function authenticateStagingUser(page: Page): Promise<void> {
  const creds = stagingCredentials();
  const auth = new AuthApiClient();
  const login = await auth.login(creds.email, creds.password);
  await setAuthInLocalStorage(page, login.token, {
    userId: creds.email,
    email: creds.email,
    tenantId: login.tenantId ?? '',
    tenantName: creds.tenantName,
    role: login.role ?? 'ADMIN',
  });
}
