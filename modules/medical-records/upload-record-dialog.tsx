"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMedicalRecordSchema, type CreateMedicalRecordInput } from "@/lib/validations";
import { useUploadRecord } from "@/hooks/use-medical-records";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/shared/spinner";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/utils/helpers";

const RECORD_TYPES = [
  { value: "LAB_RESULT", label: "Lab Result" },
  { value: "PRESCRIPTION", label: "Prescription" },
  { value: "IMAGING", label: "Imaging / X-Ray" },
  { value: "DISCHARGE_SUMMARY", label: "Discharge Summary" },
  { value: "VACCINATION", label: "Vaccination" },
  { value: "OTHER", label: "Other" },
];

type Props = { open: boolean; onClose: () => void };

export function UploadRecordDialog({ open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadRecord();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateMedicalRecordInput>({
    resolver: zodResolver(createMedicalRecordSchema) as never,
    defaultValues: { type: "OTHER" },
  });

  function handleFile(f: File) {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(f.type)) { alert("Only PDF and images allowed"); return; }
    if (f.size > 10 * 1024 * 1024) { alert("File must be under 10 MB"); return; }
    setFile(f);
  }

  async function onSubmit(data: CreateMedicalRecordInput) {
    await uploadMutation.mutateAsync({ meta: data, file: file ?? undefined });
    reset();
    setFile(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); setFile(null); onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Medical Record</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Record Type" error={errors.type?.message} required>
            <Select defaultValue="OTHER" onValueChange={(v) => setValue("type", v as CreateMedicalRecordInput["type"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RECORD_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Title" error={errors.title?.message} required>
            <Input placeholder="e.g. Blood Test Results - Jan 2025" {...register("title")} />
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <Textarea placeholder="Optional notes about this record..." rows={2} {...register("description")} />
          </FormField>

          <FormField label="Date" error={errors.recordedAt?.message}>
            <Input type="date" defaultValue={new Date().toISOString().split("T")[0]}
              onChange={(e) => setValue("recordedAt", e.target.value ? new Date(e.target.value).toISOString() : undefined)} />
          </FormField>

          {/* File drop zone */}
          <div
            className={cn(
              "relative rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button type="button" variant="ghost" size="icon" className="ml-auto"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Drop file here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, WEBP · Max 10 MB</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? <Spinner size="sm" /> : "Upload Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
