import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { logDoseSchema } from "@/lib/validations";
import { reminderRepository } from "@/repositories/reminder.repository";
import { patientRepository } from "@/repositories/patient.repository";
import { created, unauthorized, forbidden, badRequest, notFound, serverError, validationError } from "@/utils/api-response";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "PATIENT") return forbidden();

    const { id } = await params;
    const patient = await patientRepository.findByUserId(session.user.id);
    if (!patient) return badRequest("Patient profile not found");

    const reminder = await reminderRepository.findById(id);
    if (!reminder || reminder.patientId !== patient.id) return notFound("Reminder not found");

    const body = await req.json();
    const parsed = logDoseSchema.safeParse({ ...body, reminderId: id });
    if (!parsed.success) return validationError(parsed.error);

    const log = await reminderRepository.logDose(patient.id, id, {
      scheduledAt: new Date(parsed.data.scheduledAt),
      status: parsed.data.status,
      takenAt: parsed.data.takenAt ? new Date(parsed.data.takenAt) : undefined,
      snoozedUntil: parsed.data.snoozedUntil ? new Date(parsed.data.snoozedUntil) : undefined,
      notes: parsed.data.notes,
    });

    return created(log);
  } catch (e) {
    return serverError(e);
  }
}
