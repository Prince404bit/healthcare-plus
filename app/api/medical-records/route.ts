import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { createMedicalRecordSchema, paginationSchema } from "@/lib/validations";
import { medicalRecordRepository } from "@/repositories/medical-record.repository";
import { patientRepository } from "@/repositories/patient.repository";
import { doctorRepository } from "@/repositories/doctor.repository";
import { storageService } from "@/services/storage.service";
import { ok, created, unauthorized, forbidden, badRequest, serverError, validationError, paginate } from "@/utils/api-response";
import type { RecordType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return unauthorized();

    const { searchParams } = req.nextUrl;
    const parsed = paginationSchema.safeParse({ page: searchParams.get("page"), pageSize: searchParams.get("pageSize") });
    if (!parsed.success) return validationError(parsed.error);
    const type = searchParams.get("type") as RecordType | null;

    if (session.user.role === "PATIENT") {
      const patient = await patientRepository.findByUserId(session.user.id);
      if (!patient) return badRequest("Patient profile not found");
      const [data, total] = await medicalRecordRepository.findByPatient(patient.id, parsed.data.page, parsed.data.pageSize, type ?? undefined);
      return paginate(data, total, parsed.data.page, parsed.data.pageSize);
    }

    if (session.user.role === "DOCTOR") {
      const patientId = searchParams.get("patientId");
      if (!patientId) return badRequest("patientId required");
      const [data, total] = await medicalRecordRepository.findByPatient(patientId, parsed.data.page, parsed.data.pageSize, type ?? undefined);
      return paginate(data, total, parsed.data.page, parsed.data.pageSize);
    }

    return forbidden();
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (!["PATIENT", "DOCTOR"].includes(session.user.role)) return forbidden();

    const formData = await req.formData();
    const metaRaw = formData.get("meta");
    if (!metaRaw) return badRequest("Missing record metadata");

    const parsed = createMedicalRecordSchema.safeParse(JSON.parse(metaRaw as string));
    if (!parsed.success) return validationError(parsed.error);

    let patientId: string;
    let doctorId: string | null = null;

    if (session.user.role === "PATIENT") {
      const patient = await patientRepository.findByUserId(session.user.id);
      if (!patient) return badRequest("Patient profile not found");
      patientId = patient.id;
    } else {
      const pid = formData.get("patientId") as string;
      if (!pid) return badRequest("patientId required for doctor uploads");
      patientId = pid;
      const doctor = await doctorRepository.findByUserId(session.user.id);
      if (doctor) doctorId = doctor.id;
    }

    let fileData: { url: string; key: string; name: string; size: number; mimeType: string } | undefined;
    const file = formData.get("file") as File | null;
    if (file) {
      fileData = await storageService.upload(session.user.id, file);
    }

    const record = await medicalRecordRepository.create(patientId, doctorId, parsed.data, fileData);
    return created(record);
  } catch (e: unknown) {
    if (e instanceof Error && (e.message.includes("10 MB") || e.message.includes("Only PDF")))
      return badRequest(e.message);
    return serverError(e);
  }
}
