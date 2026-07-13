import { AuthApiClient } from '../clients/AuthApiClient';
import { BoardApiClient } from '../clients/BoardApiClient';
import type { InviteResult, TenantResult, UserCredentials } from '../types/auth.types';
import type { ProjectResult, WorkItemResult, WorkItemType } from '../types/board.types';

export class TestDataService {
  private readonly authClient = new AuthApiClient();
  private readonly boardClient = new BoardApiClient();

  createAuthenticatedUser(
    email: string,
    password: string,
    tenantName: string
  ): Promise<UserCredentials> {
    return this.authClient.createAuthenticatedUser(email, password, tenantName);
  }

  createSecondTenant(jwt: string, tenantName: string): Promise<TenantResult> {
    return this.authClient.createTenant(jwt, tenantName);
  }

  createInvite(jwt: string, tenantId: string, email: string): Promise<InviteResult> {
    return this.authClient.createInvite(jwt, tenantId, email);
  }

  acceptInvite(token: string, email: string, password: string): Promise<null> {
    return this.authClient.acceptInvite(token, email, password);
  }

  selectTenant(
    email: string,
    password: string,
    tenantId: string
  ): Promise<{ token: string }> {
    return this.authClient.selectTenant(email, password, tenantId);
  }

  cancelInvite(jwt: string, tenantId: string, inviteId: string): Promise<null> {
    return this.authClient.cancelInvite(jwt, tenantId, inviteId);
  }

  createProject(jwt: string, tenantId: string, name: string): Promise<ProjectResult> {
    return this.boardClient.createProject(jwt, tenantId, name);
  }

  createWorkItem(
    jwt: string,
    tenantId: string,
    projectId: string,
    title: string,
    type: WorkItemType,
    parentId?: string
  ): Promise<WorkItemResult> {
    return this.boardClient.createWorkItem(
      jwt,
      tenantId,
      projectId,
      title,
      type,
      parentId
    );
  }
}

export const testData = new TestDataService();
