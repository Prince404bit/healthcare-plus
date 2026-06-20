import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { doctorRepository } from "@/repositories/doctor.repository";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { getInitials } from "@/utils/helpers";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Patients" };

export default async function DoctorPatientsPage() {
  const session = await auth();
  if (!session || session.user.role !== "DOCTOR") redirect("/login");

  const doctor = await doctorRepository.findByUserId(session.user.id);
  if (!doctor) redirect("/doctor/profile");

  const patientIds = await prisma.appointment.findMany({
    where: { doctorId: doctor.id },
    select: { patientId: true },
    distinct: ["patientId"],
  });

  const patients = await prisma.patient.findMany({
    where: { id: { in: patientIds.map((p) => p.patientId) } },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="My Patients" description={`${patients.length} patient${patients.length !== 1 ? "s" : ""}`} />

      {patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients yet"
          description="Patients who book appointments with you will appear here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((p) => (
            <Card key={p.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                    {getInitials(p.user.name ?? p.user.email ?? "P")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.user.email}</p>
                  <div className="flex gap-2 mt-1">
                    {p.bloodGroup && (
                      <span className="text-xs font-semibold bg-muted rounded px-1.5 py-0.5">{p.bloodGroup}</span>
                    )}
                    {p.gender && (
                      <span className="text-xs text-muted-foreground capitalize">{p.gender.toLowerCase()}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
