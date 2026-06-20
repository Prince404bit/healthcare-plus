import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { patientRepository } from "@/repositories/patient.repository";
import { ok, unauthorized, forbidden, notFound, serverError } from "@/utils/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return unauthorized();

    const { id } = await params;

    if (session.user.role === "PATIENT") {
      const patient = await patientRepository.findByUserId(session.user.id);
      if (!patient || patient.id !== id) return forbidden();
    } else if (!["DOCTOR", "ADMIN"].includes(session.user.role)) {
      return forbidden();
    }

    const patient = await patientRepository.findById(id);
    if (!patient) return notFound("Patient not found");

    return ok(patient);
  } catch (e) {
    return serverError(e);
  }
}
