import { auth } from "@/lib/auth";
import { analyticsService } from "@/services/analytics.service";
import { doctorRepository } from "@/repositories/doctor.repository";
import { ok, unauthorized, forbidden, badRequest, serverError } from "@/utils/api-response";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "DOCTOR") return forbidden();

    const doctor = await doctorRepository.findByUserId(session.user.id);
    if (!doctor) return badRequest("Doctor profile not found");

    const stats = await analyticsService.getDoctorStats(doctor.id);
    return ok(stats);
  } catch (e) {
    return serverError(e);
  }
}
