import { test, expect } from '../../support/fixtures';

test.describe('Authentication — Login', () => {
  test('successful login redirects to board', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USER_EMAIL ?? 'user@test.com',
      process.env.TEST_USER_PASSWORD ?? 'password123'
    );
    await expect(page).toHaveURL(/board/);
  });

  test('invalid credentials shows error message', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('wrong@test.com', 'wrongpass');
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('empty form submission shows validation errors', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.submitButton.click();
    const emailOrAlertVisible =
      (await loginPage.errorMessage.isVisible()) ||
      (await page.getByRole('alert').count()) > 0 ||
      (await page.locator(':invalid').count()) > 0;
    expect(emailOrAlertVisible).toBe(true);
  });
});
