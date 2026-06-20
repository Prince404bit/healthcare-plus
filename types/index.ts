import type {
  User,
  Patient,
  Doctor,
  Admin,
  Appointment,
  MedicalRecord,
  MedicineReminder,
  DoseLog,
  Notification,
} from "@prisma/client";

export type {
  User,
  Patient,
  Doctor,
  Admin,
  Appointment,
  MedicalRecord,
  MedicineReminder,
  DoseLog,
  Notification,
};

export type {
  Role,
  Gender,
  AppointmentStatus,
  RecordType,
  ReminderFrequency,
  ReminderStatus,
  DoseStatus,
  NotificationChannel,
} from "@prisma/client";

// ─── Extended / Joined Types ─────────────────────────────────────────────────

export type UserWithRole = User & {
  patient?: Patient | null;
  doctor?: Doctor | null;
  admin?: Admin | null;
};

export type PatientWithUser = Patient & {
  user: User;
};

export type DoctorWithUser = Doctor & {
  user: User;
};

export type AppointmentWithRelations = Appointment & {
  patient: PatientWithUser;
  doctor: DoctorWithUser;
};

export type MedicalRecordWithRelations = MedicalRecord & {
  patient: PatientWithUser;
  doctor?: DoctorWithUser | null;
};

export type ReminderWithLogs = MedicineReminder & {
  doseLogs: DoseLog[];
};

// ─── API Response Types ──────────────────────────────────────────────────────

export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ApiError = {
  error: string;
  details?: unknown;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export type PatientDashboardStats = {
  upcomingAppointments: number;
  activeReminders: number;
  totalRecords: number;
  adherenceRate: number;
};

export type DoctorDashboardStats = {
  todayAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
  completedThisMonth: number;
};

export type AdminDashboardStats = {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  appointmentsToday: number;
};
