import { NextRequest } from "next/server";
import { patientRegisterSchema } from "@/lib/validations";
import { authService } from "@/services/auth.service";
import { emailService } from "@/services/email.service";
import { auditService } from "@/services/audit.service";
import { created, conflict, serverError, validationError } from "@/utils/api-response";
import { getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = patientRegisterSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const user = await authService.registerPatient(parsed.data);

    await Promise.all([
      emailService.sendWelcomePatient(user.email!, user.name ?? "Patient").catch(() => {}),
      auditService.log({
        userId: user.id,
        action: "USER_REGISTER",
        entity: "User",
        entityId: user.id,
        newValues: { role: "PATIENT", email: user.email } as import("@prisma/client").Prisma.InputJsonValue,
        ipAddress: getClientIp(req),
        userAgent: req.headers.get("user-agent") ?? undefined,
      }),
    ]);

    return created({ id: user.id, email: user.email, role: user.role });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "EMAIL_EXISTS")
      return conflict("An account with this email already exists");
    return serverError(e);
  }
}
