"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import type { CreateReminderInput, UpdateReminderInput } from "@/lib/validations";
import type { MedicineReminder, DoseLog } from "@prisma/client";

type ReminderWithLogs = MedicineReminder & { doseLogs: DoseLog[] };

const QUERY_KEY = ["reminders"] as const;

export function useReminders() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => api.get<{ data: ReminderWithLogs[] }>("/api/reminders").then((r) => r.data),
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReminderInput) =>
      api.post<{ data: ReminderWithLogs }>("/api/reminders", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Reminder added", "Your medicine reminder has been created.");
    },
    onError: (e: Error) => toast.error("Failed to add reminder", e.message),
  });
}

export function useUpdateReminder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateReminderInput) =>
      api.put<{ data: ReminderWithLogs }>(`/api/reminders/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Reminder updated");
    },
    onError: (e: Error) => toast.error("Failed to update reminder", e.message),
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/reminders/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const prev = qc.getQueryData<ReminderWithLogs[]>(QUERY_KEY);
      qc.setQueryData(QUERY_KEY, (old: ReminderWithLogs[] | undefined) =>
        old?.filter((r) => r.id !== id) ?? []
      );
      return { prev };
    },
    onError: (e: Error, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEY, ctx.prev);
      toast.error("Failed to delete reminder", e.message);
    },
    onSuccess: () => toast.success("Reminder deleted"),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useLogDose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      reminderId,
      ...data
    }: {
      reminderId: string;
      scheduledAt: string;
      status: string;
      takenAt?: string;
      notes?: string;
    }) => api.post(`/api/reminders/${reminderId}/dose`, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      const label = vars.status === "TAKEN" ? "Dose marked as taken ✓" : `Dose marked as ${vars.status.toLowerCase()}`;
      toast.success(label);
    },
    onError: (e: Error) => toast.error("Failed to log dose", e.message),
  });
}

export function useSnoozeReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      reminderId,
      scheduledAt,
      snoozedUntil,
    }: {
      reminderId: string;
      scheduledAt: string;
      snoozedUntil: string;
    }) => api.post(`/api/reminders/${reminderId}/snooze`, { scheduledAt, snoozedUntil }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.info("Reminder snoozed for 15 minutes");
    },
    onError: (e: Error) => toast.error("Failed to snooze", e.message),
  });
}

export function useToggleReminderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/api/reminders/${id}`, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const prev = qc.getQueryData<ReminderWithLogs[]>(QUERY_KEY);
      qc.setQueryData(QUERY_KEY, (old: ReminderWithLogs[] | undefined) =>
        old?.map((r) => (r.id === id ? { ...r, status: status as MedicineReminder["status"] } : r)) ?? []
      );
      return { prev };
    },
    onError: (e: Error, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEY, ctx.prev);
      toast.error("Failed to update status", e.message);
    },
    onSuccess: (_data, vars) =>
      toast.success(`Reminder ${vars.status === "ACTIVE" ? "activated" : "paused"}`),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
