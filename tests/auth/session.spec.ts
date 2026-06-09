import { test, expect } from '../../support/fixtures';
import {
  generateEmail,
  generateTenantName,
  createUserViaApi,
  createSecondTenantViaApi,
  setAuthInLocalStorage,
} from '../../support/helpers';

const AUTH_API_URL = process.env.AUTH_API_URL ?? 'http://localhost:8080';

test.describe('Authentication — Session Management', () => {
  // TC-AUTH-007
  test('TC-AUTH-007: logout clears session and subsequent access to protected page redirects to /login', async ({
    dashboardPage,
    page,
  }) => {
    const email = generateEmail('auth007');
    const password = 'Password123!';
    const tenantName = generateTenantName();

    const user = await createUserViaApi(email, password, tenantName);
    await setAuthInLocalStorage(page, user.jwt, {
      userId: user.userId,
      email: user.email,
      tenantId: user.tenantId,
      tenantName: user.tenantName,
      role: user.role,
    });

    await dashboardPage.goto();
    await expect(page).toHaveURL(/\/inicio/);

    await dashboardPage.logout();
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/inicio');
    await expect(page).toHaveURL(/\/login/);
  });

  // TC-AUTH-008
  test('TC-AUTH-008: workspace switch via sidebar updates the active workspace', async ({
    page,
  }) => {
    const email = generateEmail('auth008');
    const password = 'Password123!';
    const firstTenant = generateTenantName();
    const secondTenant = generateTenantName();

    const user = await createUserViaApi(email, password, firstTenant);
    await createSecondTenantViaApi(AUTH_API_URL, user.jwt, secondTenant);

    // Login via UI to establish multi-tenant session
    await page.goto('/login');
    await page.getByLabel(/e-mail|email/i).fill(email);
    await page.getByLabel(/senha|password/i).fill(password);
    await page.getByRole('button', { name: /entrar|sign in|login/i }).click();

    // Select first tenant if picker appears
    const tenantPicker = page
      .getByRole('dialog')
      .or(page.getByTestId('tenant-picker'));
    if (await tenantPicker.isVisible({ timeout: 5000 }).catch(() => false)) {
      await page
        .getByRole('button', { name: new RegExp(firstTenant, 'i') })
        .click();
    }

    await expect(page).toHaveURL(/\/inicio/);
    await expect(page.getByTestId('workspace-name')).toContainText(firstTenant);

    // Switch to second workspace
    const switcherButton = page.getByRole('button', {
      name: /trocar workspace|switch workspace|workspace/i,
    });
    await switcherButton.click();
    await page.getByRole('button', { name: new RegExp(secondTenant, 'i') }).click();

    await expect(page.getByTestId('workspace-name')).toContainText(secondTenant);
  });
});
