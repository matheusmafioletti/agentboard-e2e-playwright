import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type WorkItemType = 'FEATURE' | 'USER_STORY' | 'TASK';

export class BoardPage extends BasePage {
  readonly createItemButton: Locator;
  readonly boardContainer: Locator;
  readonly cardModal: Locator;
  readonly parentFilter: Locator;

  constructor(page: Page) {
    super(page);
    this.createItemButton = page.getByRole('button', { name: /criar|new|add item|novo item/i });
    this.boardContainer = page.getByTestId('kanban-board');
    this.cardModal = page.getByRole('dialog');
    this.parentFilter = page.getByTestId('parent-filter-selector');
  }

  columnByStatus(status: string): Locator {
    return this.page.getByTestId(`column-${status.toLowerCase().replace(/\s+/g, '-')}`);
  }

  cardByTitle(title: string): Locator {
    return this.page.getByRole('article', { name: title });
  }

  cardBadge(title: string): Locator {
    return this.cardByTitle(title).getByTestId('type-badge');
  }

  cardParentRef(title: string): Locator {
    return this.cardByTitle(title).getByTestId('parent-ref');
  }

  cardDisplayKey(title: string): Locator {
    return this.cardByTitle(title).getByTestId('display-key');
  }

  async getCardCount(status: string): Promise<number> {
    const column = this.columnByStatus(status);
    return column.getByRole('article').count();
  }

  async getColumnCount(): Promise<number> {
    return this.boardContainer.locator('[data-testid^="column-"]').count();
  }

  async createWorkItem(
    title: string,
    type: WorkItemType = 'TASK',
    parentId?: string
  ): Promise<void> {
    await this.createItemButton.click();

    const modal = this.page.getByRole('dialog');
    await modal.waitFor({ state: 'visible' });

    await modal.getByLabel(/título|title/i).fill(title);

    const typeSelect = modal.getByRole('combobox', { name: /tipo|type/i });
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption(type);
    }

    if (parentId) {
      const parentSelect = modal.getByRole('combobox', { name: /parent|pai/i });
      if (await parentSelect.isVisible()) {
        await parentSelect.selectOption(parentId);
      }
    }

    await modal.getByRole('button', { name: /salvar|criar|save|create/i }).click();
    await modal.waitFor({ state: 'hidden' });
  }

  async openCardModal(title: string): Promise<void> {
    await this.cardByTitle(title).click();
    await this.cardModal.waitFor({ state: 'visible' });
  }

  async dragCardToColumn(cardTitle: string, targetStatus: string): Promise<void> {
    const card = this.cardByTitle(cardTitle);
    const targetColumn = this.columnByStatus(targetStatus);

    const cardBounds = await card.boundingBox();
    const colBounds = await targetColumn.boundingBox();

    if (!cardBounds || !colBounds) {
      throw new Error(
        `Could not get bounds for card "${cardTitle}" or column "${targetStatus}"`
      );
    }

    await this.page.mouse.move(
      cardBounds.x + cardBounds.width / 2,
      cardBounds.y + cardBounds.height / 2
    );
    await this.page.mouse.down();
    await this.page.mouse.move(
      colBounds.x + colBounds.width / 2,
      colBounds.y + colBounds.height / 2,
      { steps: 10 }
    );
    await this.page.mouse.up();
    await this.page.waitForTimeout(300);
  }

  async clickViewChildBoard(featureTitle: string): Promise<void> {
    const card = this.cardByTitle(featureTitle);
    await card
      .getByRole('button', { name: /ver board filho|child board|ver histórias|user stories/i })
      .click();
  }

  async goto(options?: { type?: WorkItemType; parentId?: string }): Promise<void> {
    const params = new URLSearchParams();
    if (options?.type) params.set('type', options.type);
    if (options?.parentId) params.set('parentId', options.parentId);
    const query = params.toString();
    await this.navigate(query ? `/board?${query}` : '/board');
  }
}
