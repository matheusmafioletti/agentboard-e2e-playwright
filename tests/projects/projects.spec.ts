import { test, expect } from '../../support/fixtures';
import { authenticateStagingUser } from '../../support/staging-auth';
import { testData } from '../../api/services/TestDataService';
import { setAuthInLocalStorage } from '../../support/browser';
import { generateEmail, generateTenantName } from '../../support/generators';

test.describe('Projects', () => {
  test('projects page lists seed project without creating via UI', { tag: '@staging' }, async ({
    projectsPage,
    page,
  }) => {
    await authenticateStagingUser(page);
    await projectsPage.goto();

    const projectName =
      process.env.E2E_STAGING_PROJECT_NAME ?? 'E2E Smoke Project';
    const names = await projectsPage.getProjectNames();
    expect(names.some((n) => n.includes(projectName))).toBe(true);
  });

  test.describe('local mutations', () => {
    test.beforeEach(async ({ page }) => {
      const email = generateEmail('proj');
      const user = await testData.createAuthenticatedUser(
        email,
        'Password123!',
        generateTenantName()
      );
      await setAuthInLocalStorage(page, user.jwt, {
        userId: user.userId,
        email: user.email,
        tenantId: user.tenantId,
        tenantName: user.tenantName,
        role: user.role,
      });
    });

    test('creating a project makes it appear in the project list', { tag: '@local' }, async ({
      projectsPage,
    }) => {
      const projectName = `Proj-${Date.now()}`;

      await projectsPage.goto();
      await projectsPage.createProject(projectName);

      const names = await projectsPage.getProjectNames();
      expect(names.some((n) => n.includes(projectName))).toBe(true);
    });

    test('navigating to project detail updates URL to /projetos/:id', { tag: '@local' }, async ({
      projectsPage,
      page,
    }) => {
      const email = generateEmail('proj002');
      const user = await testData.createAuthenticatedUser(
        email,
        'Password123!',
        generateTenantName()
      );
      await setAuthInLocalStorage(page, user.jwt, {
        userId: user.userId,
        email: user.email,
        tenantId: user.tenantId,
        tenantName: user.tenantName,
        role: user.role,
      });

      const project = await testData.createProject(
        user.jwt,
        user.tenantId,
        `DetailProj-${Date.now()}`
      );

      await projectsPage.goto();
      await projectsPage.clickProject(project.name);

      await expect(page).toHaveURL(new RegExp(`/projetos/${project.id}`));
    });

    test(
      'selecting active project updates ProjectSelector and board shows project content',
      { tag: '@local' },
      async ({ projectsPage, boardPage, page }) => {
        const email = generateEmail('proj003');
        const user = await testData.createAuthenticatedUser(
          email,
          'Password123!',
          generateTenantName()
        );
        await setAuthInLocalStorage(page, user.jwt, {
          userId: user.userId,
          email: user.email,
          tenantId: user.tenantId,
          tenantName: user.tenantName,
          role: user.role,
        });

        const project = await testData.createProject(
          user.jwt,
          user.tenantId,
          `ActiveProj-${Date.now()}`
        );

        await projectsPage.goto();
        await projectsPage.selectActiveProject(project.name);

        await boardPage.goto({ type: 'TASK' });
        await expect(boardPage.boardContainer).toBeVisible();
        await expect(page.getByTestId('project-selector')).toContainText(project.name);
      }
    );
  });
});
