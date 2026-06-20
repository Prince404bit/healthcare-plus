import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { doctorRepository } from "@/repositories/doctor.repository";
import { auditService } from "@/services/audit.service";
import { prisma } from "@/lib/prisma";
import { ok, unauthorized, forbidden, notFound, serverError } from "@/utils/api-response";
import { getClientIp } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    const { id } = await params;
    const doctor = await doctorRepository.findById(id);
    if (!doctor) return notFound("Doctor not found");
    return ok(doctor);
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "ADMIN") return forbidden();

    const { id } = await params;
    const body = await req.json();

    if (body.action === "verify") {
      const doctor = await doctorRepository.verify(id);
      await auditService.log({
        userId: session.user.id,
        action: "DOCTOR_VERIFY",
        entity: "Doctor",
        entityId: id,
        ipAddress: getClientIp(req),
      });
      return ok(doctor);
    }

    if (body.action === "unverify") {
      const doctor = await prisma.doctor.update({ where: { id }, data: { isVerified: false } });
      await auditService.log({
        userId: session.user.id,
        action: "DOCTOR_UNVERIFY",
        entity: "Doctor",
        entityId: id,
        ipAddress: getClientIp(req),
      });
      return ok(doctor);
    }

    return notFound("Unknown action");
  } catch (e) {
    return serverError(e);
  }
}
