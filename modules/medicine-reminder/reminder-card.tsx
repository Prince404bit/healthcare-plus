"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useDeleteReminder, useToggleReminderStatus, useLogDose, useSnoozeReminder } from "@/hooks/use-reminders";
import { useBrowserNotifications } from "@/hooks/use-browser-notifications";
import { ReminderFormDialog } from "./reminder-form-dialog";
import { formatDate } from "@/utils/helpers";
import { Edit2, Trash2, CheckCircle, XCircle, Clock, Pause, Play } from "lucide-react";
import type { MedicineReminder, DoseLog } from "@prisma/client";

type ReminderWithLogs = MedicineReminder & { doseLogs: DoseLog[] };

type Props = { reminder: ReminderWithLogs };

const FREQ_LABELS: Record<string, string> = {
  ONCE: "Once", DAILY: "Daily", TWICE_DAILY: "2×/day",
  THREE_TIMES_DAILY: "3×/day", WEEKLY: "Weekly", CUSTOM: "Custom",
};

export function ReminderCard({ reminder }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const deleteMutation = useDeleteReminder();
  const toggleMutation = useToggleReminderStatus();
  const logDose = useLogDose();
  const snooze = useSnoozeReminder();
  const { notifyDose } = useBrowserNotifications();

  const isActive = reminder.status === "ACTIVE";
  const todayLogs = reminder.doseLogs.filter(
    (l) => new Date(l.scheduledAt).toDateString() === new Date().toDateString()
  );
  const takenToday = todayLogs.filter((l) => l.status === "TAKEN").length;

  async function handleTaken(time: string) {
    const scheduledAt = new Date();
    const [h, m] = time.split(":").map(Number);
    scheduledAt.setHours(h, m, 0, 0);
    await logDose.mutateAsync({
      reminderId: reminder.id,
      scheduledAt: scheduledAt.toISOString(),
      status: "TAKEN",
      takenAt: new Date().toISOString(),
    });
    notifyDose(reminder.medicineName, reminder.dosage, time);
  }

  async function handleMissed(time: string) {
    const scheduledAt = new Date();
    const [h, m] = time.split(":").map(Number);
    scheduledAt.setHours(h, m, 0, 0);
    await logDose.mutateAsync({
      reminderId: reminder.id,
      scheduledAt: scheduledAt.toISOString(),
      status: "MISSED",
    });
  }

  async function handleSnooze(time: string) {
    const scheduledAt = new Date();
    const [h, m] = time.split(":").map(Number);
    scheduledAt.setHours(h, m, 0, 0);
    const snoozedUntil = new Date(scheduledAt.getTime() + 15 * 60 * 1000);
    await snooze.mutateAsync({
      reminderId: reminder.id,
      scheduledAt: scheduledAt.toISOString(),
      snoozedUntil: snoozedUntil.toISOString(),
    });
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="h-1 w-full" style={{ backgroundColor: reminder.color ?? "#3b82f6" }} />
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate">{reminder.medicineName}</h3>
                <Badge variant={isActive ? "success" : "secondary"} className="text-xs">
                  {reminder.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {reminder.dosage} · {FREQ_LABELS[reminder.frequency]}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {reminder.times.join(", ")} · From {formatDate(reminder.startDate)}
                {reminder.endDate && ` to ${formatDate(reminder.endDate)}`}
              </p>
              {reminder.instructions && (
                <p className="text-xs text-muted-foreground mt-1 italic">{reminder.instructions}</p>
              )}
              {isActive && (
                <p className="text-xs font-medium text-green-600 mt-1">
                  {takenToday}/{reminder.times.length} taken today
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditOpen(true)}>
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost" size="icon" className="h-8 w-8"
                onClick={() => toggleMutation.mutate({ id: reminder.id, status: isActive ? "PAUSED" : "ACTIVE" })}
              >
                {isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
                    <AlertDialogDescription>
                      Delete the reminder for {reminder.medicineName}? This will also remove all dose logs.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate(reminder.id)} className="bg-destructive hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {isActive && (
            <div className="mt-3 flex flex-wrap gap-2">
              {reminder.times.map((time) => (
                <div key={time} className="flex items-center gap-1 rounded-lg border bg-muted/30 px-2 py-1">
                  <span className="text-xs font-medium">{time}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600 hover:text-green-700" onClick={() => handleTaken(time)} title="Mark taken">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={() => handleMissed(time)} title="Mark missed">
                    <XCircle className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-yellow-500 hover:text-yellow-600" onClick={() => handleSnooze(time)} title="Snooze 15 min">
                    <Clock className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ReminderFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editData={{ id: reminder.id, medicineName: reminder.medicineName, dosage: reminder.dosage, frequency: reminder.frequency, times: reminder.times, startDate: new Date(reminder.startDate).toISOString(), endDate: reminder.endDate ? new Date(reminder.endDate).toISOString() : undefined, instructions: reminder.instructions ?? undefined, color: reminder.color ?? undefined }}
      />
    </>
  );
}
