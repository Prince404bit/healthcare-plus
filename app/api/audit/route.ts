import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { auditService } from "@/services/audit.service";
import { ok, unauthorized, forbidden, serverError } from "@/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "ADMIN") return forbidden();

    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId");
    const limit = Number(searchParams.get("limit") ?? 100);

    const logs = userId
      ? await auditService.getByUser(userId, limit)
      : await auditService.getRecent(limit);

    return ok(logs);
  } catch (e) {
    return serverError(e);
  }
}
