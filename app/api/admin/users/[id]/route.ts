import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditService } from "@/services/audit.service";
import { ok, unauthorized, forbidden, notFound, serverError } from "@/utils/api-response";
import { getClientIp } from "@/lib/rate-limit";
import type { Prisma } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "ADMIN") return forbidden();

    const { id } = await params;
    const body = await req.json();

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return notFound("User not found");
    if (user.role === "ADMIN") return forbidden("Cannot modify admin accounts");

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: body.isActive },
    });

    await auditService.log({
      userId: session.user.id,
      action: body.isActive ? "USER_ACTIVATE" : "USER_SUSPEND",
      entity: "User",
      entityId: id,
      oldValues: { isActive: user.isActive } as Prisma.InputJsonValue,
      newValues: { isActive: body.isActive } as Prisma.InputJsonValue,
      ipAddress: getClientIp(req),
    });

    return ok({ id: updated.id, isActive: updated.isActive });
  } catch (e) {
    return serverError(e);
  }
}
