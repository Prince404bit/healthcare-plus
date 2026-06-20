import { prisma } from "@/lib/prisma";
import type { AppointmentStatus } from "@prisma/client";
import type { CreateAppointmentInput } from "@/lib/validations";

const FULL_INCLUDE = {
  patient: { include: { user: true } },
  doctor: { include: { user: true } },
  slot: true,
} as const;

export const appointmentRepository = {
  findById(id: string) {
    return prisma.appointment.findUnique({ where: { id }, include: FULL_INCLUDE });
  },

  findByPatient(patientId: string, page: number, pageSize: number, status?: AppointmentStatus) {
    const skip = (page - 1) * pageSize;
    const where = { patientId, ...(status ? { status } : {}) };
    return Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: pageSize,
        include: { doctor: { include: { user: true } }, slot: true },
        orderBy: { scheduledAt: "desc" },
      }),
      prisma.appointment.count({ where }),
    ]);
  },

  findByDoctor(doctorId: string, page: number, pageSize: number, status?: AppointmentStatus) {
    const skip = (page - 1) * pageSize;
    const where = { doctorId, ...(status ? { status } : {}) };
    return Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: pageSize,
        include: { patient: { include: { user: true } }, slot: true },
        orderBy: { scheduledAt: "desc" },
      }),
      prisma.appointment.count({ where }),
    ]);
  },

  findAll(page: number, pageSize: number, status?: AppointmentStatus) {
    const skip = (page - 1) * pageSize;
    const where = status ? { status } : {};
    return Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: pageSize,
        include: FULL_INCLUDE,
        orderBy: { scheduledAt: "desc" },
      }),
      prisma.appointment.count({ where }),
    ]);
  },

  create(patientId: string, data: CreateAppointmentInput) {
    return prisma.appointment.create({
      data: {
        patientId,
        doctorId: data.doctorId,
        scheduledAt: new Date(data.scheduledAt),
        duration: data.duration,
        reason: data.reason,
        notes: data.notes,
      },
      include: FULL_INCLUDE,
    });
  },

  createWithSlot(patientId: string, doctorId: string, slotId: string, data: {
    reason?: string;
    notes?: string;
    duration: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const slot = await tx.doctorSlot.findUnique({ where: { id: slotId } });
      if (!slot || slot.isBooked) throw new Error("SLOT_UNAVAILABLE");

      const [scheduledAt] = [new Date(`${slot.date.toISOString().split("T")[0]}T${slot.startTime}:00`)];

      const appointment = await tx.appointment.create({
        data: {
          patientId,
          doctorId,
          slotId,
          scheduledAt,
          duration: data.duration,
          reason: data.reason,
          notes: data.notes,
        },
        include: FULL_INCLUDE,
      });

      await tx.doctorSlot.update({ where: { id: slotId }, data: { isBooked: true } });
      return appointment;
    });
  },

  updateStatus(id: string, status: AppointmentStatus, notes?: string) {
    return prisma.appointment.update({
      where: { id },
      data: { status, ...(notes !== undefined ? { notes } : {}) },
    });
  },

  reschedule(id: string, scheduledAt: Date, slotId?: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.appointment.findUnique({ where: { id } });
      if (!existing) throw new Error("NOT_FOUND");

      // Free old slot
      if (existing.slotId) {
        await tx.doctorSlot.update({ where: { id: existing.slotId }, data: { isBooked: false } });
      }

      // Book new slot
      if (slotId) {
        const slot = await tx.doctorSlot.findUnique({ where: { id: slotId } });
        if (!slot || slot.isBooked) throw new Error("SLOT_UNAVAILABLE");
        await tx.doctorSlot.update({ where: { id: slotId }, data: { isBooked: true } });
      }

      return tx.appointment.update({
        where: { id },
        data: { scheduledAt, slotId: slotId ?? null, status: "PENDING" },
      });
    });
  },

  countByStatus(doctorId?: string) {
    const where = doctorId ? { doctorId } : {};
    return prisma.appointment.groupBy({ by: ["status"], where, _count: { status: true } });
  },
};
