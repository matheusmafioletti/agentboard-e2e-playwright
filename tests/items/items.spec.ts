import { test, expect } from '../../support/fixtures';
import { authenticateStagingUser } from '../../support/staging-auth';
import { testData } from '../../api/services/TestDataService';
import { setAuthInLocalStorage } from '../../support/browser';
import { generateEmail, generateTenantName } from '../../support/generators';

test.describe('Items List View', () => {
  let userJwt: string;
  let tenantId: string;
  let projectId: string;

  test.beforeEach(async ({ page }) => {
    const email = generateEmail('items');
    const user = await testData.createAuthenticatedUser(email, 'Password123!', generateTenantName());
    userJwt = user.jwt;
    tenantId = user.tenantId;

    const project = await testData.createProject(
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
  test('/itens shows table with Tipo, Título, Status columns', { tag: '@staging' }, async ({
    itemsPage,
    page,
  }) => {
    await authenticateStagingUser(page);
    await itemsPage.goto();
    await expect(itemsPage.itemsTable).toBeVisible();

    const headers = itemsPage.itemsTable.getByRole('columnheader');
    await expect(headers.filter({ hasText: /tipo|type/i })).toBeVisible();
    await expect(headers.filter({ hasText: /título|title/i })).toBeVisible();
    await expect(headers.filter({ hasText: /status/i })).toBeVisible();
  });
  test('type filter shows only items of selected type; clearing shows all', { tag: '@local' }, async ({
    itemsPage,
    page,
  }) => {
    const featureTitle = `Feature-${Date.now()}`;
    const taskTitle = `Task-${Date.now()}`;

    await testData.createWorkItem(
      userJwt,
      tenantId,
      projectId,
      featureTitle,
      'FEATURE'
    );
    await testData.createWorkItem(
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
  test('clicking an item opens detail with same ID', { tag: '@local' }, async ({
    itemsPage,
    page,
  }) => {
    const itemTitle = `ClickItem-${Date.now()}`;
    const item = await testData.createWorkItem(
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
  test('tree view expands Feature to show child US, then expand US to show child Tasks', { tag: '@wip' }, async ({
    itemsPage,
    page,
  }) => {
    const featureTitle = `FeatureTree-${Date.now()}`;
    const storyTitle = `StoryTree-${Date.now()}`;
    const taskTitle = `TaskTree-${Date.now()}`;

    const feature = await testData.createWorkItem(
      userJwt,
      tenantId,
      projectId,
      featureTitle,
      'FEATURE'
    );
    const story = await testData.createWorkItem(
      userJwt,
      tenantId,
      projectId,
      storyTitle,
      'USER_STORY',
      feature.id
    );
    await testData.createWorkItem(
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
