import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { analyticsService } from "@/services/analytics.service";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { AdminAppointmentChart } from "@/modules/analytics/admin-appointment-chart";
import { AppointmentStatusChart } from "@/modules/analytics/appointment-status-chart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserCheck, Calendar, Activity, FileText, AlertTriangle, ArrowRight, TrendingUp } from "lucide-react";
import { formatDate, getInitials } from "@/utils/helpers";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [stats, trendData, statusGroups, pendingDoctors, recentUsers, recentAppointments] = await Promise.all([
    analyticsService.getAdminStats(),
    analyticsService.getAdminAppointmentTrend(14),
    prisma.appointment.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.doctor.findMany({
      where: { isVerified: false },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.appointment.findMany({
      include: { patient: { include: { user: true } }, doctor: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const statusData = statusGroups.map((g) => ({ status: g.status, count: g._count.status }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">System overview · {formatDate(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm"><Link href="/admin/doctors">Verify Doctors</Link></Button>
          <Button asChild size="sm"><Link href="/admin/users">Manage Users</Link></Button>
        </div>
      </div>

      {/* Pending doctors alert */}
      {stats.pendingDoctors > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>{stats.pendingDoctors}</strong> doctor{stats.pendingDoctors > 1 ? "s" : ""} pending verification.
          </p>
          <Button asChild variant="outline" size="sm" className="ml-auto border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400">
            <Link href="/admin/doctors">Review</Link>
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} variant="blue" trend={{ value: 12, label: "this month" }} />
        <StatCard title="Total Doctors" value={stats.totalDoctors} icon={UserCheck} variant="green" />
        <StatCard title="Total Appointments" value={stats.totalAppointments} icon={Calendar} variant="purple" />
        <StatCard title="Today's Appointments" value={stats.appointmentsToday} icon={Activity} variant="amber" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="This Month" value={stats.appointmentsThisMonth} icon={TrendingUp} variant="blue" description="Appointments" />
        <StatCard title="Medical Records" value={stats.totalRecords} icon={FileText} variant="purple" description="Total uploaded" />
        <StatCard title="Pending Verification" value={stats.pendingDoctors} icon={AlertTriangle} variant="amber" description="Doctors awaiting review" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminAppointmentChart data={trendData} />
        </div>
        <AppointmentStatusChart data={statusData} />
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending doctors */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader
              title="Pending Doctor Verifications"
              action={
                <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                  <Link href="/admin/doctors">All doctors <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              }
            />
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingDoctors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">All doctors verified ✓</p>
            ) : (
              pendingDoctors.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-semibold bg-amber-100 text-amber-700">
                      {getInitials(d.user.name ?? "D")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">Dr. {d.user.name}</p>
                    <p className="text-xs text-muted-foreground">{d.specialization} · {d.licenseNumber}</p>
                  </div>
                  <AdminVerifyButton doctorId={d.id} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent appointments */}
        <Card>
          <CardHeader className="pb-3">
            <SectionHeader
              title="Recent Appointments"
              action={
                <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                  <Link href="/admin/appointments">All <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              }
            />
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{apt.patient.user.name}</p>
                  <p className="text-xs text-muted-foreground">Dr. {apt.doctor.user.name} · {formatDate(apt.scheduledAt)}</p>
                </div>
                <StatusBadge status={apt.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent users */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader
            title="Recently Joined Users"
            action={
              <Button asChild variant="ghost" size="sm" className="text-xs h-7">
                <Link href="/admin/users">All users <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                    {getInitials(u.name ?? u.email ?? "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{u.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <StatusBadge status={u.role} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminVerifyButton({ doctorId }: { doctorId: string }) {
  return (
    <form action={async () => {
      "use server";
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/doctors/${doctorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify" }),
      });
    }}>
      <Button type="submit" size="sm" variant="outline" className="text-xs h-7 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
        Verify
      </Button>
    </form>
  );
}
