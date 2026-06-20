import { create } from "zustand";
import type { UserWithRole } from "@/types";

type AppStore = {
  user: UserWithRole | null;
  setUser: (user: UserWithRole | null) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
};

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
