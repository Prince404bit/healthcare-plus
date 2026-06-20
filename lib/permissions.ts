import type { Role } from "@prisma/client";

type Permission =
  | "appointment:create"
  | "appointment:read:own"
  | "appointment:read:all"
  | "appointment:update:own"
  | "appointment:update:any"
  | "appointment:cancel:own"
  | "appointment:cancel:any"
  | "record:create"
  | "record:read:own"
  | "record:read:assigned"
  | "record:read:all"
  | "record:upload"
  | "reminder:create"
  | "reminder:read:own"
  | "reminder:update:own"
  | "dose:log"
  | "dose:read:own"
  | "dose:read:all"
  | "patient:read:own"
  | "patient:read:all"
  | "patient:update:own"
  | "doctor:read:all"
  | "doctor:verify"
  | "doctor:update:own"
  | "user:manage"
  | "analytics:own"
  | "analytics:all";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  PATIENT: [
    "appointment:create",
    "appointment:read:own",
    "appointment:update:own",
    "appointment:cancel:own",
    "record:read:own",
    "record:upload",
    "reminder:create",
    "reminder:read:own",
    "reminder:update:own",
    "dose:log",
    "dose:read:own",
    "patient:read:own",
    "patient:update:own",
    "doctor:read:all",
    "analytics:own",
  ],
  DOCTOR: [
    "appointment:read:all",
    "appointment:update:any",
    "appointment:cancel:any",
    "record:create",
    "record:read:assigned",
    "record:upload",
    "dose:read:all",
    "patient:read:all",
    "doctor:read:all",
    "doctor:update:own",
    "analytics:own",
  ],
  ADMIN: [
    "appointment:read:all",
    "appointment:update:any",
    "appointment:cancel:any",
    "record:read:all",
    "dose:read:all",
    "patient:read:all",
    "doctor:read:all",
    "doctor:verify",
    "user:manage",
    "analytics:all",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export const ROLE_REDIRECTS: Record<Role, string> = {
  PATIENT: "/patient/dashboard",
  DOCTOR: "/doctor/dashboard",
  ADMIN: "/admin/dashboard",
};
