import { test, expect } from '../../support/fixtures';
import { generateEmail, generateTenantName, createUserViaApi } from '../../support/helpers';

test.describe('Kanban Board — Work Item Flow', () => {
  let userEmail: string;
  let userPassword: string;

  test.beforeEach(async ({ loginPage, page }) => {
    userEmail = generateEmail('kanban');
    userPassword = 'Password123!';

    await createUserViaApi(userEmail, userPassword, generateTenantName());

    await loginPage.goto();
    await loginPage.login(userEmail, userPassword);
    await page.waitForURL(/board/);
  });

  test('creates a work item that appears in the backlog column', async ({ boardPage }) => {
    await boardPage.waitForPageLoad();
    const title = `Task-${Date.now()}`;

    const initialCount = await boardPage.getCardCount('backlog');
    await boardPage.createWorkItem(title);

    await expect(boardPage.cardByTitle(title)).toBeVisible();
    const newCount = await boardPage.getCardCount('backlog');
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test('moves a work item from backlog to in-progress', async ({ boardPage }) => {
    await boardPage.waitForPageLoad();
    const title = `Moveable-${Date.now()}`;

    await boardPage.createWorkItem(title);
    await expect(boardPage.cardByTitle(title)).toBeVisible();

    await boardPage.dragCardToColumn(title, 'in-progress');

    await expect(boardPage.columnByStatus('in-progress').getByRole('article', { name: title })).toBeVisible();
  });

  test('moves a work item from in-progress to done', async ({ boardPage }) => {
    await boardPage.waitForPageLoad();
    const title = `Doneable-${Date.now()}`;

    await boardPage.createWorkItem(title);
    await boardPage.dragCardToColumn(title, 'in-progress');
    await boardPage.dragCardToColumn(title, 'done');

    await expect(boardPage.columnByStatus('done').getByRole('article', { name: title })).toBeVisible();
  });

  test('creates multiple work item types', async ({ boardPage }) => {
    await boardPage.waitForPageLoad();

    const story = `Story-${Date.now()}`;
    const bug = `Bug-${Date.now()}`;

    await boardPage.createWorkItem(story, 'STORY');
    await boardPage.createWorkItem(bug, 'BUG');

    await expect(boardPage.cardByTitle(story)).toBeVisible();
    await expect(boardPage.cardByTitle(bug)).toBeVisible();
  });
});
