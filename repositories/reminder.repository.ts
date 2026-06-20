import { prisma } from "@/lib/prisma";
import type { ReminderStatus } from "@prisma/client";
import type { CreateReminderInput, UpdateReminderInput } from "@/lib/validations";

export const reminderRepository = {
  findById(id: string) {
    return prisma.medicineReminder.findUnique({
      where: { id },
      include: { doseLogs: { orderBy: { scheduledAt: "desc" }, take: 30 } },
    });
  },

  findByPatient(patientId: string) {
    return prisma.medicineReminder.findMany({
      where: { patientId },
      include: { doseLogs: { orderBy: { scheduledAt: "desc" }, take: 7 } },
      orderBy: { createdAt: "desc" },
    });
  },

  findActive() {
    return prisma.medicineReminder.findMany({
      where: { status: "ACTIVE" },
      include: { patient: { include: { user: true } } },
    });
  },

  create(patientId: string, data: CreateReminderInput) {
    return prisma.medicineReminder.create({
      data: {
        patientId,
        medicineName: data.medicineName,
        dosage: data.dosage,
        frequency: data.frequency,
        times: data.times,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        instructions: data.instructions,
        color: data.color,
      },
    });
  },

  update(id: string, data: UpdateReminderInput) {
    return prisma.medicineReminder.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  },

  updateStatus(id: string, status: ReminderStatus) {
    return prisma.medicineReminder.update({ where: { id }, data: { status } });
  },

  delete(id: string) {
    return prisma.medicineReminder.delete({ where: { id } });
  },

  logDose(patientId: string, reminderId: string, data: {
    scheduledAt: Date;
    status: "TAKEN" | "MISSED" | "SKIPPED" | "SNOOZED";
    takenAt?: Date;
    snoozedUntil?: Date;
    notes?: string;
  }) {
    return prisma.doseLog.create({
      data: {
        reminderId,
        patientId,
        scheduledAt: data.scheduledAt,
        status: data.status,
        takenAt: data.takenAt,
        snoozedUntil: data.snoozedUntil,
        notes: data.notes,
      },
    });
  },

  getDoseLogs(patientId: string, from: Date, to: Date) {
    return prisma.doseLog.findMany({
      where: { patientId, scheduledAt: { gte: from, lte: to } },
      include: { reminder: true },
      orderBy: { scheduledAt: "asc" },
    });
  },

  getDoseStats(patientId: string, from: Date, to: Date) {
    return prisma.doseLog.groupBy({
      by: ["status"],
      where: { patientId, scheduledAt: { gte: from, lte: to } },
      _count: { status: true },
    });
  },
};
