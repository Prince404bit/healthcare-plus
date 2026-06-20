import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { analyticsService } from "@/services/analytics.service";
import { patientRepository } from "@/repositories/patient.repository";
import { appointmentRepository } from "@/repositories/appointment.repository";
import { reminderRepository } from "@/repositories/reminder.repository";
import { medicalRecordRepository } from "@/repositories/medical-record.repository";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { AdherenceRingChart } from "@/modules/analytics/adherence-ring-chart";
import { AdherenceChart } from "@/modules/analytics/adherence-chart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Bell, FileText, Activity, ArrowRight, Pill, Plus } from "lucide-react";
import { formatDateTime, formatDate } from "@/utils/helpers";

export default async function PatientDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "PATIENT") redirect("/login");

  const patient = await patientRepository.findByUserId(session.user.id);
  if (!patient) redirect("/patient/profile");

  const [stats, adherence, dailyData, [appointments], reminders, [records]] = await Promise.all([
    analyticsService.getPatientDashboardStats(patient.id),
    analyticsService.getPatientAdherence(patient.id, 30),
    analyticsService.getDailyAdherence(patient.id, 14),
    appointmentRepository.findByPatient(patient.id, 1, 5),
    reminderRepository.findByPatient(patient.id),
    medicalRecordRepository.findByPatient(patient.id, 1, 3),
  ]);

  const upcoming = appointments.filter((a) => ["PENDING", "CONFIRMED"].includes(a.status));
  const activeReminders = reminders.filter((r) => r.status === "ACTIVE");
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Good {getGreeting()}, {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Here&apos;s your health summary for today, {formatDate(new Date())}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/patient/appointments"><Plus className="h-4 w-4 mr-1.5" />Book Appointment</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/patient/medicines"><Pill className="h-4 w-4 mr-1.5" />Add Medicine</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Upcoming Appointments" value={stats.upcomingAppointments} icon={Calendar} variant="blue" />
        <StatCard title="Active Reminders" value={stats.activeReminders} icon={Bell} variant="amber" />
        <StatCard title="Adherence Rate" value={`${stats.adherenceRate}%`} icon={Activity} variant="green" description="This month" />
        <StatCard title="Medical Records" value={stats.totalRecords} icon={FileText} variant="purple" />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left col — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Adherence chart */}
          <AdherenceChart data={dailyData} />

          {/* Upcoming appointments */}
          <Card>
            <CardHeader className="pb-3">
              <SectionHeader
                title="Upcoming Appointments"
                action={
                  <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                    <Link href="/patient/appointments">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className="space-y-2">
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                  <Button asChild variant="link" size="sm" className="mt-1">
                    <Link href="/patient/appointments">Book one now</Link>
                  </Button>
                </div>
              ) : (
                upcoming.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-3 rounded-xl border bg-card p-3 hover:bg-accent/50 transition-colors">
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-xs font-bold leading-none">{formatDate(apt.scheduledAt, "d")}</span>
                      <span className="text-[10px] leading-none mt-0.5">{formatDate(apt.scheduledAt, "MMM")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">Dr. {apt.doctor.user.name}</p>
                      <p className="text-xs text-muted-foreground">{apt.doctor.specialization} · {formatDateTime(apt.scheduledAt)}</p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right col — 1/3 */}
        <div className="space-y-6">
          {/* Adherence ring */}
          <AdherenceRingChart taken={adherence.taken} missed={adherence.missed} skipped={adherence.skipped} rate={adherence.adherenceRate} />

          {/* Today's medicines */}
          <Card>
            <CardHeader className="pb-3">
              <SectionHeader
                title="Today's Medicines"
                action={
                  <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                    <Link href="/patient/medicines">Manage <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className="space-y-2">
              {activeReminders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active reminders</p>
              ) : (
                activeReminders.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: (r.color ?? "#3b82f6") + "20" }}>
                      <Pill className="h-4 w-4" style={{ color: r.color ?? "#3b82f6" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{r.medicineName}</p>
                      <p className="text-[11px] text-muted-foreground">{r.dosage} · {r.times.join(", ")}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent records */}
          <Card>
            <CardHeader className="pb-3">
              <SectionHeader
                title="Recent Records"
                action={
                  <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                    <Link href="/patient/records">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className="space-y-2">
              {records.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No records uploaded</p>
              ) : (
                records.map((r) => (
                  <div key={r.id} className="flex items-center gap-2.5 rounded-lg border p-2.5">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{r.title}</p>
                      <p className="text-[11px] text-muted-foreground">{r.type.replace("_", " ")} · {formatDate(r.recordedAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
