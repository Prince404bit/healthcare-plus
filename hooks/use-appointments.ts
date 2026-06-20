"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import type { CreateAppointmentInput } from "@/lib/validations";

const QUERY_KEY = ["appointments"] as const;

export function useAppointments(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [...QUERY_KEY, page, pageSize],
    queryFn: () => api.get(`/api/appointments?page=${page}&pageSize=${pageSize}`),
  });
}

export function useDoctors(page = 1, pageSize = 50, specialization?: string) {
  const sp = specialization ? `&specialization=${encodeURIComponent(specialization)}` : "";
  return useQuery({
    queryKey: ["doctors", page, pageSize, specialization],
    queryFn: () => api.get(`/api/doctors?page=${page}&pageSize=${pageSize}${sp}`),
  });
}

export function useDoctorSlots(doctorId: string, from: string, to: string) {
  return useQuery({
    queryKey: ["slots", doctorId, from, to],
    queryFn: () =>
      api
        .get<{ data: unknown[] }>(`/api/doctors/${doctorId}/slots?from=${from}&to=${to}&available=true`)
        .then((r) => r.data),
    enabled: !!doctorId,
  });
}

export function useBookAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppointmentInput & { slotId?: string }) =>
      api.post("/api/appointments", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["slots"] });
      toast.success("Appointment booked", "Your appointment request has been submitted.");
    },
    onError: (e: Error) => toast.error("Booking failed", e.message),
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      api.patch(`/api/appointments/${id}`, { status: "CANCELLED", notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Appointment cancelled");
    },
    onError: (e: Error) => toast.error("Failed to cancel", e.message),
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      api.patch(`/api/appointments/${id}`, { status, notes }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      const labels: Record<string, string> = {
        CONFIRMED: "Appointment confirmed",
        COMPLETED: "Appointment marked as completed",
        CANCELLED: "Appointment cancelled",
        NO_SHOW: "Marked as no-show",
      };
      toast.success(labels[vars.status] ?? "Status updated");
    },
    onError: (e: Error) => toast.error("Failed to update status", e.message),
  });
}

export function useRescheduleAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scheduledAt, slotId }: { id: string; scheduledAt: string; slotId?: string }) =>
      api.patch(`/api/appointments/${id}`, { action: "reschedule", scheduledAt, slotId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["slots"] });
      toast.success("Appointment rescheduled");
    },
    onError: (e: Error) => toast.error("Failed to reschedule", e.message),
  });
}
