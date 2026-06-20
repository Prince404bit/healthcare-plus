import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { doctorRepository } from "@/repositories/doctor.repository";
import { DoctorProfileForm } from "@/modules/doctor/doctor-profile-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { getInitials } from "@/utils/helpers";
import { Stethoscope, Award, MapPin, Phone, Clock } from "lucide-react";

export default async function DoctorProfilePage() {
  const session = await auth();
  if (!session || session.user.role !== "DOCTOR") redirect("/login");

  const doctor = await doctorRepository.findByUserId(session.user.id);

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="My Profile" description="Manage your professional information" />

      {/* Profile card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <Avatar className="h-20 w-20 text-lg">
              <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xl">
                {getInitials(session.user.name ?? "DR")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold">Dr. {session.user.name}</h2>
                <StatusBadge status={doctor?.isVerified ? "VERIFIED" : "UNVERIFIED"} />
              </div>
              <p className="text-muted-foreground mt-1">{doctor?.specialization || "Specialization not set"}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                {doctor?.qualification && (
                  <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5" />{doctor.qualification}</span>
                )}
                {doctor?.clinicName && (
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{doctor.clinicName}</span>
                )}
                {doctor?.phone && (
                  <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{doctor.phone}</span>
                )}
                {doctor?.yearsExperience !== null && doctor?.yearsExperience !== undefined && (
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{doctor.yearsExperience} yrs experience</span>
                )}
              </div>
              {!doctor?.isVerified && (
                <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
                  Your account is pending verification by an admin. You can still update your profile.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <DoctorProfileForm doctor={doctor} email={session.user.email ?? ""} />
    </div>
  );
}
