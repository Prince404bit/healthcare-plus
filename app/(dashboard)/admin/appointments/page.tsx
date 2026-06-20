import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { appointmentRepository } from "@/repositories/appointment.repository";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDateTime, getInitials } from "@/utils/helpers";

export default async function AdminAppointmentsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [appointments] = await appointmentRepository.findAll(1, 200);

  const groups = {
    all: appointments,
    pending: appointments.filter((a) => a.status === "PENDING"),
    confirmed: appointments.filter((a) => a.status === "CONFIRMED"),
    completed: appointments.filter((a) => a.status === "COMPLETED"),
    cancelled: appointments.filter((a) => ["CANCELLED", "NO_SHOW"].includes(a.status)),
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Appointments" description="System-wide appointment overview" />

      <Tabs defaultValue="all">
        <TabsList>
          {Object.entries(groups).map(([key, items]) => (
            <TabsTrigger key={key} value={key} className="capitalize text-xs">
              {key} <span className="ml-1 text-muted-foreground">({items.length})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groups).map(([key, items]) => (
          <TabsContent key={key} value={key} className="mt-4 space-y-2">
            {items.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-xs font-semibold bg-blue-100 text-blue-700">
                        {getInitials(apt.patient.user.name ?? "P")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{apt.patient.user.name}</p>
                      <p className="text-xs text-muted-foreground">Patient</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                    <span>→</span>
                    <span className="font-medium text-foreground">Dr. {apt.doctor.user.name}</span>
                    <span className="text-muted-foreground">({apt.doctor.specialization})</span>
                  </div>
                  <div className="ml-auto flex items-center gap-3 shrink-0">
                    <div className="text-right hidden md:block">
                      <p className="text-xs font-medium">{formatDateTime(apt.scheduledAt)}</p>
                      <p className="text-xs text-muted-foreground">{apt.duration} min</p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
