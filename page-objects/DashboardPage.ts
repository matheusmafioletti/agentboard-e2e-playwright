import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly summaryCards: Locator;
  readonly workspaceName: Locator;
  readonly profileButton: Locator;
  readonly logoutButton: Locator;
  readonly workspaceSwitcher: Locator;

  constructor(page: Page) {
    super(page);
    this.summaryCards = page.locator('.grid.grid-cols-1.sm\\:grid-cols-3.gap-4 > div.rounded-card');
    this.workspaceName = page.getByText(/workspace atual:/i);
    this.profileButton = page.getByRole('button', { name: 'Perfil' });
    this.logoutButton = page.getByRole('button', { name: /^sair$/i });
    this.workspaceSwitcher = page.getByRole('button', { name: /trocar workspace/i });
  }

  getNavLink(name: string | RegExp): Locator {
    return this.page.getByRole('link', { name });
  }

  async goto(): Promise<void> {
    await this.navigate('/inicio');
  }

  async logout(): Promise<void> {
    await this.profileButton.click();
    await this.logoutButton.waitFor({ state: 'visible' });
    await this.logoutButton.click();
  }

  async switchWorkspace(workspaceName: string): Promise<void> {
    await this.profileButton.click();
    await this.page.getByRole('button', { name: /trocar workspace/i }).click();
    await this.page.getByRole('button', { name: new RegExp(workspaceName, 'i') }).click();
  }
}
