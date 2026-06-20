import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { reminderRepository } from "@/repositories/reminder.repository";
import { patientRepository } from "@/repositories/patient.repository";
import { ok, unauthorized, forbidden, badRequest, notFound, serverError, validationError } from "@/utils/api-response";

type Params = { params: Promise<{ id: string }> };

const snoozeSchema = z.object({
  scheduledAt: z.string().datetime(),
  snoozedUntil: z.string().datetime(),
});

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
    const parsed = snoozeSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const log = await reminderRepository.logDose(patient.id, id, {
      scheduledAt: new Date(parsed.data.scheduledAt),
      status: "SNOOZED",
      snoozedUntil: new Date(parsed.data.snoozedUntil),
    });

    return ok(log);
  } catch (e) {
    return serverError(e);
  }
}
