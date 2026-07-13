import { test, expect } from '../../support/fixtures';
import { testData } from '../../api/services/TestDataService';
import { setAuthInLocalStorage } from '../../support/browser';
import { generateEmail, generateTenantName } from '../../support/generators';

test.describe('Authentication — Session Management', () => {
  test(
    'logout clears session and subsequent access to protected page redirects to /login',
    { tag: '@local' },
    async ({ dashboardPage, page }) => {
      const email = generateEmail('auth007');
      const password = 'Password123!';
      const tenantName = generateTenantName();

      const user = await testData.createAuthenticatedUser(email, password, tenantName);
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
    }
  );

  test('workspace switch via sidebar updates the active workspace', { tag: '@local' }, async ({
    page,
  }) => {
    const email = generateEmail('auth008');
    const password = 'Password123!';
    const firstTenant = generateTenantName();
    const secondTenant = generateTenantName();

    const user = await testData.createAuthenticatedUser(email, password, firstTenant);
    await testData.createSecondTenant(user.jwt, secondTenant);
    await page.goto('/login');
    await page.getByLabel(/e-mail|email/i).fill(email);
    await page.getByLabel(/senha|password/i).fill(password);
    await page.getByRole('button', { name: /entrar|sign in|login/i }).click();
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
    const switcherButton = page.getByRole('button', {
      name: /trocar workspace|switch workspace|workspace/i,
    });
    await switcherButton.click();
    await page.getByRole('button', { name: new RegExp(secondTenant, 'i') }).click();

    await expect(page.getByTestId('workspace-name')).toContainText(secondTenant);
  });
});
