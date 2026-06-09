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
    this.summaryCards = page.getByTestId('summary-card');
    this.workspaceName = page.getByTestId('workspace-name');
    this.profileButton = page.getByRole('button', { name: /perfil|profile|menu/i });
    this.logoutButton = page.getByRole('button', { name: /sair|logout|sign out/i });
    this.workspaceSwitcher = page.getByRole('button', { name: /trocar workspace|switch workspace|workspace/i });
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
    await this.workspaceSwitcher.click();
    await this.page.getByRole('button', { name: workspaceName }).click();
  }
}
