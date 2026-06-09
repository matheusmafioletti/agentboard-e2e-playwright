import { test, expect } from '../../support/fixtures';
import {
  generateEmail,
  generateTenantName,
  createUserViaApi,
  createProjectViaApi,
  setAuthInLocalStorage,
} from '../../support/helpers';

const BOARD_API_URL = process.env.BOARD_API_URL ?? 'http://localhost:8081';

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => {
    const email = generateEmail('proj');
    const user = await createUserViaApi(email, 'Password123!', generateTenantName());
    await setAuthInLocalStorage(page, user.jwt, {
      userId: user.userId,
      email: user.email,
      tenantId: user.tenantId,
      tenantName: user.tenantName,
      role: user.role,
    });
  });

  // TC-PROJ-001
  test('TC-PROJ-001: creating a project makes it appear in the project list', async ({
    projectsPage,
  }) => {
    const projectName = `Proj-${Date.now()}`;

    await projectsPage.goto();
    await projectsPage.createProject(projectName);

    const names = await projectsPage.getProjectNames();
    expect(names.some((n) => n.includes(projectName))).toBe(true);
  });

  // TC-PROJ-002
  test('TC-PROJ-002: navigating to project detail updates URL to /projetos/:id', async ({
    projectsPage,
    page,
  }) => {
    const email = generateEmail('proj002');
    const user = await createUserViaApi(email, 'Password123!', generateTenantName());
    await setAuthInLocalStorage(page, user.jwt, {
      userId: user.userId,
      email: user.email,
      tenantId: user.tenantId,
      tenantName: user.tenantName,
      role: user.role,
    });

    const project = await createProjectViaApi(
      BOARD_API_URL,
      user.jwt,
      user.tenantId,
      `DetailProj-${Date.now()}`
    );

    await projectsPage.goto();
    await projectsPage.clickProject(project.name);

    await expect(page).toHaveURL(new RegExp(`/projetos/${project.id}`));
  });

  // TC-PROJ-003
  test('TC-PROJ-003: selecting active project updates ProjectSelector and board shows project content', async ({
    projectsPage,
    boardPage,
    page,
  }) => {
    const email = generateEmail('proj003');
    const user = await createUserViaApi(email, 'Password123!', generateTenantName());
    await setAuthInLocalStorage(page, user.jwt, {
      userId: user.userId,
      email: user.email,
      tenantId: user.tenantId,
      tenantName: user.tenantName,
      role: user.role,
    });

    const project = await createProjectViaApi(
      BOARD_API_URL,
      user.jwt,
      user.tenantId,
      `ActiveProj-${Date.now()}`
    );

    await projectsPage.goto();
    await projectsPage.selectActiveProject(project.name);

    await boardPage.goto({ type: 'TASK' });
    await expect(boardPage.boardContainer).toBeVisible();
    await expect(page.getByTestId('project-selector')).toContainText(project.name);
  });
});
