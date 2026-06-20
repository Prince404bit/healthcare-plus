import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { doctorRepository } from "@/repositories/doctor.repository";
import { appointmentRepository } from "@/repositories/appointment.repository";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { DoctorAppointmentActions } from "@/modules/doctor/doctor-appointment-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import { formatDateTime, getInitials } from "@/utils/helpers";
import type { AppointmentStatus } from "@prisma/client";

export default async function DoctorAppointmentsPage() {
  const session = await auth();
  if (!session || session.user.role !== "DOCTOR") redirect("/login");

  const doctor = await doctorRepository.findByUserId(session.user.id);
  if (!doctor) redirect("/doctor/profile");

  const [appointments] = await appointmentRepository.findByDoctor(doctor.id, 1, 100);

  const groups: Record<string, typeof appointments> = {
    all: appointments,
    pending: appointments.filter((a) => a.status === "PENDING"),
    confirmed: appointments.filter((a) => a.status === "CONFIRMED"),
    completed: appointments.filter((a) => a.status === "COMPLETED"),
    cancelled: appointments.filter((a) => ["CANCELLED", "NO_SHOW"].includes(a.status)),
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Appointments" description="Manage your patient appointment queue" />

      <Tabs defaultValue="pending">
        <TabsList className="h-9">
          {Object.entries(groups).map(([key, items]) => (
            <TabsTrigger key={key} value={key} className="capitalize text-xs">
              {key} {items.length > 0 && <span className="ml-1.5 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-semibold">{items.length}</span>}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groups).map(([key, items]) => (
          <TabsContent key={key} value={key} className="mt-4">
            {items.length === 0 ? (
              <EmptyState icon={Calendar} title={`No ${key} appointments`} />
            ) : (
              <div className="space-y-2">
                {items.map((apt) => (
                  <Card key={apt.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                          {getInitials(apt.patient.user.name ?? "P")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{apt.patient.user.name}</p>
                          <StatusBadge status={apt.status} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(apt.scheduledAt)} · {apt.duration} min
                          {apt.reason && ` · ${apt.reason}`}
                        </p>
                        {apt.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{apt.notes}</p>}
                      </div>
                      <DoctorAppointmentActions appointmentId={apt.id} status={apt.status as AppointmentStatus} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
