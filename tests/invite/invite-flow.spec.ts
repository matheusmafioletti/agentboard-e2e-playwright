import { test, expect } from '../../support/fixtures';
import { generateEmail, generateTenantName, createUserViaApi } from '../../support/helpers';

const BOARD_API_URL = process.env.BOARD_API_URL ?? 'http://localhost:8081';

async function sendInviteViaApi(
  tenantId: string,
  jwt: string,
  inviteeEmail: string
): Promise<string> {
  const response = await fetch(`${BOARD_API_URL}/api/tenants/${tenantId}/invites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ email: inviteeEmail }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Invite failed (${response.status}): ${body}`);
  }

  const data = await response.json() as { token: string };
  return data.token;
}

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
    const inviteToken = await sendInviteViaApi(owner.tenantId, owner.jwt, inviteeEmail);

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
    const inviteToken = await sendInviteViaApi(owner.tenantId, owner.jwt, inviteeEmail);

    await inviteAcceptPage.gotoWithToken(inviteToken);
    await inviteAcceptPage.declineInvite();

    const isRedirectedOrConfirmed =
      (await page.url().includes('login')) ||
      (await inviteAcceptPage.successMessage.isVisible());
    expect(isRedirectedOrConfirmed).toBe(true);
  });
});
