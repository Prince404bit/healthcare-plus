"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientRegisterSchema, type PatientRegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { FormField } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/shared/spinner";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyResolver = any;

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type Props = {
  onSuccess: () => void;
  onError: (msg: string) => void;
};

export function PatientRegisterForm({ onSuccess, onError }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PatientRegisterInput>({
    resolver: zodResolver(patientRegisterSchema) as AnyResolver,
  });

  const password = useWatch({ control, name: "password", defaultValue: "" });

  async function onSubmit(data: PatientRegisterInput) {
    onError("");
    const res = await fetch("/api/auth/register-patient", {
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
          <Input placeholder="John Doe" autoComplete="name" {...register("name")} />
        </FormField>

        <FormField label="Email" error={errors.email?.message} required className="col-span-2">
          <Input type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} />
        </FormField>

        <FormField label="Age" error={errors.age?.message} required>
          <Input type="number" placeholder="25" min={1} max={120} {...register("age")} />
        </FormField>

        <FormField label="Gender" error={errors.gender?.message} required>
          <Select onValueChange={(v) => setValue("gender", v as PatientRegisterInput["gender"])}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Blood Group" error={errors.bloodGroup?.message} required>
          <Select onValueChange={(v) => setValue("bloodGroup", v as PatientRegisterInput["bloodGroup"])}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_GROUPS.map((bg) => (
                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Allergies" error={errors.allergies?.message} className="col-span-2">
          <Input placeholder="Penicillin, Peanuts (comma separated)" {...register("allergies")} />
        </FormField>

        <FormField label="Emergency Contact Name" error={errors.emergencyContactName?.message} required className="col-span-2">
          <Input placeholder="Jane Doe" {...register("emergencyContactName")} />
        </FormField>

        <FormField label="Emergency Contact Phone" error={errors.emergencyContactPhone?.message} required className="col-span-2">
          <Input type="tel" placeholder="+1 555 000 0000" {...register("emergencyContactPhone")} />
        </FormField>

        <FormField label="Password" error={errors.password?.message} required className="col-span-2">
          <PasswordInput placeholder="Create a strong password" autoComplete="new-password" {...register("password")} />
          <PasswordStrength password={password} />
        </FormField>

        <FormField label="Confirm Password" error={errors.confirmPassword?.message} required className="col-span-2">
          <PasswordInput placeholder="Repeat your password" autoComplete="new-password" {...register("confirmPassword")} />
        </FormField>
      </div>

      <Button type="submit" className="w-full h-10 mt-2" disabled={isSubmitting}>
        {isSubmitting ? <Spinner size="sm" /> : "Create Patient Account"}
      </Button>
    </form>
  );
}
