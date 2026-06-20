import { prisma } from "@/lib/prisma";
import type { PatientProfileInput } from "@/lib/validations";

export const patientRepository = {
  findById(id: string) {
    return prisma.patient.findUnique({
      where: { id },
      include: { user: true },
    });
  },

  findByUserId(userId: string) {
    return prisma.patient.findUnique({
      where: { userId },
      include: { user: true },
    });
  },

  findAll(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    return Promise.all([
      prisma.patient.findMany({
        skip,
        take: pageSize,
        include: { user: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.patient.count(),
    ]);
  },

  upsert(userId: string, data: PatientProfileInput) {
    return prisma.patient.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
      update: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
      include: { user: true },
    });
  },
};
