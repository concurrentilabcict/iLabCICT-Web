export type ApiAuditLogUser = {
  id: number;
  first_name: string;
  last_name: string;
};

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export type ApiAuditLog = {
  id: number;
  performed_by: ApiAuditLogUser | null;
  action_title: string;
  action_summary: string;
  metadata?: JsonObject | null;
  created_at: string;
};

export type AuditLog = {
  id: number;
  performedBy: string;
  actionTitle: string;
  actionSummary: string;
  metadata: JsonObject | null;
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

export type AuditLogsPageResponse = {
  audit_log?: ApiAuditLog[];
  results?: ApiAuditLog[];
  next?: string | null;
};
