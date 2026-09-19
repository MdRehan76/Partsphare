import prisma from '../config/prisma';

export interface AuditParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  changes?: Record<string, any> | null;
}

export async function logAudit(params: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        changes: params.changes ? (params.changes as any) : undefined,
      },
    });
  } catch (err: any) {
    // Non-blocking: audit failure should never crash user transactions
    console.error('Failed to write audit log:', err.message);
  }
}
