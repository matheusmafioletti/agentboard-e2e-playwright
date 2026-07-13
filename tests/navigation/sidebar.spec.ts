import { test, expect } from '../../support/fixtures';
import { testData } from '../../api/services/TestDataService';
import { setAuthInLocalStorage } from '../../support/browser';
import { generateEmail, generateTenantName } from '../../support/generators';

test.describe('Sidebar Navigation', () => {
  test('ADMIN user sees "Usuários" link in sidebar', async ({ dashboardPage, page }) => {
    const email = generateEmail('nav001');
    const user = await testData.createAuthenticatedUser(email, 'Password123!', generateTenantName());

    await setAuthInLocalStorage(page, user.jwt, {
      userId: user.userId,
      email: user.email,
      tenantId: user.tenantId,
      tenantName: user.tenantName,
      role: 'ADMIN',
    });

    await dashboardPage.goto();
    await expect(dashboardPage.getNavLink(/usuários|users/i)).toBeVisible();
  });
  test('USER role does not see "Usuários" link in sidebar', async ({
    dashboardPage,
    page,
  }) => {
    const email = generateEmail('nav002');
    const user = await testData.createAuthenticatedUser(email, 'Password123!', generateTenantName());

    await setAuthInLocalStorage(page, user.jwt, {
      userId: user.userId,
      email: user.email,
      tenantId: user.tenantId,
      tenantName: user.tenantName,
      role: 'USER',
    });

    await dashboardPage.goto();
    await expect(dashboardPage.getNavLink(/usuários|users/i)).not.toBeVisible();
  });
  test('/inicio with active project shows SummaryCards with visible counters', async ({
    dashboardPage,
    page,
  }) => {
    const email = generateEmail('nav003');
    const user = await testData.createAuthenticatedUser(email, 'Password123!', generateTenantName());

    const project = await testData.createProject(
      user.jwt,
      user.tenantId,
      `NavProj-${Date.now()}`
    );

    await testData.createWorkItem(
      user.jwt,
      user.tenantId,
      project.id,
      `Feature-${Date.now()}`,
      'FEATURE'
    );
    await testData.createWorkItem(
      user.jwt,
      user.tenantId,
      project.id,
      `Task-${Date.now()}`,
      'TASK'
    );

    await setAuthInLocalStorage(page, user.jwt, {
      userId: user.userId,
      email: user.email,
      tenantId: user.tenantId,
      tenantName: user.tenantName,
      role: user.role,
    });

    await dashboardPage.goto();
    await expect(dashboardPage.summaryCards.first()).toBeVisible();
    const cardCount = await dashboardPage.summaryCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });
});
