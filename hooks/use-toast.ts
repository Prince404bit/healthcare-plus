"use client";

import { create } from "zustand";

export type ToastVariant = "default" | "destructive" | "success" | "warning";

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastStore = {
  toasts: Toast[];
  add: (t: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

let count = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add(input) {
    const id = String(++count);
    const toast: Toast = { id, duration: 5000, ...input };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), toast.duration);
    }
    return id;
  },
  dismiss(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
  dismissAll() {
    set({ toasts: [] });
  },
}));

// Imperative helper — usable outside React components
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().add({ title, description, variant: "success" }),
  error: (title: string, description?: string) =>
    useToastStore.getState().add({ title, description, variant: "destructive" }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().add({ title, description, variant: "warning" }),
  info: (title: string, description?: string) =>
    useToastStore.getState().add({ title, description, variant: "default" }),
};

// Hook alias
export function useToast() {
  const { toasts, add, dismiss, dismissAll } = useToastStore();
  return {
    toasts,
    dismiss,
    dismissAll,
    toast: {
      success: (title: string, description?: string) => add({ title, description, variant: "success" }),
      error: (title: string, description?: string) => add({ title, description, variant: "destructive" }),
      warning: (title: string, description?: string) => add({ title, description, variant: "warning" }),
      info: (title: string, description?: string) => add({ title, description, variant: "default" }),
    },
  };
}
