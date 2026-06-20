import { cn } from "@/utils/helpers";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const SIZE = {
  sm: { wrap: "py-8", icon: "h-8 w-8 p-2", iconInner: "h-4 w-4", title: "text-sm", desc: "text-xs" },
  md: { wrap: "py-12", icon: "h-12 w-12 p-3", iconInner: "h-6 w-6", title: "text-base", desc: "text-sm" },
  lg: { wrap: "py-16", icon: "h-16 w-16 p-4", iconInner: "h-8 w-8", title: "text-lg", desc: "text-sm" },
};

export function EmptyState({ icon: Icon, title, description, action, className, size = "md" }: EmptyStateProps) {
  const s = SIZE[size];
  return (
    <div
      role="status"
      aria-label={title}
      className={cn("flex flex-col items-center justify-center text-center", s.wrap, className)}
    >
      {Icon && (
        <div className={cn("mb-4 rounded-full bg-muted flex items-center justify-center", s.icon)}>
          <Icon className={cn("text-muted-foreground", s.iconInner)} aria-hidden="true" />
        </div>
      )}
      <h3 className={cn("font-semibold text-foreground", s.title)}>{title}</h3>
      {description && (
        <p className={cn("mt-1 text-muted-foreground max-w-xs", s.desc)}>{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
