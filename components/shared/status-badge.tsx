import { cn } from "@/utils/helpers";

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING:    { label: "Pending",    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  CONFIRMED:  { label: "Confirmed",  className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  COMPLETED:  { label: "Completed",  className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  CANCELLED:  { label: "Cancelled",  className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  NO_SHOW:    { label: "No Show",    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  ACTIVE:     { label: "Active",     className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  PAUSED:     { label: "Paused",     className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  EXPIRED:    { label: "Expired",    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  VERIFIED:   { label: "Verified",   className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  UNVERIFIED: { label: "Pending",    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  SUSPENDED:  { label: "Suspended",  className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold", config.className, className)}>
      {config.label}
    </span>
  );
}
