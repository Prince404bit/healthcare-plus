import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { analyticsService } from "@/services/analytics.service";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { AdminAppointmentChart } from "@/modules/analytics/admin-appointment-chart";
import { AppointmentStatusChart } from "@/modules/analytics/appointment-status-chart";
import { AdherenceChart } from "@/modules/analytics/adherence-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Calendar, Activity, FileText, Pill } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [stats, trendData, statusGroups, totalReminders, activeReminders, totalDoseLogs] = await Promise.all([
    analyticsService.getAdminStats(),
    analyticsService.getAdminAppointmentTrend(14),
    prisma.appointment.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.medicineReminder.count(),
    prisma.medicineReminder.count({ where: { status: "ACTIVE" } }),
    prisma.doseLog.count(),
  ]);

  const takenLogs = await prisma.doseLog.count({ where: { status: "TAKEN" } });
  const systemAdherence = totalDoseLogs > 0 ? Math.round((takenLogs / totalDoseLogs) * 100) : 0;
  const statusData = statusGroups.map((g) => ({ status: g.status, count: g._count.status }));

  return (
    <div className="space-y-6">
      <PageHeader title="System Analytics" description="Platform-wide statistics and trends" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} variant="blue" />
        <StatCard title="Total Doctors" value={stats.totalDoctors} icon={UserCheck} variant="green" />
        <StatCard title="Total Appointments" value={stats.totalAppointments} icon={Calendar} variant="purple" />
        <StatCard title="Medical Records" value={stats.totalRecords} icon={FileText} variant="amber" />
        <StatCard title="Active Reminders" value={activeReminders} icon={Pill} variant="red" description={`of ${totalReminders} total`} />
        <StatCard title="System Adherence" value={`${systemAdherence}%`} icon={Activity} variant="green" description={`${takenLogs} of ${totalDoseLogs} doses taken`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminAppointmentChart data={trendData} />
        </div>
        <AppointmentStatusChart data={statusData} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Medicine Adherence Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4">
              <p className="text-2xl font-bold text-emerald-600">{takenLogs}</p>
              <p className="text-xs text-muted-foreground mt-1">Doses Taken</p>
            </div>
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-2xl font-bold text-red-600">{totalDoseLogs - takenLogs}</p>
              <p className="text-xs text-muted-foreground mt-1">Doses Missed/Skipped</p>
            </div>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4">
              <p className="text-2xl font-bold text-blue-600">{systemAdherence}%</p>
              <p className="text-xs text-muted-foreground mt-1">Overall Adherence</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
