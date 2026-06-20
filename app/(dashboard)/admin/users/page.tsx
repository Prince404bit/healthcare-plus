import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminUserActions } from "@/modules/admin/admin-user-actions";
import { getInitials, formatDate } from "@/utils/helpers";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const patients = users.filter((u) => u.role === "PATIENT");
  const doctors = users.filter((u) => u.role === "DOCTOR");
  const admins = users.filter((u) => u.role === "ADMIN");

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description={`${users.length} registered users`} />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({users.length})</TabsTrigger>
          <TabsTrigger value="patients">Patients ({patients.length})</TabsTrigger>
          <TabsTrigger value="doctors">Doctors ({doctors.length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
        </TabsList>

        {[
          { key: "all", items: users },
          { key: "patients", items: patients },
          { key: "doctors", items: doctors },
          { key: "admins", items: admins },
        ].map(({ key, items }) => (
          <TabsContent key={key} value={key} className="mt-4 space-y-2">
            {items.map((u) => (
              <Card key={u.id} className={!u.isActive ? "opacity-60" : ""}>
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {getInitials(u.name ?? u.email ?? "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{u.name ?? "—"}</p>
                      <StatusBadge status={u.role} />
                      {!u.isActive && <StatusBadge status="SUSPENDED" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{u.email} · Joined {formatDate(u.createdAt)}</p>
                  </div>
                  {u.role !== "ADMIN" && (
                    <AdminUserActions userId={u.id} isActive={u.isActive} />
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
