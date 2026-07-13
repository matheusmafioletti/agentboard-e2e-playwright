import { test, expect } from '../../support/fixtures';
import { testData } from '../../api/services/TestDataService';
import { generateEmail, generateTenantName } from '../../support/generators';

test.describe('Authentication — Login', () => {
  test('single-tenant login redirects directly to /inicio without tenant picker', async ({
    loginPage,
    page,
  }) => {
    const email = generateEmail('auth003');
    const password = 'Password123!';

    await testData.createAuthenticatedUser(email, password, generateTenantName());

    await loginPage.goto();
    await loginPage.login(email, password);

    await expect(page).toHaveURL(/\/inicio/);
    await expect(page.getByRole('main')).toBeVisible();
  });
  test('multi-tenant login shows TenantPicker then redirects to /inicio after workspace selection', async ({
    loginPage,
    page,
  }) => {
    const email = generateEmail('auth004');
    const password = 'Password123!';
    const firstTenant = generateTenantName();

    const user = await testData.createAuthenticatedUser(email, password, firstTenant);
    await testData.createSecondTenant(user.jwt, generateTenantName());

    await loginPage.goto();
    await loginPage.login(email, password);

    const tenantPicker = page
      .getByRole('dialog')
      .or(page.getByTestId('tenant-picker'));
    await expect(tenantPicker).toBeVisible();

    await page
      .getByRole('button', { name: new RegExp(firstTenant, 'i') })
      .click();

    await expect(page).toHaveURL(/\/inicio/);
  });
  test('invalid credentials shows generic error message', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginAndExpectError(
      'naoexiste@test.agentboard.dev',
      'SenhaErrada123!'
    );
    await expect(loginPage.errorMessage).toBeVisible();
  });
  test('direct access to /board without session redirects to /login', async ({
    page,
  }) => {
    await page.goto('/board');
    await expect(page).toHaveURL(/\/login/);
  });
  test('direct access to /inicio without session redirects to /login', async ({
    page,
  }) => {
    await page.goto('/inicio');
    await expect(page).toHaveURL(/\/login/);
  });
});
