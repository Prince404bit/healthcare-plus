import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { doctorRepository } from "@/repositories/doctor.repository";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ExternalLink } from "lucide-react";
import { formatDate } from "@/utils/helpers";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Patient Records" };

export default async function DoctorRecordsPage() {
  const session = await auth();
  if (!session || session.user.role !== "DOCTOR") redirect("/login");

  const doctor = await doctorRepository.findByUserId(session.user.id);
  if (!doctor) redirect("/doctor/profile");

  const records = await prisma.medicalRecord.findMany({
    where: { doctorId: doctor.id },
    include: { patient: { include: { user: true } } },
    orderBy: { recordedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Patient Records" description="Records you have created" />

      {records.length === 0 ? (
        <EmptyState icon={FileText} title="No records created" description="Records you create for patients will appear here." />
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{r.title}</p>
                    <StatusBadge status={r.type} />
                  </div>
                  <p className="text-sm text-muted-foreground">Patient: {r.patient.user.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(r.recordedAt)}</p>
                </div>
                {r.fileUrl && (
                  <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
