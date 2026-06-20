import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { analyticsService } from "@/services/analytics.service";
import { patientRepository } from "@/repositories/patient.repository";
import { ok, unauthorized, forbidden, badRequest, serverError } from "@/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "PATIENT") return forbidden();

    const patient = await patientRepository.findByUserId(session.user.id);
    if (!patient) return badRequest("Patient profile not found");

    const days = Number(req.nextUrl.searchParams.get("days") ?? 30);

    const [summary, daily] = await Promise.all([
      analyticsService.getPatientAdherence(patient.id, days),
      analyticsService.getDailyAdherence(patient.id, 14),
    ]);

    return ok({ summary, daily });
  } catch (e) {
    return serverError(e);
  }
}
