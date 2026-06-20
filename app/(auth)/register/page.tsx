"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stethoscope, User, AlertCircle } from "lucide-react";
import { cn } from "@/utils/helpers";
import { PatientRegisterForm } from "@/modules/auth/patient-register-form";
import { DoctorRegisterForm } from "@/modules/auth/doctor-register-form";

type Role = "PATIENT" | "DOCTOR";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("PATIENT");
  const [error, setError] = useState<string | null>(null);

  function handleSuccess() {
    router.push("/login?registered=1");
  }

  return (
    <div className="w-full max-w-[520px]">
      {/* Mobile logo */}
      <div className="mb-6 flex items-center gap-2 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <Stethoscope className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold">HealthCare+</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join HealthCare+ and take control of your health
        </p>
      </div>

      {/* Role selector */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => { setRole("PATIENT"); setError(null); }}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all",
            role === "PATIENT"
              ? "border-primary bg-primary/5 text-primary"
              : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            role === "PATIENT" ? "bg-primary/10" : "bg-muted"
          )}>
            <User className="h-5 w-5" />
          </div>
          <span>I&apos;m a Patient</span>
        </button>

        <button
          type="button"
          onClick={() => { setRole("DOCTOR"); setError(null); }}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all",
            role === "DOCTOR"
              ? "border-primary bg-primary/5 text-primary"
              : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            role === "DOCTOR" ? "bg-primary/10" : "bg-muted"
          )}>
            <Stethoscope className="h-5 w-5" />
          </div>
          <span>I&apos;m a Doctor</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {role === "PATIENT" ? (
        <PatientRegisterForm onSuccess={handleSuccess} onError={setError} />
      ) : (
        <DoctorRegisterForm onSuccess={handleSuccess} onError={setError} />
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
