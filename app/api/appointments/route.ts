import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { createAppointmentSchema, paginationSchema } from "@/lib/validations";
import { appointmentRepository } from "@/repositories/appointment.repository";
import { patientRepository } from "@/repositories/patient.repository";
import { doctorRepository } from "@/repositories/doctor.repository";
import { emailService } from "@/services/email.service";
import { ok, created, unauthorized, forbidden, badRequest, serverError, validationError, paginate } from "@/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return unauthorized();

    const { searchParams } = req.nextUrl;
    const parsed = paginationSchema.safeParse({ page: searchParams.get("page"), pageSize: searchParams.get("pageSize") });
    if (!parsed.success) return validationError(parsed.error);
    const { page, pageSize } = parsed.data;

    if (session.user.role === "PATIENT") {
      const patient = await patientRepository.findByUserId(session.user.id);
      if (!patient) return badRequest("Patient profile not found");
      const [data, total] = await appointmentRepository.findByPatient(patient.id, page, pageSize);
      return paginate(data, total, page, pageSize);
    }

    if (session.user.role === "DOCTOR") {
      const doctor = await doctorRepository.findByUserId(session.user.id);
      if (!doctor) return badRequest("Doctor profile not found");
      const [data, total] = await appointmentRepository.findByDoctor(doctor.id, page, pageSize);
      return paginate(data, total, page, pageSize);
    }

    if (session.user.role === "ADMIN") {
      const [data, total] = await appointmentRepository.findAll(page, pageSize);
      return paginate(data, total, page, pageSize);
    }

    return forbidden();
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return unauthorized();
    if (session.user.role !== "PATIENT") return forbidden();

    const body = await req.json();
    const parsed = createAppointmentSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const patient = await patientRepository.findByUserId(session.user.id);
    if (!patient) return badRequest("Complete your patient profile first");

    let appointment;
    if (body.slotId) {
      const doctor = await doctorRepository.findById(parsed.data.doctorId);
      if (!doctor) return badRequest("Doctor not found");
      appointment = await appointmentRepository.createWithSlot(patient.id, parsed.data.doctorId, body.slotId, {
        reason: parsed.data.reason,
        notes: parsed.data.notes,
        duration: parsed.data.duration,
      }).catch((e: Error) => { throw e; });
    } else {
      appointment = await appointmentRepository.create(patient.id, parsed.data);
    }

    await emailService.sendAppointmentConfirmation({
      to: session.user.email!,
      patientName: session.user.name ?? "Patient",
      doctorName: appointment.doctor.user.name ?? "Doctor",
      scheduledAt: appointment.scheduledAt,
      status: "PENDING",
    }).catch(() => {});

    return created(appointment);
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "SLOT_UNAVAILABLE") return badRequest("This slot is no longer available");
    return serverError(e);
  }
}
