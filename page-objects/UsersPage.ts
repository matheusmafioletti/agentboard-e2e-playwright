import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class UsersPage extends BasePage {
  readonly membersList: Locator;
  readonly invitesList: Locator;
  readonly createInviteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.membersList = page.getByTestId('members-list');
    this.invitesList = page.getByTestId('invites-list');
    this.createInviteButton = page.getByRole('button', { name: /novo convite|invite/i });
  }

  async goto(): Promise<void> {
    await this.navigate('/usuarios');
  }

  async createInvite(email: string): Promise<void> {
    await this.createInviteButton.click();
    const modal = this.page.getByRole('dialog');
    await modal.waitFor({ state: 'visible' });
    await modal.getByLabel(/e-mail|email/i).fill(email);
    await modal.getByRole('button', { name: /enviar|confirmar|send|confirm/i }).click();
    await modal.waitFor({ state: 'hidden' });
  }

  async cancelInvite(email: string): Promise<void> {
    const inviteRow = this.invitesList.getByText(email).locator('..');
    await inviteRow.getByRole('button', { name: /cancelar|cancel/i }).click();
  }

  async getMemberEmails(): Promise<string[]> {
    return this.membersList.getByTestId('member-email').allInnerTexts();
  }

  async getPendingInviteEmails(): Promise<string[]> {
    return this.invitesList.getByTestId('invite-email').allInnerTexts();
  }
}
