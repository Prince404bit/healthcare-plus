"use client";

import { Suspense, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/shared/spinner";
import { Stethoscope, KeyRound, AlertCircle, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema) as never,
    defaultValues: { token },
  });

  const password = useWatch({ control, name: "password", defaultValue: "" });

  async function onSubmit(data: ResetPasswordInput) {
    setError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Failed to reset password.");
      return;
    }
    router.push("/login?reset=1");
  }

  if (!token) {
    return (
      <div className="w-full max-w-[420px] text-center">
        <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Invalid link</h1>
        <p className="mt-2 text-sm text-muted-foreground">This reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-8 flex items-center gap-2 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <Stethoscope className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold">HealthCare+</span>
      </div>

      <div className="mb-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose a strong password for your account.</p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <span>{error}</span>
            {(error.includes("expired") || error.includes("invalid")) && (
              <div className="mt-1">
                <Link href="/forgot-password" className="font-medium underline">Request a new link</Link>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" {...register("token")} />
        <FormField label="New Password" error={errors.password?.message} required>
          <PasswordInput placeholder="Create a strong password" autoComplete="new-password" {...register("password")} />
          <PasswordStrength password={password} />
        </FormField>
        <FormField label="Confirm New Password" error={errors.confirmPassword?.message} required>
          <PasswordInput placeholder="Repeat your password" autoComplete="new-password" {...register("confirmPassword")} />
        </FormField>
        <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" /> : "Reset password"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-[420px] animate-pulse space-y-4"><div className="h-8 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
