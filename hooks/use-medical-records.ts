"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";

const QUERY_KEY = ["medical-records"] as const;

export function useMedicalRecords(page = 1, pageSize = 20, type?: string) {
  const sp = type ? `&type=${type}` : "";
  return useQuery({
    queryKey: [...QUERY_KEY, page, pageSize, type],
    queryFn: () => api.get(`/api/medical-records?page=${page}&pageSize=${pageSize}${sp}`),
  });
}

export function useUploadRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ meta, file }: { meta: object; file?: File }) => {
      const formData = new FormData();
      formData.append("meta", JSON.stringify(meta));
      if (file) formData.append("file", file);
      return api.upload("/api/medical-records", formData);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Record uploaded", "Your medical record has been saved.");
    },
    onError: (e: Error) => toast.error("Upload failed", e.message),
  });
}

export function useDeleteRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/medical-records/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const prev = qc.getQueryData(QUERY_KEY);
      return { prev };
    },
    onError: (e: Error, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEY, ctx.prev);
      toast.error("Failed to delete record", e.message);
    },
    onSuccess: () => toast.success("Record deleted"),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useSignedRecordUrl(id: string, enabled = false) {
  return useQuery({
    queryKey: ["record-signed-url", id],
    queryFn: () =>
      api
        .get<{ data: { signedUrl?: string } }>(`/api/medical-records/${id}?signed=true`)
        .then((r) => r.data?.signedUrl),
    enabled,
    staleTime: 50 * 60_000,
    meta: { silent: true },
  });
}
