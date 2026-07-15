import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProjectsPage extends BasePage {
  readonly createProjectButton: Locator;
  readonly projectList: Locator;

  constructor(page: Page) {
    super(page);
    this.createProjectButton = page.getByRole('button', { name: /novo projeto/i });
    this.projectList = page.locator('a[href^="/projetos/"]');
  }

  async goto(): Promise<void> {
    await this.navigate('/projetos');
  }

  async createProject(name: string): Promise<void> {
    await this.createProjectButton.click();
    await this.page.locator('#project-name').fill(name);
    await this.page.getByRole('button', { name: /^criar$/i }).click();
  }

  async clickProject(name: string): Promise<void> {
    await this.page.getByRole('link', { name }).click();
  }

  async getProjectNames(): Promise<string[]> {
    return this.projectList.locator('h3').allInnerTexts();
  }

  async selectActiveProject(name: string): Promise<void> {
    await this.page.getByRole('button').filter({ hasText: name }).first().click();
    await this.page.getByRole('button', { name }).click();
  }
}
