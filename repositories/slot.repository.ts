import { prisma } from "@/lib/prisma";

export const slotRepository = {
  findByDoctor(doctorId: string, from: Date, to: Date) {
    return prisma.doctorSlot.findMany({
      where: { doctorId, date: { gte: from, lte: to } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  },

  findAvailable(doctorId: string, from: Date, to: Date) {
    return prisma.doctorSlot.findMany({
      where: { doctorId, isBooked: false, date: { gte: from, lte: to } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  },

  findById(id: string) {
    return prisma.doctorSlot.findUnique({ where: { id } });
  },

  bulkCreate(doctorId: string, slots: { date: Date; startTime: string; endTime: string }[]) {
    return prisma.doctorSlot.createMany({
      data: slots.map((s) => ({ doctorId, ...s })),
      skipDuplicates: true,
    });
  },

  delete(id: string) {
    return prisma.doctorSlot.delete({ where: { id } });
  },

  deleteUnbooked(doctorId: string, date: Date) {
    return prisma.doctorSlot.deleteMany({
      where: { doctorId, date, isBooked: false },
    });
  },
};
