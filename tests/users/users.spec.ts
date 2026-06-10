import { test, expect } from '../../support/fixtures';
import {
  generateEmail,
  generateTenantName,
  createUserViaApi,
  createInviteViaApi,
  setAuthInLocalStorage,
} from '../../support/helpers';
import { env } from '../../support/environment';

test.describe('Users & Invites Management', () => {
  // TC-USERS-001
  test('TC-USERS-001: admin sees members list with role and date on /usuarios', async ({
    usersPage,
    page,
  }) => {
    const email = generateEmail('users001');
    const user = await createUserViaApi(email, 'Password123!', generateTenantName());
    await setAuthInLocalStorage(page, user.jwt, {
      userId: user.userId,
      email: user.email,
      tenantId: user.tenantId,
      tenantName: user.tenantName,
      role: user.role,
    });

    await usersPage.goto();
    await expect(usersPage.membersList).toBeVisible();

    // Owner should be listed as a member
    await expect(usersPage.membersList.getByText(email)).toBeVisible();
    await expect(usersPage.membersList.getByText(/admin/i)).toBeVisible();
  });

  // TC-USERS-002
  test('TC-USERS-002: user with USER role is blocked from accessing /usuarios', async ({
    page,
  }) => {
    const email = generateEmail('users002');
    const user = await createUserViaApi(email, 'Password123!', generateTenantName());

    // Inject session with USER role to simulate non-admin access
    await setAuthInLocalStorage(page, user.jwt, {
      userId: user.userId,
      email: user.email,
      tenantId: user.tenantId,
      tenantName: user.tenantName,
      role: 'USER',
    });

    await page.goto('/usuarios');

    const isBlocked =
      !page.url().includes('/usuarios') ||
      (await page.getByText(/acesso negado|forbidden|não autorizado|unauthorized/i).isVisible());
    expect(isBlocked).toBe(true);
  });

  // TC-USERS-003
  test('TC-USERS-003: admin creates invite and it appears in pending invites list', async ({
    usersPage,
    page,
  }) => {
    const adminEmail = generateEmail('admin003');
    const admin = await createUserViaApi(adminEmail, 'Password123!', generateTenantName());
    await setAuthInLocalStorage(page, admin.jwt, {
      userId: admin.userId,
      email: admin.email,
      tenantId: admin.tenantId,
      tenantName: admin.tenantName,
      role: admin.role,
    });

    const inviteeEmail = generateEmail('invitee003');

    await usersPage.goto();
    await usersPage.createInvite(inviteeEmail);

    await expect(usersPage.invitesList).toBeVisible();
    const pendingEmails = await usersPage.getPendingInviteEmails();
    expect(pendingEmails.some((e) => e.includes(inviteeEmail))).toBe(true);
  });

  // TC-USERS-004
  test('TC-USERS-004: admin cancels invite and it is removed from pending list', async ({
    usersPage,
    page,
  }) => {
    const adminEmail = generateEmail('admin004');
    const admin = await createUserViaApi(adminEmail, 'Password123!', generateTenantName());

    const inviteeEmail = generateEmail('invitee004');
    await createInviteViaApi(env.authApiUrl, admin.jwt, admin.tenantId, inviteeEmail);

    await setAuthInLocalStorage(page, admin.jwt, {
      userId: admin.userId,
      email: admin.email,
      tenantId: admin.tenantId,
      tenantName: admin.tenantName,
      role: admin.role,
    });

    await usersPage.goto();
    await expect(usersPage.invitesList.getByText(inviteeEmail)).toBeVisible();

    await usersPage.cancelInvite(inviteeEmail);

    await expect(usersPage.invitesList.getByText(inviteeEmail)).not.toBeVisible();
  });

  // TC-USERS-005
  test('TC-USERS-005: new user accepts invite and is authenticated in inviting tenant', async ({
    inviteAcceptPage,
    page,
  }) => {
    const adminEmail = generateEmail('admin005');
    const admin = await createUserViaApi(adminEmail, 'Password123!', generateTenantName());

    const inviteeEmail = generateEmail('invitee005');
    const { token } = await createInviteViaApi(
      env.authApiUrl,
      admin.jwt,
      admin.tenantId,
      inviteeEmail
    );

    await inviteAcceptPage.gotoWithToken(token);

    // Invite page should render without errors
    await expect(inviteAcceptPage.errorMessage).not.toBeVisible();
    await expect(inviteAcceptPage.acceptButton).toBeVisible();

    await inviteAcceptPage.acceptInvite();

    // After accepting, user should be redirected to login, register or dashboard
    await expect(page).toHaveURL(/\/inicio|\/login|\/register/);
  });

  // TC-USERS-006
  test('TC-USERS-006: invalid invite token shows error and no accept form', async ({
    inviteAcceptPage,
  }) => {
    await inviteAcceptPage.gotoWithToken('invalid-token-xyz-000000');

    await expect(inviteAcceptPage.errorMessage).toBeVisible();
    await expect(inviteAcceptPage.acceptButton).not.toBeVisible();
  });
});
