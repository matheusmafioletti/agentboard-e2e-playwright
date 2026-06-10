import { test, expect } from '../../support/fixtures';
import {
  generateEmail,
  generateTenantName,
  createUserViaApi,
  createProjectViaApi,
  createWorkItemViaApi,
  setAuthInLocalStorage,
} from '../../support/helpers';
import { env } from '../../support/environment';

test.describe('Kanban Board — Work Item Flow', () => {
  let userJwt: string;
  let tenantId: string;
  let projectId: string;

  test.beforeEach(async ({ page }) => {
    const email = generateEmail('board');
    const password = 'Password123!';
    const tenantName = generateTenantName();

    const user = await createUserViaApi(email, password, tenantName);
    userJwt = user.jwt;
    tenantId = user.tenantId;

    const project = await createProjectViaApi(
      env.boardApiUrl,
      userJwt,
      tenantId,
      `Project-${Date.now()}`
    );
    projectId = project.id;

    await setAuthInLocalStorage(page, userJwt, {
      userId: user.userId,
      email: user.email,
      tenantId: user.tenantId,
      tenantName: user.tenantName,
      role: user.role,
    });
  });

  // TC-BOARD-001
  test('TC-BOARD-001: default board displays TASK columns (New, Active, Closed)', async ({
    boardPage,
  }) => {
    await boardPage.goto({ type: 'TASK' });
    await expect(boardPage.boardContainer).toBeVisible();

    await expect(boardPage.columnByStatus('new')).toBeVisible();
    await expect(boardPage.columnByStatus('active')).toBeVisible();
    await expect(boardPage.columnByStatus('closed')).toBeVisible();
  });

  // TC-BOARD-002
  test('TC-BOARD-002: switching board type changes visible columns', async ({ boardPage }) => {
    await boardPage.goto({ type: 'FEATURE' });
    await expect(boardPage.boardContainer).toBeVisible();
    const featureColumnCount = await boardPage.getColumnCount();
    expect(featureColumnCount).toBe(9);

    await boardPage.goto({ type: 'USER_STORY' });
    const storyColumnCount = await boardPage.getColumnCount();
    expect(storyColumnCount).toBe(5);

    await boardPage.goto({ type: 'TASK' });
    const taskColumnCount = await boardPage.getColumnCount();
    expect(taskColumnCount).toBe(3);
  });

  // TC-BOARD-003
  test('TC-BOARD-003: creating a work item places it in the initial column', async ({
    boardPage,
  }) => {
    await boardPage.goto({ type: 'TASK' });
    const title = `Task-${Date.now()}`;

    await boardPage.createWorkItem(title, 'TASK');

    await expect(boardPage.cardByTitle(title)).toBeVisible();
    await expect(
      boardPage.columnByStatus('new').getByRole('article', { name: title })
    ).toBeVisible();
  });

  // TC-BOARD-004
  test('TC-BOARD-004: drag-and-drop moves card to target column and persists after reload', async ({
    boardPage,
    page,
  }) => {
    const title = `DragTask-${Date.now()}`;
    await createWorkItemViaApi(
      env.boardApiUrl,
      userJwt,
      tenantId,
      projectId,
      title,
      'TASK'
    );

    await boardPage.goto({ type: 'TASK' });
    await expect(boardPage.cardByTitle(title)).toBeVisible();

    await boardPage.dragCardToColumn(title, 'active');
    await expect(
      boardPage.columnByStatus('active').getByRole('article', { name: title })
    ).toBeVisible();

    // Reload and verify column persisted
    await page.reload();
    await boardPage.waitForPageLoad();
    await expect(
      boardPage.columnByStatus('active').getByRole('article', { name: title })
    ).toBeVisible();
  });

  // TC-BOARD-005
  test('TC-BOARD-005: parent filter shows only tasks of selected user story; clearing shows all', async ({
    boardPage,
  }) => {
    const featureTitle = `Feature-${Date.now()}`;
    const story1Title = `Story1-${Date.now()}`;
    const story2Title = `Story2-${Date.now()}`;

    const feature = await createWorkItemViaApi(
      env.boardApiUrl,
      userJwt,
      tenantId,
      projectId,
      featureTitle,
      'FEATURE'
    );
    const story1 = await createWorkItemViaApi(
      env.boardApiUrl,
      userJwt,
      tenantId,
      projectId,
      story1Title,
      'USER_STORY',
      feature.id
    );
    const story2 = await createWorkItemViaApi(
      env.boardApiUrl,
      userJwt,
      tenantId,
      projectId,
      story2Title,
      'USER_STORY',
      feature.id
    );

    const task1 = `Task1-${Date.now()}`;
    const task2 = `Task2-${Date.now()}`;
    await createWorkItemViaApi(
      env.boardApiUrl,
      userJwt,
      tenantId,
      projectId,
      task1,
      'TASK',
      story1.id
    );
    await createWorkItemViaApi(
      env.boardApiUrl,
      userJwt,
      tenantId,
      projectId,
      task2,
      'TASK',
      story2.id
    );

    // Filter by story1 — only task1 should appear
    await boardPage.goto({ type: 'TASK', parentId: story1.id });
    await expect(boardPage.cardByTitle(task1)).toBeVisible();
    await expect(boardPage.cardByTitle(task2)).not.toBeVisible();

    // Remove filter — both tasks visible
    await boardPage.goto({ type: 'TASK' });
    await expect(boardPage.cardByTitle(task1)).toBeVisible();
    await expect(boardPage.cardByTitle(task2)).toBeVisible();
  });

  // TC-BOARD-006
  test('TC-BOARD-006: card displays display key, type badge and parent reference', async ({
    boardPage,
  }) => {
    const featureTitle = `Feature-${Date.now()}`;
    const storyTitle = `Story-${Date.now()}`;

    const feature = await createWorkItemViaApi(
      env.boardApiUrl,
      userJwt,
      tenantId,
      projectId,
      featureTitle,
      'FEATURE'
    );
    await createWorkItemViaApi(
      env.boardApiUrl,
      userJwt,
      tenantId,
      projectId,
      storyTitle,
      'USER_STORY',
      feature.id
    );

    await boardPage.goto({ type: 'USER_STORY' });

    const card = boardPage.cardByTitle(storyTitle);
    await expect(card).toBeVisible();
    await expect(boardPage.cardDisplayKey(storyTitle)).toBeVisible();
    await expect(boardPage.cardBadge(storyTitle)).toBeVisible();
    await expect(boardPage.cardParentRef(storyTitle)).toBeVisible();
  });

  // TC-BOARD-007
  test('TC-BOARD-007: "view child board" on Feature navigates to USER_STORY board with parent pre-selected', async ({
    boardPage,
    page,
  }) => {
    const featureTitle = `Feature-${Date.now()}`;
    const feature = await createWorkItemViaApi(
      env.boardApiUrl,
      userJwt,
      tenantId,
      projectId,
      featureTitle,
      'FEATURE'
    );

    await boardPage.goto({ type: 'FEATURE' });
    await boardPage.clickViewChildBoard(featureTitle);

    await expect(page).toHaveURL(
      new RegExp(`type=USER_STORY.*parentId=${feature.id}|parentId=${feature.id}.*type=USER_STORY`)
    );
  });

  // TC-BOARD-008
  test('TC-BOARD-008: clicking a card opens CardModal with correct title, type and status', async ({
    boardPage,
  }) => {
    const taskTitle = `TaskModal-${Date.now()}`;
    await createWorkItemViaApi(
      env.boardApiUrl,
      userJwt,
      tenantId,
      projectId,
      taskTitle,
      'TASK'
    );

    await boardPage.goto({ type: 'TASK' });
    await boardPage.openCardModal(taskTitle);

    const modal = boardPage.cardModal;
    await expect(modal).toBeVisible();
    await expect(modal.getByText(taskTitle)).toBeVisible();
    await expect(modal.getByText(/task/i)).toBeVisible();
    await expect(modal.getByText(/new/i)).toBeVisible();
  });
});
