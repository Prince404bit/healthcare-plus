import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { doctorProfileSchema, paginationSchema } from "@/lib/validations";
import { doctorRepository } from "@/repositories/doctor.repository";
import { ok, unauthorized, forbidden, serverError, validationError, paginate } from "@/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return unauthorized();

    const { searchParams } = req.nextUrl;
    const parsed = paginationSchema.safeParse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
    });
    if (!parsed.success) return validationError(parsed.error);

    const verifiedOnly = session.user.role === "PATIENT";
    const [data, total] = await doctorRepository.findAll(parsed.data.page, parsed.data.pageSize, verifiedOnly);
    return paginate(data, total, parsed.data.page, parsed.data.pageSize);
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "DOCTOR") return forbidden();

    const body = await req.json();
    const parsed = doctorProfileSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const doctor = await doctorRepository.upsert(session.user.id, parsed.data);
    return ok(doctor);
  } catch (e) {
    return serverError(e);
  }
}
