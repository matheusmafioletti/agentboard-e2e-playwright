import type { Page } from '@playwright/test';
import type { UserInfo } from '../api/types/auth.types';

export async function setAuthInLocalStorage(
  page: Page,
  jwt: string,
  userInfo: UserInfo
): Promise<void> {
  // IMPORTANT: navigate first — localStorage requires same origin
  await page.goto('/');
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('agentboard_token', token);
      localStorage.setItem('agentboard_user', JSON.stringify(user));
    },
    { token: jwt, user: userInfo }
  );
}
