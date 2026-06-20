import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "At least one uppercase letter")
  .regex(/[0-9]/, "At least one number");

export const patientRegisterSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
    age: z.preprocess((v) => Number(v), z.number().int().min(1).max(120, "Invalid age")),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], { message: "Select a gender" }),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
      message: "Select a blood group",
    }),
    allergies: z.string().optional(),
    emergencyContactName: z.string().min(2, "Emergency contact name required"),
    emergencyContactPhone: z
      .string()
      .min(7, "Valid phone number required")
      .regex(/^[+\d\s\-()]+$/, "Invalid phone number"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const doctorRegisterSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
    specialization: z.string().min(2, "Specialization is required"),
    qualification: z.string().min(2, "Qualification is required"),
    licenseNumber: z.string().min(3, "License number is required"),
    yearsExperience: z.preprocess((v) => Number(v), z.number().int().min(0).max(60, "Invalid experience")),
    consultationFee: z.preprocess((v) => Number(v), z.number().min(0, "Invalid fee")),
    clinicName: z.string().optional(),
    clinicAddress: z.string().optional(),
    phone: z.string().min(7, "Valid phone required").regex(/^[+\d\s\-()]+$/, "Invalid phone"),
    bio: z.string().max(500, "Bio too long").optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Legacy unified schema (kept for backward compat)
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["PATIENT", "DOCTOR"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Patient Profile ──────────────────────────────────────────────────────────

export const patientProfileSchema = z.object({
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

// ─── Doctor Profile ───────────────────────────────────────────────────────────

export const doctorProfileSchema = z.object({
  specialization: z.string().min(2, "Specialization is required"),
  licenseNumber: z.string().min(3, "License number is required"),
  qualification: z.string().optional(),
  clinicName: z.string().optional(),
  clinicAddress: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  yearsExperience: z.number().int().min(0).optional(),
  consultationFee: z.number().min(0).optional(),
  availableDays: z.array(z.string()).optional(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
});

// ─── Appointment ─────────────────────────────────────────────────────────────

export const createAppointmentSchema = z.object({
  doctorId: z.string().cuid("Invalid doctor ID"),
  scheduledAt: z.string().datetime("Invalid date/time"),
  duration: z.number().int().min(15).max(120).default(30),
  reason: z.string().min(5, "Please describe the reason").optional(),
  notes: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]),
  notes: z.string().optional(),
});

// ─── Medical Record ──────────────────────────────────────────────────────────

export const createMedicalRecordSchema = z.object({
  type: z.enum([
    "LAB_RESULT",
    "PRESCRIPTION",
    "IMAGING",
    "DISCHARGE_SUMMARY",
    "VACCINATION",
    "OTHER",
  ]),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  recordedAt: z.string().datetime().optional(),
});

// ─── Medicine Reminder ───────────────────────────────────────────────────────

export const createReminderSchema = z.object({
  medicineName: z.string().min(2, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.enum(["ONCE", "DAILY", "TWICE_DAILY", "THREE_TIMES_DAILY", "WEEKLY", "CUSTOM"]),
  times: z.array(z.string()).min(1, "At least one time is required"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  instructions: z.string().optional(),
  color: z.string().optional(),
});

export const updateReminderSchema = z.object({
  medicineName: z.string().min(2).optional(),
  dosage: z.string().min(1).optional(),
  frequency: z.enum(["ONCE", "DAILY", "TWICE_DAILY", "THREE_TIMES_DAILY", "WEEKLY", "CUSTOM"]).optional(),
  times: z.array(z.string()).min(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  instructions: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "EXPIRED"]).optional(),
});

export const logDoseSchema = z.object({
  reminderId: z.string().cuid(),
  scheduledAt: z.string().datetime(),
  status: z.enum(["TAKEN", "MISSED", "SKIPPED", "SNOOZED"]),
  takenAt: z.string().datetime().optional(),
  snoozedUntil: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const createSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
});

export const bulkCreateSlotsSchema = z.object({
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDuration: z.number().int().min(15).max(120).default(30),
});

export const rescheduleAppointmentSchema = z.object({
  scheduledAt: z.string().datetime(),
  slotId: z.string().cuid().optional(),
});

// ─── Pagination ──────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

// ─── Inferred Types ──────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PatientRegisterInput = z.infer<typeof patientRegisterSchema>;
export type DoctorRegisterInput = z.infer<typeof doctorRegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type PatientProfileInput = z.infer<typeof patientProfileSchema>;
export type DoctorProfileInput = z.infer<typeof doctorProfileSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordSchema>;
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
export type LogDoseInput = z.infer<typeof logDoseSchema>;
export type CreateSlotInput = z.infer<typeof createSlotSchema>;
export type BulkCreateSlotsInput = z.infer<typeof bulkCreateSlotsSchema>;
export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>;
