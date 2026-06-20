"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doctorRegisterSchema, type DoctorRegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/shared/spinner";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyResolver = any;

const SPECIALIZATIONS = [
  "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology",
  "General Practice", "Gynecology", "Neurology", "Oncology",
  "Ophthalmology", "Orthopedics", "Pediatrics", "Psychiatry",
  "Pulmonology", "Radiology", "Surgery", "Urology", "Other",
];

type Props = {
  onSuccess: () => void;
  onError: (msg: string) => void;
};

export function DoctorRegisterForm({ onSuccess, onError }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DoctorRegisterInput>({
    resolver: zodResolver(doctorRegisterSchema) as AnyResolver,
  });

  const password = useWatch({ control, name: "password", defaultValue: "" });

  async function onSubmit(data: DoctorRegisterInput) {
    onError("");
    const res = await fetch("/api/auth/register-doctor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      onError(json.error ?? "Registration failed. Please try again.");
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Full Name" error={errors.name?.message} required className="col-span-2">
          <Input placeholder="Dr. John Smith" autoComplete="name" {...register("name")} />
        </FormField>

        <FormField label="Email" error={errors.email?.message} required className="col-span-2">
          <Input type="email" placeholder="doctor@example.com" autoComplete="email" {...register("email")} />
        </FormField>

        <FormField label="Phone" error={errors.phone?.message} required className="col-span-2">
          <Input type="tel" placeholder="+1 555 000 0000" {...register("phone")} />
        </FormField>

        <div className="col-span-2 pt-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Professional Details</p>
        </div>

        <FormField label="Specialization" error={errors.specialization?.message} required className="col-span-2">
          <Input placeholder="e.g. Cardiology" list="specializations" {...register("specialization")} />
          <datalist id="specializations">
            {SPECIALIZATIONS.map((s) => <option key={s} value={s} />)}
          </datalist>
        </FormField>

        <FormField label="Qualification" error={errors.qualification?.message} required className="col-span-2">
          <Input placeholder="e.g. MBBS, MD, FRCS" {...register("qualification")} />
        </FormField>

        <FormField label="License Number" error={errors.licenseNumber?.message} required className="col-span-2">
          <Input placeholder="Medical license number" {...register("licenseNumber")} />
        </FormField>

        <FormField label="Years of Experience" error={errors.yearsExperience?.message} required>
          <Input type="number" placeholder="5" min={0} max={60} {...register("yearsExperience")} />
        </FormField>

        <FormField label="Consultation Fee ($)" error={errors.consultationFee?.message} required>
          <Input type="number" placeholder="100" min={0} {...register("consultationFee")} />
        </FormField>

        <FormField label="Clinic Name" error={errors.clinicName?.message} className="col-span-2">
          <Input placeholder="City Medical Center (optional)" {...register("clinicName")} />
        </FormField>

        <FormField label="Clinic Address" error={errors.clinicAddress?.message} className="col-span-2">
          <Input placeholder="123 Main St, City (optional)" {...register("clinicAddress")} />
        </FormField>

        <FormField label="Bio" error={errors.bio?.message} className="col-span-2">
          <Input placeholder="Brief professional bio (optional)" {...register("bio")} />
        </FormField>

        <div className="col-span-2 pt-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Security</p>
        </div>

        <FormField label="Password" error={errors.password?.message} required className="col-span-2">
          <PasswordInput placeholder="Create a strong password" autoComplete="new-password" {...register("password")} />
          <PasswordStrength password={password} />
        </FormField>

        <FormField label="Confirm Password" error={errors.confirmPassword?.message} required className="col-span-2">
          <PasswordInput placeholder="Repeat your password" autoComplete="new-password" {...register("confirmPassword")} />
        </FormField>
      </div>

      <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        Your account will be reviewed and verified by our admin team before you can accept appointments.
      </p>

      <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
        {isSubmitting ? <Spinner size="sm" /> : "Create Doctor Account"}
      </Button>
    </form>
  );
}
