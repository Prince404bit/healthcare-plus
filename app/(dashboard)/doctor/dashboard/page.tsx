import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { analyticsService } from "@/services/analytics.service";
import { doctorRepository } from "@/repositories/doctor.repository";
import { appointmentRepository } from "@/repositories/appointment.repository";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { AppointmentTrendChart } from "@/modules/analytics/appointment-trend-chart";
import { AppointmentStatusChart } from "@/modules/analytics/appointment-status-chart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Users, CheckCircle, Clock, ArrowRight, AlertCircle } from "lucide-react";
import { formatDateTime, formatDate, getInitials } from "@/utils/helpers";
import { DoctorAppointmentActions } from "@/modules/doctor/doctor-appointment-actions";

export default async function DoctorDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "DOCTOR") redirect("/login");

  const doctor = await doctorRepository.findByUserId(session.user.id);
  if (!doctor) redirect("/doctor/profile");

  const [stats, trendData, statusGroups, [allAppointments], recentPatients] = await Promise.all([
    analyticsService.getDoctorStats(doctor.id),
    analyticsService.getDoctorAppointmentTrend(doctor.id, 14),
    appointmentRepository.countByStatus(doctor.id),
    appointmentRepository.findByDoctor(doctor.id, 1, 10),
    prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      select: { patient: { include: { user: true } } },
      distinct: ["patientId"],
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const todayAppointments = allAppointments.filter((a) => {
    const d = new Date(a.scheduledAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const pendingAppointments = allAppointments.filter((a) => a.status === "PENDING");
  const statusData = statusGroups.map((g) => ({ status: g.status, count: g._count.status }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, Dr. {session.user.name?.split(" ").pop()} 👨‍⚕️</h1>
          <p className="text-sm text-muted-foreground mt-1">{formatDate(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/doctor/slots">Manage Slots</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/doctor/appointments">View Queue</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Appointments" value={stats.todayAppointments} icon={Calendar} variant="blue" />
        <StatCard title="Pending Requests" value={stats.pendingAppointments} icon={Clock} variant="amber" />
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} variant="green" />
        <StatCard title="Completed This Month" value={stats.completedThisMonth} icon={CheckCircle} variant="purple" />
      </div>

      {/* Pending alert */}
      {pendingAppointments.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            You have <strong>{pendingAppointments.length}</strong> pending appointment request{pendingAppointments.length > 1 ? "s" : ""} awaiting your response.
          </p>
          <Button asChild variant="outline" size="sm" className="ml-auto border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400">
            <Link href="/doctor/appointments">Review</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <AppointmentTrendChart data={trendData} title="Appointments (Last 14 Days)" />

          {/* Today's queue */}
          <Card>
            <CardHeader className="pb-3">
              <SectionHeader
                title={`Today's Queue (${todayAppointments.length})`}
                action={
                  <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                    <Link href="/doctor/appointments">Full schedule <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className="space-y-2">
              {todayAppointments.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No appointments scheduled for today</p>
                </div>
              ) : (
                todayAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-3 rounded-xl border p-3 hover:bg-accent/50 transition-colors">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                        {getInitials(apt.patient.user.name ?? "P")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{apt.patient.user.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(apt.scheduledAt)} · {apt.duration} min{apt.reason ? ` · ${apt.reason}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={apt.status} />
                      <DoctorAppointmentActions appointmentId={apt.id} status={apt.status} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — 1/3 */}
        <div className="space-y-6">
          <AppointmentStatusChart data={statusData} />

          {/* Recent patients */}
          <Card>
            <CardHeader className="pb-3">
              <SectionHeader
                title="Recent Patients"
                action={
                  <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                    <Link href="/doctor/patients">All <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className="space-y-2">
              {recentPatients.map(({ patient }) => (
                <div key={patient.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent/50 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-muted font-semibold">
                      {getInitials(patient.user.name ?? "P")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{patient.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{patient.user.email}</p>
                  </div>
                  {patient.bloodGroup && (
                    <span className="text-xs font-semibold text-muted-foreground bg-muted rounded px-1.5 py-0.5">{patient.bloodGroup}</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
