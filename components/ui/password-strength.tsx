"use client";

import { cn } from "@/utils/helpers";

type Strength = { score: number; label: string; color: string };

function getStrength(password: string): Strength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", color: "bg-orange-400" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-400" };
  if (score <= 4) return { score, label: "Strong", color: "bg-green-500" };
  return { score, label: "Very Strong", color: "bg-emerald-500" };
}

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, color } = getStrength(password);

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i < score ? color : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs font-medium", score <= 1 ? "text-red-500" : score <= 2 ? "text-orange-500" : score <= 3 ? "text-yellow-600" : "text-green-600")}>
        {label}
      </p>
    </div>
  );
}
