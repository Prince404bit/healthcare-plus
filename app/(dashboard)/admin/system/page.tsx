import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { auditService } from "@/services/audit.service";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Database, Shield, Activity, Clock, FileText, Users } from "lucide-react";
import { timeAgo } from "@/utils/helpers";

export const metadata = { title: "System" };

export default async function AdminSystemPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [auditLogs, totalUsers, totalRecords, totalDoseLogs] = await Promise.all([
    auditService.getRecent(50),
    prisma.user.count(),
    prisma.medicalRecord.count(),
    prisma.doseLog.count(),
  ]);

  const takenLogs = await prisma.doseLog.count({ where: { status: "TAKEN" } });
  const adherence = totalDoseLogs > 0 ? Math.round((takenLogs / totalDoseLogs) * 100) : 0;

  const ACTION_COLORS: Record<string, string> = {
    USER_REGISTER: "text-blue-600",
    DOCTOR_VERIFY: "text-emerald-600",
    APPOINTMENT_CREATE: "text-purple-600",
    RECORD_UPLOAD: "text-amber-600",
    USER_SUSPEND: "text-red-600",
    PASSWORD_RESET_REQUEST: "text-orange-600",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="System" description="Health metrics and audit trail" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={totalUsers} icon={Users} variant="blue" />
        <StatCard title="Medical Records" value={totalRecords} icon={FileText} variant="purple" />
        <StatCard title="Dose Logs" value={totalDoseLogs} icon={Activity} variant="green" />
        <StatCard title="System Adherence" value={`${adherence}%`} icon={Shield} variant="amber" />
      </div>

      {/* System health */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /> Database Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Users", value: totalUsers, max: 10000 },
              { label: "Medical Records", value: totalRecords, max: 50000 },
              { label: "Dose Logs", value: totalDoseLogs, max: 100000 },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value.toLocaleString()}</span>
                </div>
                <Progress value={Math.min(100, (item.value / item.max) * 100)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Adherence Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Overall Adherence</span>
                <span className="font-semibold text-emerald-600">{adherence}%</span>
              </div>
              <Progress value={adherence} className="[&>div]:bg-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center">
                <p className="text-lg font-bold text-emerald-600">{takenLogs.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Doses Taken</p>
              </div>
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-center">
                <p className="text-lg font-bold text-red-600">{(totalDoseLogs - takenLogs).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Missed / Skipped</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Recent Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No audit events recorded yet</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className={`text-xs font-mono font-semibold shrink-0 ${ACTION_COLORS[log.action] ?? "text-foreground"}`}>
                    {log.action}
                  </span>
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {log.entity}{log.entityId ? ` #${log.entityId.slice(-6)}` : ""}
                    {log.ipAddress ? ` · ${log.ipAddress}` : ""}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">{timeAgo(log.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
