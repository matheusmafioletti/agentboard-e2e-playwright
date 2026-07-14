import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class InviteAcceptPage extends BasePage {
  readonly acceptButton: Locator;
  readonly continueButton: Locator;
  readonly confirmButton: Locator;
  readonly inviteDetails: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.continueButton = page.getByRole('button', { name: /^continuar$/i });
    this.confirmButton = page.getByRole('button', { name: /^confirmar$/i });
    this.acceptButton = this.continueButton;
    this.inviteDetails = page.locator('h1, h2').filter({ hasText: /convite|invite/i });
    this.errorMessage = page.getByText(/convite inválido|expirado|não corresponde|incorreta|não foi possível/i);
    this.successMessage = page.getByText(/bem-vindo|sucesso|aceito/i);
  }

  async gotoWithToken(token: string): Promise<void> {
    await this.navigate(`/invite/${token}`);
  }

  async acceptInvite(): Promise<void> {
    await this.continueButton.click();

    const nameField = this.page.getByLabel(/^nome$/i);
    if (await nameField.isVisible().catch(() => false)) {
      await nameField.fill('Invited User');
      const password = 'Password123!';
      await this.page.getByLabel(/^senha$/i).fill(password);
      await this.page.getByLabel(/confirmar senha/i).fill(password);
      await this.continueButton.click();
    } else if (await this.page.getByLabel(/^senha$/i).isVisible().catch(() => false)) {
      await this.page.getByLabel(/^senha$/i).fill('Password123!');
      await this.continueButton.click();
    }

    if (await this.confirmButton.isVisible().catch(() => false)) {
      await this.confirmButton.click();
    }
  }

  async declineInvite(): Promise<void> {
    await this.page.goto('/login');
  }

  async getInvitingTenantName(): Promise<string> {
    return this.page.getByText(/workspace|time|empresa/i).first().innerText();
  }
}
