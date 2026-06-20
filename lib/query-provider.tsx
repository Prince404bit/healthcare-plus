"use client";

import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError(error, query) {
        if (query.meta?.silent) return;
        const msg = error instanceof Error ? error.message : "Failed to load data";
        toast.error("Load failed", msg);
      },
    }),
    mutationCache: new MutationCache({
      onError(error, _vars, _ctx, mutation) {
        if (mutation.meta?.silent) return;
        const msg = error instanceof Error ? error.message : "Operation failed";
        toast.error("Error", msg);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry(failureCount, error) {
          // Don't retry 4xx errors
          if (error instanceof Error && error.message.includes("4")) return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(getQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
