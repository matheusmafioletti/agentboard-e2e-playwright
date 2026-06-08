import { test, expect } from '../../support/fixtures';
import { generateEmail, generateTenantName } from '../../support/helpers';

test.describe('Authentication — Register', () => {
  test('successful registration redirects to login or board', async ({ registerPage, page }) => {
    await registerPage.goto();
    await registerPage.register({
      name: 'Test User',
      email: generateEmail('register'),
      password: 'Password123!',
      tenantName: generateTenantName(),
    });
    await expect(page).toHaveURL(/login|board/);
  });

  test('duplicate email shows error message', async ({ registerPage }) => {
    const duplicateEmail = 'existing@test.agentboard.dev';
    await registerPage.goto();
    await registerPage.register({
      name: 'Test User',
      email: duplicateEmail,
      password: 'Password123!',
      tenantName: generateTenantName(),
    });
    await expect(registerPage.errorMessage).toBeVisible();
  });

  test('weak password shows validation error', async ({ registerPage }) => {
    await registerPage.goto();
    await registerPage.register({
      name: 'Test User',
      email: generateEmail('weak-pass'),
      password: '123',
      tenantName: generateTenantName(),
    });
    await expect(registerPage.errorMessage).toBeVisible();
  });
});
