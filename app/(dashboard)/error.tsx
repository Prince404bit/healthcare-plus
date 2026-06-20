"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Failed to load</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{error.message || "Something went wrong loading this page."}</p>
      </div>
      <Button onClick={reset} variant="outline" size="sm">
        <RefreshCw className="mr-2 h-4 w-4" /> Retry
      </Button>
    </div>
  );
}
