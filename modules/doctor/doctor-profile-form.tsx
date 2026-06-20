"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doctorProfileSchema, type DoctorProfileInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/shared/spinner";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Doctor } from "@prisma/client";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Props = { doctor: Doctor | null; email: string };

export function DoctorProfileForm({ doctor, email }: Props) {
  const [saved, setSaved] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(doctor?.availableDays ?? []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DoctorProfileInput>({
    resolver: zodResolver(doctorProfileSchema) as never,
    defaultValues: {
      specialization: doctor?.specialization ?? "",
      licenseNumber: doctor?.licenseNumber ?? "",
      qualification: doctor?.qualification ?? "",
      clinicName: doctor?.clinicName ?? "",
      clinicAddress: doctor?.clinicAddress ?? "",
      phone: doctor?.phone ?? "",
      bio: doctor?.bio ?? "",
      yearsExperience: doctor?.yearsExperience ?? undefined,
      consultationFee: doctor?.consultationFee ? Number(doctor.consultationFee) : undefined,
      availableFrom: doctor?.availableFrom ?? "",
      availableTo: doctor?.availableTo ?? "",
    },
  });

  function toggleDay(day: string) {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  }

  async function onSubmit(data: DoctorProfileInput) {
    const res = await fetch("/api/doctors", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, availableDays: selectedDays }),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Professional Info */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Professional Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <FormField label="Email" className="col-span-2">
            <Input value={email} disabled className="bg-muted" />
          </FormField>
          <FormField label="Specialization" error={errors.specialization?.message} required>
            <Input placeholder="e.g. Cardiology" {...register("specialization")} />
          </FormField>
          <FormField label="Qualification" error={errors.qualification?.message}>
            <Input placeholder="e.g. MBBS, MD" {...register("qualification")} />
          </FormField>
          <FormField label="License Number" error={errors.licenseNumber?.message} required>
            <Input placeholder="Medical license number" {...register("licenseNumber")} />
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            <Input placeholder="+1 555 000 0000" {...register("phone")} />
          </FormField>
          <FormField label="Years of Experience" error={errors.yearsExperience?.message}>
            <Input type="number" min={0} {...register("yearsExperience", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Consultation Fee ($)" error={errors.consultationFee?.message}>
            <Input type="number" min={0} {...register("consultationFee", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Bio" className="col-span-2">
            <Textarea placeholder="Brief professional bio..." rows={3} {...register("bio")} />
          </FormField>
        </CardContent>
      </Card>

      {/* Clinic Info */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Clinic Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <FormField label="Clinic Name">
            <Input placeholder="City Medical Center" {...register("clinicName")} />
          </FormField>
          <FormField label="Clinic Address" className="col-span-2">
            <Input placeholder="123 Main St, City" {...register("clinicAddress")} />
          </FormField>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Availability</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Available Days">
            <div className="flex flex-wrap gap-2 mt-1">
              {DAYS.map((day) => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${selectedDays.includes(day) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Available From">
              <Input type="time" {...register("availableFrom")} />
            </FormField>
            <FormField label="Available To">
              <Input type="time" {...register("availableTo")} />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" /> : "Save Changes"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Saved successfully
          </span>
        )}
      </div>
    </form>
  );
}
