import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type WorkItemType = 'STORY' | 'TASK' | 'BUG' | 'EPIC';

export class BoardPage extends BasePage {
  readonly createItemButton: Locator;
  readonly boardContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.createItemButton = page.getByRole('button', { name: /criar|new|add item|novo item/i });
    this.boardContainer = page.getByTestId('kanban-board');
  }

  columnByStatus(status: string): Locator {
    return this.page.getByTestId(`column-${status.toLowerCase()}`);
  }

  cardByTitle(title: string): Locator {
    return this.page.getByRole('article', { name: title });
  }

  async getCardCount(status: string): Promise<number> {
    const column = this.columnByStatus(status);
    return column.getByRole('article').count();
  }

  async createWorkItem(title: string, type: WorkItemType = 'TASK'): Promise<void> {
    await this.createItemButton.click();

    const modal = this.page.getByRole('dialog');
    await modal.waitFor({ state: 'visible' });

    await modal.getByLabel(/título|title/i).fill(title);

    const typeSelect = modal.getByRole('combobox', { name: /tipo|type/i });
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption(type);
    }

    await modal.getByRole('button', { name: /salvar|criar|save|create/i }).click();
    await modal.waitFor({ state: 'hidden' });
  }

  async dragCardToColumn(cardTitle: string, targetStatus: string): Promise<void> {
    const card = this.cardByTitle(cardTitle);
    const targetColumn = this.columnByStatus(targetStatus);

    await card.dragTo(targetColumn);
    await this.page.waitForTimeout(500);
  }

  async goto(projectId?: string): Promise<void> {
    const path = projectId ? `/board/${projectId}` : '/board';
    await this.navigate(path);
  }
}
