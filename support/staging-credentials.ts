export interface StagingCredentials {
  email: string;
  password: string;
  tenantName: string;
}

export function stagingCredentials(): StagingCredentials {
  return {
    email: process.env.E2E_STAGING_USER_EMAIL ?? 'staging-smoke@agentboard.dev',
    password: process.env.E2E_STAGING_USER_PASSWORD ?? 'StagingSmoke123!',
    tenantName: process.env.E2E_STAGING_TENANT_NAME ?? 'E2E Smoke Workspace',
  };
}
