import { test, expect } from '../../support/fixtures';
import { testData } from '../../api/services/TestDataService';
import { generateEmail, generateTenantName } from '../../support/generators';

test.describe('Authentication — Register', () => {
  test(
    'full registration creates user and workspace then redirects to /inicio with active workspace in sidebar',
    { tag: '@local' },
    async ({ registerPage, page }) => {
      const tenantName = generateTenantName();

      await registerPage.goto();
      await registerPage.register({
        name: 'Test User',
        email: generateEmail('auth001'),
        password: 'Password123!',
        tenantName,
      });

      await registerPage.continueToDashboard();
      await expect(page).toHaveURL(/\/inicio/);
    }
  );

  test(
    'registration with existing email shows error message and stays on /register',
    { tag: '@local' },
    async ({ registerPage, page }) => {
      const email = generateEmail('auth002');
      await testData.createAuthenticatedUser(email, 'Password123!', generateTenantName());

      await registerPage.goto();
      await registerPage.register({
        name: 'Another User',
        email,
        password: 'Password123!',
        tenantName: generateTenantName(),
      });

      await expect(registerPage.errorMessage).toBeVisible();
      await expect(page).toHaveURL(/\/register/);
    }
  );
});
