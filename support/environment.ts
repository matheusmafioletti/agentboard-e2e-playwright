export type TestEnvironment = 'local' | 'staging';

const LOCAL_URLS = {
  baseUrl: 'http://localhost:5173',
  authApiUrl: 'http://localhost:8080',
  boardApiUrl: 'http://localhost:8081',
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

function activePreset(): typeof LOCAL_URLS | typeof STAGING_URLS {
  const name = (process.env.ENVIRONMENT ?? process.env.TEST_ENV ?? 'local').toLowerCase();
  return name === 'staging' ? STAGING_URLS : LOCAL_URLS;
}

export function resolveEnvironment(): EnvironmentUrls {
  const preset = activePreset();
  return {
    environment: preset === STAGING_URLS ? 'staging' : 'local',
    baseUrl: process.env.BASE_URL ?? preset.baseUrl,
    authApiUrl: process.env.AUTH_API_URL ?? preset.authApiUrl,
    boardApiUrl: process.env.BOARD_API_URL ?? preset.boardApiUrl,
  };
}

export const env = resolveEnvironment();
