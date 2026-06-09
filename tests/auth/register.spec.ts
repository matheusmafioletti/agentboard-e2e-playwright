import { test, expect } from '../../support/fixtures';
import { generateEmail, generateTenantName, createUserViaApi } from '../../support/helpers';

test.describe('Authentication — Register', () => {
  // TC-AUTH-001
  test('TC-AUTH-001: full registration creates user and workspace then redirects to /inicio with active workspace in sidebar', async ({
    registerPage,
    page,
  }) => {
    const tenantName = generateTenantName();

    await registerPage.goto();
    await registerPage.register({
      name: 'Test User',
      email: generateEmail('auth001'),
      password: 'Password123!',
      tenantName,
    });

    await expect(page).toHaveURL(/\/inicio/);
    await expect(page.getByText(tenantName)).toBeVisible();
  });

  // TC-AUTH-002
  test('TC-AUTH-002: registration with existing email shows error message and stays on /register', async ({
    registerPage,
    page,
  }) => {
    const email = generateEmail('auth002');
    await createUserViaApi(email, 'Password123!', generateTenantName());

    await registerPage.goto();
    await registerPage.register({
      name: 'Another User',
      email,
      password: 'Password123!',
      tenantName: generateTenantName(),
    });

    await expect(registerPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/\/register/);
  });
});
