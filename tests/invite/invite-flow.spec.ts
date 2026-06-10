import { test, expect } from '../../support/fixtures';
import {
  generateEmail,
  generateTenantName,
  createUserViaApi,
  createInviteViaApi,
} from '../../support/helpers';
import { env } from '../../support/environment';

test.describe('Invite Flow', () => {
  test('invited user can accept invite and join tenant', async ({
    inviteAcceptPage,
    registerPage,
    page,
  }) => {
    const ownerEmail = generateEmail('invite-owner');
    const tenantName = generateTenantName();
    const inviteeEmail = generateEmail('invitee');

    const owner = await createUserViaApi(ownerEmail, 'Password123!', tenantName);
    const { token: inviteToken } = await createInviteViaApi(
      env.authApiUrl,
      owner.jwt,
      owner.tenantId,
      inviteeEmail
    );

    await registerPage.goto();
    await registerPage.register({
      name: 'Invited User',
      email: inviteeEmail,
      password: 'Password123!',
      tenantName: `${tenantName}-invitee-workspace`,
    });

    await inviteAcceptPage.gotoWithToken(inviteToken);
    await inviteAcceptPage.acceptInvite();

    await expect(page).toHaveURL(/board|dashboard/);
  });

  test('invalid invite token shows error', async ({ inviteAcceptPage }) => {
    await inviteAcceptPage.gotoWithToken('invalid-token-xyz-000');
    await expect(inviteAcceptPage.errorMessage).toBeVisible();
  });

  test('invited user can decline invite', async ({
    inviteAcceptPage,
    page,
  }) => {
    const ownerEmail = generateEmail('decline-owner');
    const tenantName = generateTenantName();
    const inviteeEmail = generateEmail('decliner');

    const owner = await createUserViaApi(ownerEmail, 'Password123!', tenantName);
    const { token: inviteToken } = await createInviteViaApi(
      env.authApiUrl,
      owner.jwt,
      owner.tenantId,
      inviteeEmail
    );

    await inviteAcceptPage.gotoWithToken(inviteToken);
    await inviteAcceptPage.declineInvite();

    const isRedirectedOrConfirmed =
      (await page.url().includes('login')) ||
      (await inviteAcceptPage.successMessage.isVisible());
    expect(isRedirectedOrConfirmed).toBe(true);
  });
});
