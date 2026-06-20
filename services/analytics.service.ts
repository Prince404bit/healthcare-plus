import { prisma } from "@/lib/prisma";
import { calculateAdherenceRate } from "@/utils/helpers";
import { subDays, startOfDay, endOfDay, startOfWeek, startOfMonth, format } from "date-fns";

export const analyticsService = {
  async getPatientAdherence(patientId: string, days = 30) {
    const from = subDays(new Date(), days);
    const logs = await prisma.doseLog.findMany({ where: { patientId, scheduledAt: { gte: from } } });
    const total = logs.length;
    const taken = logs.filter((l) => l.status === "TAKEN").length;
    const missed = logs.filter((l) => l.status === "MISSED").length;
    const skipped = logs.filter((l) => l.status === "SKIPPED").length;
    return { total, taken, missed, skipped, adherenceRate: calculateAdherenceRate(taken, total) };
  },

  async getDailyAdherence(patientId: string, days = 14) {
    const results = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const logs = await prisma.doseLog.findMany({
        where: { patientId, scheduledAt: { gte: startOfDay(date), lte: endOfDay(date) } },
      });
      const taken = logs.filter((l) => l.status === "TAKEN").length;
      results.push({
        date: format(date, "MMM d"),
        taken,
        missed: logs.filter((l) => l.status === "MISSED").length,
        total: logs.length,
        rate: calculateAdherenceRate(taken, logs.length),
      });
    }
    return results;
  },

  async getWeeklyAdherence(patientId: string, weeks = 8) {
    const results = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7));
      const weekEnd = endOfDay(subDays(new Date(), (i - 1) * 7 - 1));
      const logs = await prisma.doseLog.findMany({
        where: { patientId, scheduledAt: { gte: weekStart, lte: weekEnd } },
      });
      const taken = logs.filter((l) => l.status === "TAKEN").length;
      results.push({
        week: format(weekStart, "MMM d"),
        taken,
        missed: logs.filter((l) => l.status === "MISSED").length,
        rate: calculateAdherenceRate(taken, logs.length),
      });
    }
    return results;
  },

  async getPatientDashboardStats(patientId: string) {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const [upcomingAppointments, activeReminders, totalRecords, monthLogs] = await Promise.all([
      prisma.appointment.count({ where: { patientId, status: { in: ["PENDING", "CONFIRMED"] }, scheduledAt: { gte: today } } }),
      prisma.medicineReminder.count({ where: { patientId, status: "ACTIVE" } }),
      prisma.medicalRecord.count({ where: { patientId } }),
      prisma.doseLog.findMany({ where: { patientId, scheduledAt: { gte: monthStart } } }),
    ]);
    const taken = monthLogs.filter((l) => l.status === "TAKEN").length;
    return {
      upcomingAppointments,
      activeReminders,
      totalRecords,
      adherenceRate: calculateAdherenceRate(taken, monthLogs.length),
      dosesTaken: taken,
      dosesTotal: monthLogs.length,
    };
  },

  async getAdminStats() {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const [totalPatients, totalDoctors, totalAppointments, appointmentsToday,
      pendingDoctors, appointmentsThisMonth, totalRecords] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { scheduledAt: { gte: startOfDay(today), lte: endOfDay(today) } } }),
      prisma.doctor.count({ where: { isVerified: false } }),
      prisma.appointment.count({ where: { scheduledAt: { gte: monthStart } } }),
      prisma.medicalRecord.count(),
    ]);
    return { totalPatients, totalDoctors, totalAppointments, appointmentsToday, pendingDoctors, appointmentsThisMonth, totalRecords };
  },

  async getAdminAppointmentTrend(days = 14) {
    const results = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const [total, completed, cancelled] = await Promise.all([
        prisma.appointment.count({ where: { scheduledAt: { gte: startOfDay(date), lte: endOfDay(date) } } }),
        prisma.appointment.count({ where: { status: "COMPLETED", scheduledAt: { gte: startOfDay(date), lte: endOfDay(date) } } }),
        prisma.appointment.count({ where: { status: "CANCELLED", scheduledAt: { gte: startOfDay(date), lte: endOfDay(date) } } }),
      ]);
      results.push({ date: format(date, "MMM d"), total, completed, cancelled });
    }
    return results;
  },

  async getDoctorStats(doctorId: string) {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const [todayAppointments, pendingAppointments, completedThisMonth, cancelledThisMonth] = await Promise.all([
      prisma.appointment.count({ where: { doctorId, scheduledAt: { gte: startOfDay(today), lte: endOfDay(today) } } }),
      prisma.appointment.count({ where: { doctorId, status: "PENDING" } }),
      prisma.appointment.count({ where: { doctorId, status: "COMPLETED", scheduledAt: { gte: monthStart } } }),
      prisma.appointment.count({ where: { doctorId, status: "CANCELLED", scheduledAt: { gte: monthStart } } }),
    ]);
    const uniquePatients = await prisma.appointment.findMany({ where: { doctorId }, select: { patientId: true }, distinct: ["patientId"] });
    return { todayAppointments, pendingAppointments, completedThisMonth, cancelledThisMonth, totalPatients: uniquePatients.length };
  },

  async getDoctorAppointmentTrend(doctorId: string, days = 14) {
    const results = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const count = await prisma.appointment.count({
        where: { doctorId, scheduledAt: { gte: startOfDay(date), lte: endOfDay(date) } },
      });
      results.push({ date: format(date, "MMM d"), appointments: count });
    }
    return results;
  },
};
