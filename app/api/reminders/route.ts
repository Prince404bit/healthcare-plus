import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { createReminderSchema } from "@/lib/validations";
import { reminderRepository } from "@/repositories/reminder.repository";
import { patientRepository } from "@/repositories/patient.repository";
import { ok, created, unauthorized, forbidden, badRequest, serverError, validationError } from "@/utils/api-response";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "PATIENT") return forbidden();

    const patient = await patientRepository.findByUserId(session.user.id);
    if (!patient) return badRequest("Patient profile not found");

    const reminders = await reminderRepository.findByPatient(patient.id);
    return ok(reminders);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "PATIENT") return forbidden();

    const body = await req.json();
    const parsed = createReminderSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const patient = await patientRepository.findByUserId(session.user.id);
    if (!patient) return badRequest("Patient profile not found");

    const reminder = await reminderRepository.create(patient.id, parsed.data);
    return created(reminder);
  } catch (e) {
    return serverError(e);
  }
}
