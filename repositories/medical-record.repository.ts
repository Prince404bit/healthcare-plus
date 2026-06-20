import { prisma } from "@/lib/prisma";
import type { RecordType } from "@prisma/client";
import type { CreateMedicalRecordInput } from "@/lib/validations";

export const medicalRecordRepository = {
  findById(id: string) {
    return prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });
  },

  findByPatient(patientId: string, page: number, pageSize: number, type?: RecordType) {
    const skip = (page - 1) * pageSize;
    const where = { patientId, ...(type ? { type } : {}) };
    return Promise.all([
      prisma.medicalRecord.findMany({
        where,
        skip,
        take: pageSize,
        include: { doctor: { include: { user: true } } },
        orderBy: { recordedAt: "desc" },
      }),
      prisma.medicalRecord.count({ where }),
    ]);
  },

  create(
    patientId: string,
    doctorId: string | null,
    data: CreateMedicalRecordInput,
    file?: { url: string; key: string; name: string; size: number; mimeType: string }
  ) {
    return prisma.medicalRecord.create({
      data: {
        patientId,
        ...(doctorId ? { doctorId } : {}),
        type: data.type,
        title: data.title,
        description: data.description,
        tags: data.tags ?? [],
        recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date(),
        fileUrl: file?.url,
        fileKey: file?.key,
        fileName: file?.name,
        fileSize: file?.size,
        mimeType: file?.mimeType,
      },
    });
  },

  delete(id: string) {
    return prisma.medicalRecord.delete({ where: { id } });
  },
};
