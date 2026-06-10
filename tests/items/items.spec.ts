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

test.describe('Items List View', () => {
  let userJwt: string;
  let tenantId: string;
  let projectId: string;

  test.beforeEach(async ({ page }) => {
    const email = generateEmail('items');
    const user = await createUserViaApi(email, 'Password123!', generateTenantName());
    userJwt = user.jwt;
    tenantId = user.tenantId;

    const project = await createProjectViaApi(
      env.boardApiUrl,
      userJwt,
      tenantId,
      `ItemsProj-${Date.now()}`
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

  // TC-ITEMS-001
  test('TC-ITEMS-001: /itens shows table with Tipo, Título, Status columns', async ({
    itemsPage,
  }) => {
    await itemsPage.goto();
    await expect(itemsPage.itemsTable).toBeVisible();

    const headers = itemsPage.itemsTable.getByRole('columnheader');
    await expect(headers.filter({ hasText: /tipo|type/i })).toBeVisible();
    await expect(headers.filter({ hasText: /título|title/i })).toBeVisible();
    await expect(headers.filter({ hasText: /status/i })).toBeVisible();
  });

  // TC-ITEMS-002
  test('TC-ITEMS-002: type filter shows only items of selected type; clearing shows all', async ({
    itemsPage,
    page,
  }) => {
    const featureTitle = `Feature-${Date.now()}`;
    const taskTitle = `Task-${Date.now()}`;

    await createWorkItemViaApi(
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
      taskTitle,
      'TASK'
    );

    await itemsPage.goto();

    await itemsPage.filterByType('TASK');
    await expect(page.getByText(taskTitle)).toBeVisible();
    await expect(page.getByText(featureTitle)).not.toBeVisible();

    await itemsPage.filterByType('FEATURE');
    await expect(page.getByText(featureTitle)).toBeVisible();
    await expect(page.getByText(taskTitle)).not.toBeVisible();

    await itemsPage.clearTypeFilter();
    await expect(page.getByText(featureTitle)).toBeVisible();
    await expect(page.getByText(taskTitle)).toBeVisible();
  });

  // TC-ITEMS-003
  test('TC-ITEMS-003: clicking an item opens detail with same ID', async ({
    itemsPage,
    page,
  }) => {
    const itemTitle = `ClickItem-${Date.now()}`;
    const item = await createWorkItemViaApi(
      env.boardApiUrl,
      userJwt,
      tenantId,
      projectId,
      itemTitle,
      'TASK'
    );

    await itemsPage.goto();
    await itemsPage.clickItem(itemTitle);

    const detailPanel = page.getByRole('dialog').or(page.getByTestId('item-detail'));
    await expect(detailPanel).toBeVisible();
    await expect(
      detailPanel.getByText(item.id).or(detailPanel.getByText(itemTitle))
    ).toBeVisible();
  });

  // TC-ITEMS-004
  test('TC-ITEMS-004: tree view expands Feature to show child US, then expand US to show child Tasks', async ({
    itemsPage,
    page,
  }) => {
    const featureTitle = `FeatureTree-${Date.now()}`;
    const storyTitle = `StoryTree-${Date.now()}`;
    const taskTitle = `TaskTree-${Date.now()}`;

    const feature = await createWorkItemViaApi(
      env.boardApiUrl,
      userJwt,
      tenantId,
      projectId,
      featureTitle,
      'FEATURE'
    );
    const story = await createWorkItemViaApi(
      env.boardApiUrl,
      userJwt,
      tenantId,
      projectId,
      storyTitle,
      'USER_STORY',
      feature.id
    );
    await createWorkItemViaApi(
      env.boardApiUrl,
      userJwt,
      tenantId,
      projectId,
      taskTitle,
      'TASK',
      story.id
    );

    await itemsPage.goto();
    await itemsPage.toggleTreeView();

    await expect(page.getByText(featureTitle)).toBeVisible();
    await expect(page.getByText(storyTitle)).not.toBeVisible();

    await itemsPage.expandFeature(featureTitle);
    await expect(page.getByText(storyTitle)).toBeVisible();
    await expect(page.getByText(taskTitle)).not.toBeVisible();

    await itemsPage.expandFeature(storyTitle);
    await expect(page.getByText(taskTitle)).toBeVisible();
  });
});
