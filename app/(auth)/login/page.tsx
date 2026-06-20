"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/shared/spinner";
import { Stethoscope, AlertCircle, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const registered = searchParams.get("registered");
  const reset = searchParams.get("reset");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setError(null);
    const result = await signIn("credentials", {
      email: data.email.toLowerCase().trim(),
      password: data.password,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
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
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your account to continue</p>
      </div>

      {registered && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <span>Account created! You can now sign in.</span>
        </div>
      )}

      {reset && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <span>Password reset successfully. Sign in with your new password.</span>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Email address" error={errors.email?.message} required>
          <Input type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} />
        </FormField>

        <FormField label="Password" error={errors.password?.message} required>
          <PasswordInput placeholder="Enter your password" autoComplete="current-password" {...register("password")} />
        </FormField>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" /> : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create account
          </Link>
        </p>
      </div>

      <div className="mt-8 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground text-center">
        <strong>Demo Admin:</strong> admin@healthcare.app / Admin@123456
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-[420px] animate-pulse space-y-4"><div className="h-8 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
