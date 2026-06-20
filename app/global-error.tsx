"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="flex flex-col items-center gap-5 text-center max-w-md">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Application Error</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {error.message || "An unexpected error occurred. Our team has been notified."}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-1 font-mono">Error ID: {error.digest}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button onClick={reset} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> Try again
            </Button>
            <Button asChild>
              <Link href="/"><Home className="mr-2 h-4 w-4" /> Go home</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
