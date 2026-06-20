import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { patientProfileSchema, paginationSchema } from "@/lib/validations";
import { patientRepository } from "@/repositories/patient.repository";
import { ok, unauthorized, forbidden, serverError, validationError, paginate } from "@/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "ADMIN") return forbidden();

    const { searchParams } = req.nextUrl;
    const parsed = paginationSchema.safeParse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
    });
    if (!parsed.success) return validationError(parsed.error);

    const [data, total] = await patientRepository.findAll(parsed.data.page, parsed.data.pageSize);
    return paginate(data, total, parsed.data.page, parsed.data.pageSize);
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "PATIENT") return forbidden();

    const body = await req.json();
    const parsed = patientProfileSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const patient = await patientRepository.upsert(session.user.id, parsed.data);
    return ok(patient);
  } catch (e) {
    return serverError(e);
  }
}
