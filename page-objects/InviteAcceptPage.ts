import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class InviteAcceptPage extends BasePage {
  readonly acceptButton: Locator;
  readonly declineButton: Locator;
  readonly inviteDetails: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.acceptButton = page.getByRole('button', { name: /aceitar|accept/i });
    this.declineButton = page.getByRole('button', { name: /recusar|decline|reject/i });
    this.inviteDetails = page.getByTestId('invite-details');
    this.errorMessage = page.getByRole('alert');
    this.successMessage = page.getByRole('status');
  }

  async gotoWithToken(token: string): Promise<void> {
    await this.navigate(`/invite/accept?token=${token}`);
  }

  async acceptInvite(): Promise<void> {
    await this.acceptButton.waitFor({ state: 'visible' });
    await this.acceptButton.click();
  }

  async declineInvite(): Promise<void> {
    await this.declineButton.waitFor({ state: 'visible' });
    await this.declineButton.click();
  }

  async getInvitingTenantName(): Promise<string> {
    return this.inviteDetails.getByTestId('tenant-name').innerText();
  }
}
