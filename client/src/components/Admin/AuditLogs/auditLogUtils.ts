import type {
  ApiAuditLog,
  ApiAuditLogUser,
  AuditLog,
  AuditLogWebSocketMessage,
  JsonObject,
  JsonValue,
} from "@/types/auditLog";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isJsonValue = (value: unknown): value is JsonValue => {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  return isRecord(value) && Object.values(value).every(isJsonValue);
};

const isJsonObject = (value: unknown): value is JsonObject =>
  isRecord(value) && Object.values(value).every(isJsonValue);

const isApiAuditLogUser = (value: unknown): value is ApiAuditLogUser =>
  isRecord(value) &&
  typeof value.id === "number" &&
  typeof value.first_name === "string" &&
  typeof value.last_name === "string";

const isApiAuditLog = (value: unknown): value is ApiAuditLog =>
  isRecord(value) &&
  typeof value.id === "number" &&
  (value.performed_by === null || isApiAuditLogUser(value.performed_by)) &&
  typeof value.action_title === "string" &&
  typeof value.action_summary === "string" &&
  (value.metadata === undefined ||
    value.metadata === null ||
    isJsonObject(value.metadata)) &&
  typeof value.created_at === "string";

const getMetadataText = (
  metadata: JsonObject | null | undefined,
  key: string,
  fallback = "N/A"
) => {
  const value = metadata?.[key];

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
};

export const isAuditLogWebSocketMessage = (
  value: unknown
): value is AuditLogWebSocketMessage => {
  if (!isRecord(value) || typeof value.event !== "string") {
    return false;
  }

  if (value.event === "initial_audit_logs") {
    return Array.isArray(value.audit_log) && value.audit_log.every(isApiAuditLog);
  }

  return isApiAuditLog(value.audit_log);
};

export const formatPerformedBy = (user: ApiAuditLogUser | null) => {
  if (!user) return "System";

  return `${user.first_name} ${user.last_name}`;
};

export const formatDateTime = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));

export const escapeCsvCell = (value: string) =>
  `"${value.replace(/"/g, '""')}"`;

export const mapAuditLog = (auditLog: ApiAuditLog): AuditLog => ({
  id: auditLog.id,
  performedBy: formatPerformedBy(auditLog.performed_by),
  actionTitle: auditLog.action_title,
  actionSummary: auditLog.action_summary,
  metadata: auditLog.metadata ?? null,
  ipAddress: getMetadataText(auditLog.metadata, "ip_address"),
  userAgent: getMetadataText(auditLog.metadata, "user_agent"),
  createdAt: auditLog.created_at,
});

export const upsertAuditLog = (
  auditLogs: AuditLog[],
  apiAuditLog: ApiAuditLog
) => {
  const auditLog = mapAuditLog(apiAuditLog);
  const existingAuditLog = auditLogs.some(
    (currentAuditLog) => currentAuditLog.id === auditLog.id
  );

  if (!existingAuditLog) {
    return [auditLog, ...auditLogs];
  }

  return auditLogs.map((currentAuditLog) =>
    currentAuditLog.id === auditLog.id ? auditLog : currentAuditLog
  );
};

export const sortByNewest = (firstLog: AuditLog, secondLog: AuditLog) =>
  Date.parse(secondLog.createdAt) - Date.parse(firstLog.createdAt);
