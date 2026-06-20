import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { patientRepository } from "@/repositories/patient.repository";
import { analyticsService } from "@/services/analytics.service";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AdherenceChart } from "@/modules/analytics/adherence-chart";
import { AdherenceRingChart } from "@/modules/analytics/adherence-ring-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle, XCircle, SkipForward } from "lucide-react";

export default async function PatientAnalyticsPage() {
  const session = await auth();
  if (!session || session.user.role !== "PATIENT") redirect("/login");

  const patient = await patientRepository.findByUserId(session.user.id);
  if (!patient) redirect("/patient/profile");

  const [summary30, summary7, daily14, weekly8] = await Promise.all([
    analyticsService.getPatientAdherence(patient.id, 30),
    analyticsService.getPatientAdherence(patient.id, 7),
    analyticsService.getDailyAdherence(patient.id, 14),
    analyticsService.getWeeklyAdherence(patient.id, 8),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Dose Analytics" description="Track your medication adherence over time" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Adherence Rate" value={`${summary30.adherenceRate}%`} icon={Activity} variant="green" description="Last 30 days" />
        <StatCard title="Doses Taken" value={summary30.taken} icon={CheckCircle} variant="blue" description="Last 30 days" />
        <StatCard title="Doses Missed" value={summary30.missed} icon={XCircle} variant="red" description="Last 30 days" />
        <StatCard title="Doses Skipped" value={summary30.skipped} icon={SkipForward} variant="amber" description="Last 30 days" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <AdherenceChart data={daily14} />

          {/* Weekly trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Weekly Adherence Trend (8 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weekly8.map((w) => (
                  <div key={w.week} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-14 shrink-0">{w.week}</span>
                    <div className="flex-1 h-5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${w.rate}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-10 text-right">{w.rate}%</span>
                    <span className="text-xs text-muted-foreground w-20 text-right">{w.taken}T / {w.missed}M</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <AdherenceRingChart taken={summary30.taken} missed={summary30.missed} skipped={summary30.skipped} rate={summary30.adherenceRate} />

          {/* 7-day summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "Adherence", value: `${summary7.adherenceRate}%`, color: "text-emerald-600" },
                  { label: "Taken", value: summary7.taken, color: "text-blue-600" },
                  { label: "Missed", value: summary7.missed, color: "text-red-500" },
                  { label: "Skipped", value: summary7.skipped, color: "text-amber-500" },
                  { label: "Total Scheduled", value: summary7.total, color: "text-foreground" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={`font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
