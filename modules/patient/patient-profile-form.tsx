"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientProfileSchema, type PatientProfileInput } from "@/lib/validations";
import { api } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/shared/spinner";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Patient } from "@prisma/client";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type Props = { patient: Patient | null };

export function PatientProfileForm({ patient }: Props) {
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<PatientProfileInput>({
    resolver: zodResolver(patientProfileSchema) as never,
    defaultValues: {
      gender: patient?.gender ?? undefined,
      phone: patient?.phone ?? "",
      address: patient?.address ?? "",
      bloodGroup: patient?.bloodGroup ?? "",
      allergies: patient?.allergies ?? [],
      emergencyContactName: patient?.emergencyContactName ?? "",
      emergencyContactPhone: patient?.emergencyContactPhone ?? "",
      dateOfBirth: patient?.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split("T")[0] : "",
    },
  });

  async function onSubmit(data: PatientProfileInput) {
    await api.put("/api/patients", data);
    setSaved(true);
    toast.success("Profile updated");
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Personal Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <FormField label="Date of Birth" error={errors.dateOfBirth?.message}>
            <Input type="date" {...register("dateOfBirth")} />
          </FormField>
          <FormField label="Gender" error={errors.gender?.message}>
            <Select defaultValue={patient?.gender ?? "NONE"} onValueChange={(v) => setValue("gender", v === "NONE" ? undefined : v as PatientProfileInput["gender"])}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Select gender</SelectItem>
              <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            <Input type="tel" placeholder="+1 555 000 0000" {...register("phone")} />
          </FormField>
          <FormField label="Blood Group" error={errors.bloodGroup?.message}>
            <Select defaultValue={patient?.bloodGroup ?? "NONE"} onValueChange={(v) => setValue("bloodGroup", v === "NONE" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {["NONE", ...BLOOD_GROUPS].map((bg) => (
                <SelectItem key={bg} value={bg}>{bg === "NONE" ? "Select blood group" : bg}</SelectItem>
              ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Address" className="col-span-2">
            <Input placeholder="123 Main St, City" {...register("address")} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Emergency Contact</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <FormField label="Contact Name" error={errors.emergencyContactName?.message}>
            <Input placeholder="Jane Doe" {...register("emergencyContactName")} />
          </FormField>
          <FormField label="Contact Phone" error={errors.emergencyContactPhone?.message}>
            <Input type="tel" placeholder="+1 555 000 0001" {...register("emergencyContactPhone")} />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" /> : "Save Changes"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
