import { NextRequest } from "next/server";
import { patientRegisterSchema } from "@/lib/validations";
import { authService } from "@/services/auth.service";
import { emailService } from "@/services/email.service";
import { created, conflict, serverError, validationError } from "@/utils/api-response";

// Legacy route — delegates to register-patient
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = patientRegisterSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const user = await authService.registerPatient(parsed.data);
    await emailService.sendWelcomePatient(user.email!, user.name ?? "User").catch(() => {});

    return created({ id: user.id, email: user.email, role: user.role });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "EMAIL_EXISTS")
      return conflict("An account with this email already exists");
    return serverError(e);
  }
}
