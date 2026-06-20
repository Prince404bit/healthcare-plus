import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type AuditAction =
  | "USER_REGISTER" | "USER_LOGIN" | "USER_SUSPEND" | "USER_ACTIVATE"
  | "DOCTOR_VERIFY" | "DOCTOR_UNVERIFY" | "DOCTOR_PROFILE_UPDATE"
  | "APPOINTMENT_CREATE" | "APPOINTMENT_CANCEL" | "APPOINTMENT_CONFIRM" | "APPOINTMENT_COMPLETE"
  | "RECORD_UPLOAD" | "RECORD_DELETE"
  | "REMINDER_CREATE" | "REMINDER_UPDATE" | "REMINDER_DELETE"
  | "DOSE_LOG" | "PASSWORD_RESET_REQUEST" | "PASSWORD_RESET_COMPLETE";

type AuditParams = {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  oldValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
};

export const auditService = {
  async log(params: AuditParams) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          oldValues: params.oldValues,
          newValues: params.newValues,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      });
    } catch {
      console.error("[AuditLog] Failed to write audit log:", params.action);
    }
  },

  async getByUser(userId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async getByEntity(entity: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getRecent(limit = 100) {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
};
