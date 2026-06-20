import { NextRequest } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations";
import { authService } from "@/services/auth.service";
import { emailService } from "@/services/email.service";
import { ok, serverError, validationError } from "@/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const result = await authService.createPasswordResetToken(parsed.data.email);

    if (result) {
      await emailService
        .sendPasswordReset(result.user.email!, result.user.name ?? "User", result.rawToken)
        .catch(() => {});
    }

    // Always return success to prevent email enumeration
    return ok({ message: "If that email exists, a reset link has been sent." });
  } catch (e) {
    return serverError(e);
  }
}
