export type TestEnvironment = 'local' | 'staging' | 'e2e';

const LOCAL_URLS = {
  baseUrl: 'http://localhost:5173',
  authApiUrl: 'http://localhost:8080',
  boardApiUrl: 'http://localhost:8081',
} as const;

const E2E_URLS = {
  baseUrl: 'http://localhost:8080',
  authApiUrl: 'http://localhost:8080',
  boardApiUrl: 'http://localhost:8080',
} as const;

const STAGING_URLS = {
  baseUrl: 'https://agentboard.matheusmafioletti.com',
  authApiUrl: 'https://agentboard.matheusmafioletti.com',
  boardApiUrl: 'https://agentboard.matheusmafioletti.com',
} as const;

export interface EnvironmentUrls {
  readonly baseUrl: string;
  readonly authApiUrl: string;
  readonly boardApiUrl: string;
  readonly environment: TestEnvironment;
}

function activePreset(): typeof LOCAL_URLS | typeof E2E_URLS | typeof STAGING_URLS {
  const name = (process.env.ENVIRONMENT ?? process.env.TEST_ENV ?? 'local').toLowerCase();
  if (name === 'staging') {
    return STAGING_URLS;
  }
  if (name === 'e2e' || name === 'local-compose') {
    return E2E_URLS;
  }
  return LOCAL_URLS;
}

function resolveEnvironmentName(
  preset: typeof LOCAL_URLS | typeof E2E_URLS | typeof STAGING_URLS
): TestEnvironment {
  if (preset === STAGING_URLS) {
    return 'staging';
  }
  if (preset === E2E_URLS) {
    return 'e2e';
  }
  return 'local';
}

export function resolveEnvironment(): EnvironmentUrls {
  const preset = activePreset();
  return {
    environment: resolveEnvironmentName(preset),
    baseUrl: process.env.BASE_URL ?? preset.baseUrl,
    authApiUrl: process.env.AUTH_API_URL ?? preset.authApiUrl,
    boardApiUrl: process.env.BOARD_API_URL ?? preset.boardApiUrl,
  };
}

export const env = resolveEnvironment();

export function stagingCredentials(): {
  email: string;
  password: string;
  tenantName: string;
} {
  return {
    email: process.env.E2E_STAGING_USER_EMAIL ?? 'staging-smoke@agentboard.dev',
    password: process.env.E2E_STAGING_USER_PASSWORD ?? 'StagingSmoke123!',
    tenantName: process.env.E2E_STAGING_TENANT_NAME ?? 'E2E Smoke Workspace',
  };
}
