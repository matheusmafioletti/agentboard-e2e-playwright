import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel(/e-mail|email/i);
    this.passwordInput = page.getByLabel(/senha|password/i);
    this.submitButton = page.getByRole('button', { name: /entrar|sign in|login/i });
    this.errorMessage = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.navigate('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginAndExpectError(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await this.errorMessage.waitFor({ state: 'visible' });
  }
}
