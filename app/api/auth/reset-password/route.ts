import { NextRequest } from "next/server";
import { resetPasswordSchema } from "@/lib/validations";
import { authService } from "@/services/auth.service";
import { ok, badRequest, serverError, validationError } from "@/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    await authService.resetPassword(parsed.data.token, parsed.data.password);
    return ok({ message: "Password reset successfully." });
  } catch (e: unknown) {
    if (e instanceof Error) {
      if (e.message === "INVALID_TOKEN") return badRequest("Invalid or expired reset link");
      if (e.message === "TOKEN_USED") return badRequest("This reset link has already been used");
      if (e.message === "TOKEN_EXPIRED") return badRequest("Reset link has expired. Please request a new one");
    }
    return serverError(e);
  }
}
