"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/helpers";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard, Calendar, FileText, Bell, BarChart2,
  Users, UserCheck, Settings, ChevronLeft, ChevronRight,
  Stethoscope, Pill, ClipboardList, ShieldCheck,
} from "lucide-react";
import type { Role } from "@prisma/client";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
};

const NAV_ITEMS: Record<Role, NavItem[]> = {
  PATIENT: [
    { label: "Overview", href: "/patient/dashboard", icon: LayoutDashboard },
    { label: "Appointments", href: "/patient/appointments", icon: Calendar },
    { label: "Medicines", href: "/patient/medicines", icon: Pill },
    { label: "Medical Records", href: "/patient/records", icon: FileText },
    { label: "Analytics", href: "/patient/analytics", icon: BarChart2 },
  ],
  DOCTOR: [
    { label: "Overview", href: "/doctor/dashboard", icon: LayoutDashboard },
    { label: "Appointments", href: "/doctor/appointments", icon: Calendar },
    { label: "My Patients", href: "/doctor/patients", icon: Users },
    { label: "Records", href: "/doctor/records", icon: ClipboardList },
    { label: "Availability", href: "/doctor/slots", icon: Bell },
    { label: "Profile", href: "/doctor/profile", icon: UserCheck },
  ],
  ADMIN: [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Doctors", href: "/admin/doctors", icon: UserCheck },
    { label: "Appointments", href: "/admin/appointments", icon: Calendar },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
    { label: "System", href: "/admin/system", icon: ShieldCheck },
  ],
};

const ROLE_ACCENT: Record<Role, string> = {
  PATIENT: "from-blue-600 to-indigo-600",
  DOCTOR: "from-emerald-600 to-teal-600",
  ADMIN: "from-violet-600 to-purple-600",
};

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const items = NAV_ITEMS[role];

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-card transition-all duration-300 ease-in-out shrink-0",
        sidebarOpen ? "w-60" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br", ROLE_ACCENT[role])}>
          <Stethoscope className="h-4.5 w-4.5 text-white" />
        </div>
        {sidebarOpen && (
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-bold leading-none">HealthCare+</p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{role.toLowerCase()} portal</p>
          </div>
        )}
        <Button
          variant="ghost" size="icon"
          onClick={toggleSidebar}
          className="ml-auto h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 pt-3 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!sidebarOpen ? item.label : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0 transition-transform", active && "scale-110")} />
              {sidebarOpen && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {sidebarOpen && item.badge && (
                <span className={cn(
                  "ml-auto rounded-full px-1.5 py-0.5 text-xs font-semibold",
                  active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Separator />
      <div className="p-2">
        <Link
          href="/settings"
          title={!sidebarOpen ? "Settings" : undefined}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Settings className="h-4 w-4 shrink-0" />
          {sidebarOpen && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
