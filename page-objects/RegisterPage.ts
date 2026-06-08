import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  tenantName: string;
}

export class RegisterPage extends BasePage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly tenantNameInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.getByLabel(/nome|name/i);
    this.emailInput = page.getByLabel(/e-mail|email/i);
    this.passwordInput = page.getByLabel(/senha|password/i);
    this.tenantNameInput = page.getByLabel(/organização|organization|workspace|tenant/i);
    this.submitButton = page.getByRole('button', { name: /cadastrar|registrar|sign up|register/i });
    this.errorMessage = page.getByRole('alert');
    this.successMessage = page.getByRole('status');
  }

  async goto(): Promise<void> {
    await this.navigate('/register');
  }

  async register(data: RegisterData): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.tenantNameInput.fill(data.tenantName);
    await this.submitButton.click();
  }
}
