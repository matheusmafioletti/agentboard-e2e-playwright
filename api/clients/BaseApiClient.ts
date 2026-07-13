export class BaseApiClient {
  constructor(protected readonly baseUrl: string) {}

  protected async request<T>(
    path: string,
    init: RequestInit,
    errorContext: string
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, init);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`${errorContext} failed (${response.status}): ${body}`);
    }

    return response.json() as Promise<T>;
  }

  protected jsonHeaders(jwt?: string, tenantId?: string): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (jwt) {
      headers['Authorization'] = `Bearer ${jwt}`;
    }
    if (tenantId) {
      headers['X-Tenant-Id'] = tenantId;
    }
    return headers;
  }
}
