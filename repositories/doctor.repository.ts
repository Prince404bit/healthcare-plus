import { prisma } from "@/lib/prisma";
import type { DoctorProfileInput } from "@/lib/validations";

export const doctorRepository = {
  findById(id: string) {
    return prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    });
  },

  findByUserId(userId: string) {
    return prisma.doctor.findUnique({
      where: { userId },
      include: { user: true },
    });
  },

  findAll(page: number, pageSize: number, verifiedOnly = false) {
    const skip = (page - 1) * pageSize;
    const where = verifiedOnly ? { isVerified: true } : {};
    return Promise.all([
      prisma.doctor.findMany({
        skip,
        take: pageSize,
        where,
        include: { user: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.doctor.count({ where }),
    ]);
  },

  upsert(userId: string, data: DoctorProfileInput) {
    return prisma.doctor.upsert({
      where: { userId },
      create: { userId, ...data },
      update: { ...data },
      include: { user: true },
    });
  },

  verify(id: string) {
    return prisma.doctor.update({
      where: { id },
      data: { isVerified: true },
    });
  },
};
