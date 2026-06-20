"use client";

import { useState } from "react";
import { useReminders } from "@/hooks/use-reminders";
import { ReminderCard } from "@/modules/medicine-reminder/reminder-card";
import { ReminderFormDialog } from "@/modules/medicine-reminder/reminder-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FullPageSpinner } from "@/components/shared/spinner";
import { Bell, Plus, CheckCircle, XCircle, Activity } from "lucide-react";
import { calculateAdherenceRate } from "@/utils/helpers";
import type { MedicineReminder, DoseLog } from "@prisma/client";

type ReminderWithLogs = MedicineReminder & { doseLogs: DoseLog[] };

export default function MedicinesPage() {
  const [addOpen, setAddOpen] = useState(false);
  const { data: reminders, isLoading } = useReminders();

  if (isLoading) return <FullPageSpinner />;

  const all: ReminderWithLogs[] = reminders ?? [];
  const active = all.filter((r) => r.status === "ACTIVE");
  const paused = all.filter((r) => r.status === "PAUSED");
  const completed = all.filter((r) => r.status === "COMPLETED" || r.status === "EXPIRED");

  const allLogs = all.flatMap((r) => r.doseLogs);
  const taken = allLogs.filter((l) => l.status === "TAKEN").length;
  const missed = allLogs.filter((l) => l.status === "MISSED").length;
  const adherence = calculateAdherenceRate(taken, taken + missed);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicine Reminders"
        description="Manage your medications and track doses"
        action={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Medicine
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Active Reminders" value={active.length} icon={Bell} />
        <StatCard title="Doses Taken" value={taken} icon={CheckCircle} description="All time" />
        <StatCard title="Adherence Rate" value={`${adherence}%`} icon={Activity} description="Taken vs missed" />
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({paused.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        {[
          { value: "active", items: active },
          { value: "paused", items: paused },
          { value: "completed", items: completed },
        ].map(({ value, items }) => (
          <TabsContent key={value} value={value} className="mt-4 space-y-3">
            {items.length === 0 ? (
              <EmptyState
                icon={Bell}
                title={`No ${value} reminders`}
                description={value === "active" ? "Add a medicine reminder to get started." : undefined}
                action={value === "active" ? <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Medicine</Button> : undefined}
              />
            ) : (
              items.map((r) => <ReminderCard key={r.id} reminder={r} />)
            )}
          </TabsContent>
        ))}
      </Tabs>

      <ReminderFormDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
