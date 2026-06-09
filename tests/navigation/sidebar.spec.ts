import { test, expect } from '../../support/fixtures';
import {
  generateEmail,
  generateTenantName,
  createUserViaApi,
  createProjectViaApi,
  createWorkItemViaApi,
  setAuthInLocalStorage,
} from '../../support/helpers';

const BOARD_API_URL = process.env.BOARD_API_URL ?? 'http://localhost:8081';

test.describe('Sidebar Navigation', () => {
  // TC-NAV-001
  test('TC-NAV-001: ADMIN user sees "Usuários" link in sidebar', async ({ dashboardPage, page }) => {
    const email = generateEmail('nav001');
    const user = await createUserViaApi(email, 'Password123!', generateTenantName());

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

  // TC-NAV-002
  test('TC-NAV-002: USER role does not see "Usuários" link in sidebar', async ({
    dashboardPage,
    page,
  }) => {
    const email = generateEmail('nav002');
    const user = await createUserViaApi(email, 'Password123!', generateTenantName());

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

  // TC-NAV-003
  test('TC-NAV-003: /inicio with active project shows SummaryCards with visible counters', async ({
    dashboardPage,
    page,
  }) => {
    const email = generateEmail('nav003');
    const user = await createUserViaApi(email, 'Password123!', generateTenantName());

    const project = await createProjectViaApi(
      BOARD_API_URL,
      user.jwt,
      user.tenantId,
      `NavProj-${Date.now()}`
    );

    await createWorkItemViaApi(
      BOARD_API_URL,
      user.jwt,
      user.tenantId,
      project.id,
      `Feature-${Date.now()}`,
      'FEATURE'
    );
    await createWorkItemViaApi(
      BOARD_API_URL,
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
