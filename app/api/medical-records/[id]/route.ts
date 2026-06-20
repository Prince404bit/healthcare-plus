import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { medicalRecordRepository } from "@/repositories/medical-record.repository";
import { storageService } from "@/services/storage.service";
import { ok, noContent, unauthorized, forbidden, notFound, serverError } from "@/utils/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return unauthorized();

    const { id } = await params;
    const record = await medicalRecordRepository.findById(id);
    if (!record) return notFound("Record not found");

    if (session.user.role === "PATIENT" && record.patient.userId !== session.user.id) return forbidden();

    // Generate signed URL for private file access
    let signedUrl: string | undefined;
    if (record.fileKey && req.nextUrl.searchParams.get("signed") === "true") {
      signedUrl = await storageService.getSignedUrl(record.fileKey).catch(() => undefined);
    }

    return ok({ ...record, signedUrl });
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return unauthorized();

    const { id } = await params;
    const record = await medicalRecordRepository.findById(id);
    if (!record) return notFound("Record not found");

    if (session.user.role === "PATIENT" && record.patient.userId !== session.user.id) return forbidden();
    if (session.user.role === "DOCTOR") return forbidden();

    if (record.fileKey) await storageService.delete(record.fileKey).catch(() => {});
    await medicalRecordRepository.delete(id);
    return noContent();
  } catch (e) {
    return serverError(e);
  }
}
