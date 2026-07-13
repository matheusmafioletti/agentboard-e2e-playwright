export function generateEmail(prefix = 'user'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@test.agentboard.dev`;
}

export function generateTenantName(): string {
  return `Tenant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
