import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class UsersPage extends BasePage {
  readonly membersList: Locator;
  readonly invitesList: Locator;
  readonly createInviteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.membersList = page
      .locator('section')
      .filter({ hasText: /^Membros \(\d+\)$/ })
      .locator('.rounded-card');
    this.invitesList = page
      .locator('section')
      .filter({ hasText: /^Convites pendentes \(\d+\)$/ })
      .locator('.rounded-card');
    this.createInviteButton = page.getByRole('button', { name: /novo convite|invite/i });
  }

  async goto(): Promise<void> {
    await this.navigate('/usuarios');
  }

  async createInvite(email: string): Promise<void> {
    await this.createInviteButton.click();
    const modal = this.page.getByRole('heading', { name: /novo convite/i }).locator('../..');
    await modal.waitFor({ state: 'visible' });
    await this.page.getByLabel(/e-mail|email/i).fill(email);
    await this.page.getByRole('button', { name: /gerar link/i }).click();
    await this.page.getByRole('button', { name: /fechar/i }).click();
  }

  async cancelInvite(email: string): Promise<void> {
    const inviteRow = this.invitesList.locator('div.flex').filter({ hasText: email });
    await inviteRow.getByRole('button', { name: /cancelar|cancel/i }).click();
  }

  async getMemberEmails(): Promise<string[]> {
    return this.membersList.locator('p.text-\\[11px\\]').allInnerTexts();
  }

  async getPendingInviteEmails(): Promise<string[]> {
    return this.invitesList.locator('span.text-sm').allInnerTexts();
  }
}
