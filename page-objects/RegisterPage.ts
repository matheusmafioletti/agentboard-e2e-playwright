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
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.getByLabel(/nome|name/i);
    this.emailInput = page.getByLabel(/e-mail|email/i);
    this.passwordInput = page.getByLabel(/senha|password/i);
    this.tenantNameInput = page.getByLabel(/time\s*\/\s*empresa|organização|organization|workspace|tenant/i);
    this.submitButton = page.getByRole('button', { name: /criar conta|cadastrar|registrar|sign up|register/i });
    this.errorMessage = page.getByText(/e-mail já cadastrado|falha no cadastro/i);
    this.continueButton = page.getByRole('button', { name: /ir para o início/i });
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

  async continueToDashboard(): Promise<void> {
    await this.continueButton.click();
  }
}
