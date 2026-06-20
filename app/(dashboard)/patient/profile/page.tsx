import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { patientRepository } from "@/repositories/patient.repository";
import { PatientProfileForm } from "@/modules/patient/patient-profile-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { getInitials } from "@/utils/helpers";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Profile" };

export default async function PatientProfilePage() {
  const session = await auth();
  if (!session || session.user.role !== "PATIENT") redirect("/login");

  const patient = await patientRepository.findByUserId(session.user.id);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="My Profile" description="Manage your personal and medical information" />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xl">
                {getInitials(session.user.name ?? session.user.email ?? "P")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold">{session.user.name}</h2>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
              <StatusBadge status="PATIENT" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <PatientProfileForm patient={patient} />
    </div>
  );
}
