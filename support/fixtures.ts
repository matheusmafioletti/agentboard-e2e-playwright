import { test as base } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { RegisterPage } from '../page-objects/RegisterPage';
import { BoardPage } from '../page-objects/BoardPage';
import { InviteAcceptPage } from '../page-objects/InviteAcceptPage';

type PageObjects = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  boardPage: BoardPage;
  inviteAcceptPage: InviteAcceptPage;
};

export const test = base.extend<PageObjects>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  boardPage: async ({ page }, use) => {
    await use(new BoardPage(page));
  },
  inviteAcceptPage: async ({ page }, use) => {
    await use(new InviteAcceptPage(page));
  },
});

export { expect } from '@playwright/test';
