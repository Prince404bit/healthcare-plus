import { auth } from "@/lib/auth";
import { analyticsService } from "@/services/analytics.service";
import { ok, unauthorized, forbidden, serverError } from "@/utils/api-response";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "ADMIN") return forbidden();

    const stats = await analyticsService.getAdminStats();
    return ok(stats);
  } catch (e) {
    return serverError(e);
  }
}
