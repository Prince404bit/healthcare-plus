"use client";

import { useUpdateAppointmentStatus } from "@/hooks/use-appointments";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle, Check } from "lucide-react";
import type { AppointmentStatus } from "@prisma/client";

type Props = { appointmentId: string; status: AppointmentStatus };

export function DoctorAppointmentActions({ appointmentId, status }: Props) {
  const mutation = useUpdateAppointmentStatus();

  if (status === "COMPLETED" || status === "CANCELLED" || status === "NO_SHOW") return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {status === "PENDING" && (
          <DropdownMenuItem onClick={() => mutation.mutate({ id: appointmentId, status: "CONFIRMED" })}>
            <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" /> Confirm
          </DropdownMenuItem>
        )}
        {(status === "PENDING" || status === "CONFIRMED") && (
          <DropdownMenuItem onClick={() => mutation.mutate({ id: appointmentId, status: "COMPLETED" })}>
            <Check className="mr-2 h-4 w-4 text-blue-600" /> Mark Completed
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => mutation.mutate({ id: appointmentId, status: "CANCELLED" })}
        >
          <XCircle className="mr-2 h-4 w-4" /> Cancel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
