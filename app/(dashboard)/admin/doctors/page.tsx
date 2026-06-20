import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { doctorRepository } from "@/repositories/doctor.repository";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminDoctorActions } from "@/modules/admin/admin-doctor-actions";
import { getInitials } from "@/utils/helpers";
import { Award, MapPin, Phone, DollarSign, Clock } from "lucide-react";

export default async function AdminDoctorsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [allDoctors] = await doctorRepository.findAll(1, 200);
  const verified = allDoctors.filter((d) => d.isVerified);
  const pending = allDoctors.filter((d) => !d.isVerified);

  const appointmentCounts = await prisma.appointment.groupBy({
    by: ["doctorId"],
    _count: { doctorId: true },
  });
  const countMap = Object.fromEntries(appointmentCounts.map((a) => [a.doctorId, a._count.doctorId]));

  return (
    <div className="space-y-6">
      <PageHeader title="Doctor Management" description={`${allDoctors.length} registered doctors`} />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pending.length})
            {pending.length > 0 && <span className="ml-1.5 h-2 w-2 rounded-full bg-amber-500 inline-block" />}
          </TabsTrigger>
          <TabsTrigger value="verified">Verified ({verified.length})</TabsTrigger>
          <TabsTrigger value="all">All ({allDoctors.length})</TabsTrigger>
        </TabsList>

        {[
          { key: "pending", items: pending },
          { key: "verified", items: verified },
          { key: "all", items: allDoctors },
        ].map(({ key, items }) => (
          <TabsContent key={key} value={key} className="mt-4 space-y-3">
            {items.map((d) => (
              <Card key={d.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarFallback className="font-bold bg-emerald-100 text-emerald-700">
                        {getInitials(d.user.name ?? "DR")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">Dr. {d.user.name}</p>
                        <StatusBadge status={d.isVerified ? "VERIFIED" : "UNVERIFIED"} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{d.user.email}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Award className="h-3 w-3" />{d.specialization}</span>
                        {d.qualification && <span className="flex items-center gap-1"><Award className="h-3 w-3" />{d.qualification}</span>}
                        {d.licenseNumber && <span className="font-mono bg-muted px-1.5 py-0.5 rounded">#{d.licenseNumber}</span>}
                        {d.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{d.phone}</span>}
                        {d.clinicName && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{d.clinicName}</span>}
                        {d.consultationFee && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${Number(d.consultationFee)}</span>}
                        {d.yearsExperience !== null && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{d.yearsExperience} yrs</span>}
                        <span className="text-primary font-medium">{countMap[d.id] ?? 0} appointments</span>
                      </div>
                    </div>
                    <AdminDoctorActions doctorId={d.id} isVerified={d.isVerified} />
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
