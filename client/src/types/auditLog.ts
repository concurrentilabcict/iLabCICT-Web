export type ApiAuditLogUser = {
  id: number;
  first_name: string;
  last_name: string;
};

export type ApiAuditLog = {
  id: number;
  performed_by: ApiAuditLogUser | null;
  action_title: string;
  action_summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AuditLog = {
  id: number;
  performedBy: string;
  actionTitle: string;
  actionSummary: string;
  metadata: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
};

export type InitialAuditLogsMessage = {
  event: "initial_audit_logs";
  audit_log: ApiAuditLog[];
  next?: string | null;
};

export type AuditLogChangeMessage = {
  event: string;
  audit_log: ApiAuditLog;
};

export type AuditLogWebSocketMessage =
  | InitialAuditLogsMessage
  | AuditLogChangeMessage;
