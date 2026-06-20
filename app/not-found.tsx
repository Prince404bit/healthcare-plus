import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Stethoscope, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Stethoscope className="h-10 w-10 text-primary" />
        </div>
        <div>
          <p className="text-6xl font-black text-muted-foreground/20">404</p>
          <h1 className="text-2xl font-bold -mt-2">Page not found</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="javascript:history.back()"><ArrowLeft className="mr-2 h-4 w-4" /> Go back</Link>
          </Button>
          <Button asChild>
            <Link href="/"><Home className="mr-2 h-4 w-4" /> Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
