"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import type { Role } from "@prisma/client";

type DashboardLayoutProps = {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: Role;
  };
};

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header user={user} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-6"
          aria-label="Main content"
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
