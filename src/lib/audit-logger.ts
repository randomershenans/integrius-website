type AuditAction =
  | 'admin.login'
  | 'admin.logout'
  | 'admin.login_failed'
  | 'org.create'
  | 'org.update'
  | 'org.delete'
  | 'license.create'
  | 'license.revoke'
  | 'license.update'
  | 'client.login'
  | 'client.login_failed'
  | 'team.invite'
  | 'team.remove'
  | 'contact.submit'

interface AuditEntry {
  action: AuditAction
  actor: string // user email or 'system' or 'anonymous'
  resource?: string // e.g. 'org:uuid' or 'license:uuid'
  detail?: string
  ip?: string
  userAgent?: string
  timestamp: string
  success: boolean
}

export function auditLog(entry: Omit<AuditEntry, 'timestamp'>): void {
  const log: AuditEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  }
  // Structured JSON log line — picked up by any log aggregator
  console.log(JSON.stringify({ audit: true, ...log }))
}
