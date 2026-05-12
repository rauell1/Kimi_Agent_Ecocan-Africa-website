import { db } from "@/lib/db";

type AuditAction =
  | "event.update" | "event.delete"
  | "event.create"
  | "participant.create" | "participant.update" | "participant.delete" | "participant.import"
  | "documentation.create" | "documentation.delete"
  | "metrics.update"
  | "report.create" | "report.delete"
  | "checklist.update" | "checklist.bulk_update"
  | "media.create" | "media.delete";

interface AuditParams {
  eventId?: string | null;
  userId?: string | null;
  action: AuditAction;
  entityType?: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
}

export async function logAudit({
  eventId,
  userId,
  action,
  entityType,
  entityId,
  before,
  after,
  metadata,
}: AuditParams) {
  try {
    await db.auditLog.create({
      data: {
        eventId: eventId ?? null,
        userId: userId ?? null,
        action,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
        before: before ? JSON.stringify(before) : null,
        after: after ? JSON.stringify(after) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    // Audit logging should never fail the main operation
    console.error("Audit log write failed:", error);
  }
}
