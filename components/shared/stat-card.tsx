import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/helpers";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: "default" | "blue" | "green" | "amber" | "red" | "purple";
  className?: string;
};

const VARIANTS = {
  default: { icon: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", border: "" },
  blue:    { icon: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", border: "border-l-4 border-l-blue-500" },
  green:   { icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", border: "border-l-4 border-l-emerald-500" },
  amber:   { icon: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400", border: "border-l-4 border-l-amber-500" },
  red:     { icon: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400", border: "border-l-4 border-l-red-500" },
  purple:  { icon: "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400", border: "border-l-4 border-l-violet-500" },
};

export function StatCard({ title, value, description, icon: Icon, trend, variant = "default", className }: StatCardProps) {
  const v = VARIANTS[variant];
  return (
    <Card className={cn("overflow-hidden", v.border, className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend && (
              <div className={cn("flex items-center gap-1 text-xs font-medium", trend.value >= 0 ? "text-emerald-600" : "text-red-500")}>
                {trend.value >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}</span>
              </div>
            )}
          </div>
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", v.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
