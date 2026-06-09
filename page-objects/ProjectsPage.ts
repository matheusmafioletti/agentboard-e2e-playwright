import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProjectsPage extends BasePage {
  readonly createProjectButton: Locator;
  readonly projectList: Locator;

  constructor(page: Page) {
    super(page);
    this.createProjectButton = page.getByRole('button', { name: /novo projeto|new project/i });
    this.projectList = page.getByTestId('project-list');
  }

  async goto(): Promise<void> {
    await this.navigate('/projetos');
  }

  async createProject(name: string): Promise<void> {
    await this.createProjectButton.click();
    const modal = this.page.getByRole('dialog');
    await modal.waitFor({ state: 'visible' });
    await modal.getByLabel(/nome|name/i).fill(name);
    await modal.getByRole('button', { name: /confirmar|criar|salvar|create|save/i }).click();
    await modal.waitFor({ state: 'hidden' });
  }

  async clickProject(name: string): Promise<void> {
    await this.page.getByRole('link', { name }).click();
  }

  async getProjectNames(): Promise<string[]> {
    return this.page.getByTestId('project-name').allInnerTexts();
  }

  async selectActiveProject(name: string): Promise<void> {
    const selector = this.page.getByTestId('project-selector');
    await selector.click();
    await this.page.getByRole('option', { name }).click();
  }
}
