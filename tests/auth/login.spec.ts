import { test, expect } from '../../support/fixtures';
import {
  generateEmail,
  generateTenantName,
  createUserViaApi,
  createSecondTenantViaApi,
} from '../../support/helpers';
import { env } from '../../support/environment';

test.describe('Authentication — Login', () => {
  // TC-AUTH-003
  test('TC-AUTH-003: single-tenant login redirects directly to /inicio without tenant picker', async ({
    loginPage,
    page,
  }) => {
    const email = generateEmail('auth003');
    const password = 'Password123!';

    await createUserViaApi(email, password, generateTenantName());

    await loginPage.goto();
    await loginPage.login(email, password);

    await expect(page).toHaveURL(/\/inicio/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  // TC-AUTH-004
  test('TC-AUTH-004: multi-tenant login shows TenantPicker then redirects to /inicio after workspace selection', async ({
    loginPage,
    page,
  }) => {
    const email = generateEmail('auth004');
    const password = 'Password123!';
    const firstTenant = generateTenantName();

    const user = await createUserViaApi(email, password, firstTenant);
    await createSecondTenantViaApi(env.authApiUrl, user.jwt, generateTenantName());

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

  // TC-AUTH-005
  test('TC-AUTH-005: invalid credentials shows generic error message', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.loginAndExpectError(
      'naoexiste@test.agentboard.dev',
      'SenhaErrada123!'
    );
    await expect(loginPage.errorMessage).toBeVisible();
  });

  // TC-AUTH-006
  test('TC-AUTH-006: direct access to /board without session redirects to /login', async ({
    page,
  }) => {
    await page.goto('/board');
    await expect(page).toHaveURL(/\/login/);
  });

  // TC-AUTH-006b
  test('TC-AUTH-006b: direct access to /inicio without session redirects to /login', async ({
    page,
  }) => {
    await page.goto('/inicio');
    await expect(page).toHaveURL(/\/login/);
  });
});
