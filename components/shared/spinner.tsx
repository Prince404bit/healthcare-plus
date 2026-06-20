import { cn } from "@/utils/helpers";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
};

const SIZE_MAP = { sm: "h-4 w-4 border-2", md: "h-6 w-6 border-2", lg: "h-10 w-10 border-[3px]" };

export function Spinner({ size = "md", className, label = "Loading..." }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("animate-spin rounded-full border-muted border-t-primary", SIZE_MAP[size], className)}
    />
  );
}

export function FullPageSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center" role="status" aria-label={label}>
      <Spinner size="lg" />
    </div>
  );
}
