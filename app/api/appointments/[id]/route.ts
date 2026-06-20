import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { updateAppointmentStatusSchema, rescheduleAppointmentSchema } from "@/lib/validations";
import { appointmentRepository } from "@/repositories/appointment.repository";
import { ok, unauthorized, forbidden, notFound, serverError, validationError } from "@/utils/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    const { id } = await params;
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) return notFound("Appointment not found");

    const { role } = session.user;
    if (role === "PATIENT" && appointment.patient.userId !== session.user.id) return forbidden();
    if (role === "DOCTOR" && appointment.doctor.userId !== session.user.id) return forbidden();

    return ok(appointment);
  } catch (e) {
    return serverError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    const { id } = await params;
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) return notFound("Appointment not found");

    const { role } = session.user;
    const isPatient = role === "PATIENT" && appointment.patient.userId === session.user.id;
    const isDoctor = role === "DOCTOR" && appointment.doctor.userId === session.user.id;
    const isAdmin = role === "ADMIN";
    if (!isPatient && !isDoctor && !isAdmin) return forbidden();

    const body = await req.json();

    // Reschedule action
    if (body.action === "reschedule") {
      if (!isPatient) return forbidden();
      const parsed = rescheduleAppointmentSchema.safeParse(body);
      if (!parsed.success) return validationError(parsed.error);
      const updated = await appointmentRepository.reschedule(id, new Date(parsed.data.scheduledAt), parsed.data.slotId);
      return ok(updated);
    }

    // Status update
    const parsed = updateAppointmentStatusSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    if (isPatient && parsed.data.status !== "CANCELLED") return forbidden();

    const updated = await appointmentRepository.updateStatus(id, parsed.data.status, parsed.data.notes);
    return ok(updated);
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "SLOT_UNAVAILABLE") return serverError("Slot unavailable");
    return serverError(e);
  }
}
