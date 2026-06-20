"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/spinner";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = { doctorId: string; isVerified: boolean };

export function AdminDoctorActions({ doctorId, isVerified }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAction() {
    setLoading(true);
    await fetch(`/api/doctors/${doctorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: isVerified ? "unverify" : "verify" }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      variant={isVerified ? "outline" : "default"}
      size="sm"
      onClick={handleAction}
      disabled={loading}
      className={isVerified
        ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
        : "bg-emerald-600 hover:bg-emerald-700 text-white"
      }
    >
      {loading ? <Spinner size="sm" /> : isVerified ? (
        <><XCircle className="mr-1.5 h-3.5 w-3.5" />Revoke</>
      ) : (
        <><CheckCircle className="mr-1.5 h-3.5 w-3.5" />Verify</>
      )}
    </Button>
  );
}
