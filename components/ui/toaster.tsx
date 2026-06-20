"use client";

import { useToastStore } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/utils/helpers";

const ICONS = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
  destructive: <XCircle className="h-4 w-4 text-red-500 shrink-0" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
  default: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
};

const STYLES = {
  success: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950",
  destructive: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
  warning: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
  default: "border-border bg-card",
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
    >
      {toasts.map((t) => {
        const variant = t.variant ?? "default";
        return (
          <div
            key={t.id}
            role="alert"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg",
              "animate-in slide-in-from-right-full duration-300",
              STYLES[variant]
            )}
          >
            {ICONS[variant]}
            <div className="flex-1 min-w-0">
              {t.title && <p className="text-sm font-semibold leading-none">{t.title}</p>}
              {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
