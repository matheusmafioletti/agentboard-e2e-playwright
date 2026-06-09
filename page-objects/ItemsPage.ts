import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type ItemType = 'FEATURE' | 'USER_STORY' | 'TASK';

export class ItemsPage extends BasePage {
  readonly itemsTable: Locator;
  readonly typeFilter: Locator;
  readonly treeViewToggle: Locator;

  constructor(page: Page) {
    super(page);
    this.itemsTable = page.getByRole('table');
    this.typeFilter = page.getByRole('combobox', { name: /tipo|type/i });
    this.treeViewToggle = page.getByRole('button', { name: /árvore|tree|hierarquia|hierarchy/i });
  }

  async goto(): Promise<void> {
    await this.navigate('/itens');
  }

  async filterByType(type: ItemType): Promise<void> {
    await this.typeFilter.selectOption(type);
  }

  async clearTypeFilter(): Promise<void> {
    await this.typeFilter.selectOption('');
  }

  async clickItem(title: string): Promise<void> {
    await this.page.getByRole('cell', { name: title }).click();
  }

  async getVisibleItemTitles(): Promise<string[]> {
    return this.page.getByTestId('item-title').allInnerTexts();
  }

  async toggleTreeView(): Promise<void> {
    await this.treeViewToggle.click();
  }

  async expandFeature(title: string): Promise<void> {
    await this.page
      .getByRole('row', { name: new RegExp(title, 'i') })
      .getByRole('button', { name: /expandir|expand/i })
      .click();
  }
}
