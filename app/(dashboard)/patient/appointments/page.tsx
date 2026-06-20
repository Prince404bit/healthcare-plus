import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { patientRepository } from "@/repositories/patient.repository";
import { appointmentRepository } from "@/repositories/appointment.repository";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Plus } from "lucide-react";
import { formatDateTime, getInitials } from "@/utils/helpers";
import type { AppointmentStatus } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Appointments" };

export default async function PatientAppointmentsPage() {
  const session = await auth();
  if (!session || session.user.role !== "PATIENT") redirect("/login");

  const patient = await patientRepository.findByUserId(session.user.id);
  if (!patient) redirect("/patient/profile");

  const [appointments] = await appointmentRepository.findByPatient(patient.id, 1, 100);

  const groups: Record<string, typeof appointments> = {
    upcoming: appointments.filter((a) => ["PENDING", "CONFIRMED"].includes(a.status)),
    completed: appointments.filter((a) => a.status === "COMPLETED"),
    cancelled: appointments.filter((a) => ["CANCELLED", "NO_SHOW"].includes(a.status)),
    all: appointments,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Appointments"
        description="View and manage your appointments"
        action={
          <Button asChild>
            <Link href="/patient/appointments/book">
              <Plus className="h-4 w-4 mr-2" /> Book Appointment
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="upcoming">
        <TabsList>
          {Object.entries(groups).map(([key, items]) => (
            <TabsTrigger key={key} value={key} className="capitalize text-xs">
              {key}
              {items.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-semibold">
                  {items.length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groups).map(([key, items]) => (
          <TabsContent key={key} value={key} className="mt-4">
            {items.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title={`No ${key} appointments`}
                description={key === "upcoming" ? "Book an appointment with a doctor to get started." : undefined}
                action={
                  key === "upcoming" ? (
                    <Button asChild size="sm">
                      <Link href="/patient/appointments/book">
                        <Plus className="h-4 w-4 mr-2" /> Book Now
                      </Link>
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="space-y-2">
                {items.map((apt) => (
                  <Card key={apt.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <span className="text-sm font-bold leading-none">
                          {new Date(apt.scheduledAt).getDate()}
                        </span>
                        <span className="text-[10px] leading-none mt-0.5">
                          {new Date(apt.scheduledAt).toLocaleString("default", { month: "short" })}
                        </span>
                      </div>
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="text-xs font-semibold bg-emerald-100 text-emerald-700">
                          {getInitials(apt.doctor.user.name ?? "DR")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">Dr. {apt.doctor.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {apt.doctor.specialization} · {formatDateTime(apt.scheduledAt)} · {apt.duration} min
                        </p>
                        {apt.reason && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            Reason: {apt.reason}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={apt.status as AppointmentStatus} />
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
