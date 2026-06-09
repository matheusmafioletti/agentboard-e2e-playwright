import { test as base } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { RegisterPage } from '../page-objects/RegisterPage';
import { BoardPage } from '../page-objects/BoardPage';
import { InviteAcceptPage } from '../page-objects/InviteAcceptPage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { ProjectsPage } from '../page-objects/ProjectsPage';
import { ItemsPage } from '../page-objects/ItemsPage';
import { UsersPage } from '../page-objects/UsersPage';

type PageObjects = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  boardPage: BoardPage;
  inviteAcceptPage: InviteAcceptPage;
  dashboardPage: DashboardPage;
  projectsPage: ProjectsPage;
  itemsPage: ItemsPage;
  usersPage: UsersPage;
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
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page));
  },
  itemsPage: async ({ page }, use) => {
    await use(new ItemsPage(page));
  },
  usersPage: async ({ page }, use) => {
    await use(new UsersPage(page));
  },
});

export { expect } from '@playwright/test';
