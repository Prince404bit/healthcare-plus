import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { bulkCreateSlotsSchema } from "@/lib/validations";
import { slotRepository } from "@/repositories/slot.repository";
import { doctorRepository } from "@/repositories/doctor.repository";
import { ok, created, unauthorized, forbidden, badRequest, serverError, validationError } from "@/utils/api-response";
import { addMinutes, parseISO, format } from "date-fns";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return unauthorized();

    const { id } = await params;
    const { searchParams } = req.nextUrl;
    const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date();
    const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : new Date(Date.now() + 30 * 86400000);
    const availableOnly = searchParams.get("available") === "true";

    const slots = availableOnly
      ? await slotRepository.findAvailable(id, from, to)
      : await slotRepository.findByDoctor(id, from, to);

    return ok(slots);
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "DOCTOR") return forbidden();

    const { id } = await params;
    const doctor = await doctorRepository.findByUserId(session.user.id);
    if (!doctor || doctor.id !== id) return forbidden();

    const body = await req.json();
    const parsed = bulkCreateSlotsSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const slots: { date: Date; startTime: string; endTime: string }[] = [];

    for (const dateStr of parsed.data.dates) {
      const date = parseISO(dateStr);
      let current = parsed.data.startTime;

      while (true) {
        const [h, m] = current.split(":").map(Number);
        const start = new Date(date);
        start.setHours(h, m, 0, 0);
        const end = addMinutes(start, parsed.data.slotDuration);
        const endStr = format(end, "HH:mm");

        if (endStr > parsed.data.endTime) break;

        slots.push({ date, startTime: current, endTime: endStr });
        current = endStr;
      }
    }

    if (slots.length === 0) return badRequest("No valid slots generated");

    const result = await slotRepository.bulkCreate(id, slots);
    return created({ count: result.count });
  } catch (e) {
    return serverError(e);
  }
}
