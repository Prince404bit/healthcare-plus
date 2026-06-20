import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { updateReminderSchema } from "@/lib/validations";
import { reminderRepository } from "@/repositories/reminder.repository";
import { patientRepository } from "@/repositories/patient.repository";
import { ok, noContent, unauthorized, forbidden, notFound, serverError, validationError } from "@/utils/api-response";

type Params = { params: Promise<{ id: string }> };

async function getPatientAndReminder(userId: string, reminderId: string) {
  const patient = await patientRepository.findByUserId(userId);
  if (!patient) return { error: "no_patient" as const };
  const reminder = await reminderRepository.findById(reminderId);
  if (!reminder || reminder.patientId !== patient.id) return { error: "not_found" as const };
  return { patient, reminder };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "PATIENT") return forbidden();
    const { id } = await params;
    const result = await getPatientAndReminder(session.user.id, id);
    if ("error" in result) return notFound("Reminder not found");
    return ok(result.reminder);
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "PATIENT") return forbidden();
    const { id } = await params;
    const result = await getPatientAndReminder(session.user.id, id);
    if ("error" in result) return notFound("Reminder not found");

    const body = await req.json();
    const parsed = updateReminderSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const updated = await reminderRepository.update(id, parsed.data);
    return ok(updated);
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "PATIENT") return forbidden();
    const { id } = await params;
    const result = await getPatientAndReminder(session.user.id, id);
    if ("error" in result) return notFound("Reminder not found");

    const body = await req.json();
    const { status } = body;
    if (!["ACTIVE", "PAUSED", "COMPLETED", "EXPIRED"].includes(status))
      return serverError("Invalid status");

    const updated = await reminderRepository.updateStatus(id, status);
    return ok(updated);
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "PATIENT") return forbidden();
    const { id } = await params;
    const result = await getPatientAndReminder(session.user.id, id);
    if ("error" in result) return notFound("Reminder not found");

    await reminderRepository.delete(id);
    return noContent();
  } catch (e) {
    return serverError(e);
  }
}
