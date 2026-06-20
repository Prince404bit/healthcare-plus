"use client";

import { useState } from "react";
import { useMedicalRecords } from "@/hooks/use-medical-records";
import { RecordCard } from "@/modules/medical-records/record-card";
import { UploadRecordDialog } from "@/modules/medical-records/upload-record-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FullPageSpinner } from "@/components/shared/spinner";
import { FileText, Upload } from "lucide-react";
import type { MedicalRecord } from "@prisma/client";

type RecordWithDoctor = MedicalRecord & {
  doctor?: { user: { name: string | null } } | null;
};

type RecordsResponse = {
  data: RecordWithDoctor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const TYPES = [
  { value: "ALL", label: "All Types" },
  { value: "LAB_RESULT", label: "Lab Results" },
  { value: "PRESCRIPTION", label: "Prescriptions" },
  { value: "IMAGING", label: "Imaging" },
  { value: "DISCHARGE_SUMMARY", label: "Discharge Summaries" },
  { value: "VACCINATION", label: "Vaccinations" },
  { value: "OTHER", label: "Other" },
];

export default function PatientRecordsPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const { data, isLoading } = useMedicalRecords(1, 50, typeFilter === "ALL" ? undefined : typeFilter);

  if (isLoading) return <FullPageSpinner />;

  const records = (data as RecordsResponse | undefined)?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medical Records"
        description="Your complete medical history"
        action={
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" /> Upload Record
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {records.length} record{records.length !== 1 ? "s" : ""}
        </span>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No records found"
          description={typeFilter !== "ALL" ? "No records match this filter." : "Upload your first medical record to get started."}
          action={
            typeFilter === "ALL" ? (
              <Button onClick={() => setUploadOpen(true)}>
                <Upload className="h-4 w-4 mr-2" /> Upload Record
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <RecordCard key={r.id} record={r} />
          ))}
        </div>
      )}

      <UploadRecordDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
