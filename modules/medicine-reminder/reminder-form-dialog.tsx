"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createReminderSchema, type CreateReminderInput } from "@/lib/validations";
import { useCreateReminder, useUpdateReminder } from "@/hooks/use-reminders";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/shared/spinner";
import { Plus, X } from "lucide-react";

const FREQUENCIES = [
  { value: "ONCE", label: "Once" },
  { value: "DAILY", label: "Daily" },
  { value: "TWICE_DAILY", label: "Twice Daily" },
  { value: "THREE_TIMES_DAILY", label: "Three Times Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "CUSTOM", label: "Custom" },
];

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

type Props = {
  open: boolean;
  onClose: () => void;
  editData?: Partial<CreateReminderInput> & { id?: string };
};

export function ReminderFormDialog({ open, onClose, editData }: Props) {
  const isEdit = !!editData?.id;
  const createMutation = useCreateReminder();
  const updateMutation = useUpdateReminder(editData?.id ?? "");
  const [times, setTimes] = useState<string[]>(editData?.times ?? ["08:00"]);
  const [selectedColor, setSelectedColor] = useState(editData?.color ?? COLORS[0]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateReminderInput>({
    resolver: zodResolver(createReminderSchema) as never,
    defaultValues: {
      frequency: "DAILY",
      times: ["08:00"],
      ...editData,
      startDate: editData?.startDate ? new Date(editData.startDate).toISOString() : new Date().toISOString(),
      endDate: editData?.endDate ? new Date(editData.endDate).toISOString() : undefined,
    },
  });

  useEffect(() => {
    if (open) {
      setTimes(editData?.times ?? ["08:00"]);
      setSelectedColor(editData?.color ?? COLORS[0]);
      reset({ frequency: "DAILY", times: ["08:00"], startDate: new Date().toISOString(), ...editData });
    }
  }, [open, editData, reset]);

  function addTime() {
    const updated = [...times, "12:00"];
    setTimes(updated);
    setValue("times", updated);
  }

  function removeTime(i: number) {
    const updated = times.filter((_, idx) => idx !== i);
    setTimes(updated);
    setValue("times", updated);
  }

  function updateTime(i: number, val: string) {
    const updated = times.map((t, idx) => (idx === i ? val : t));
    setTimes(updated);
    setValue("times", updated);
  }

  async function onSubmit(data: CreateReminderInput) {
    const payload = { ...data, times, color: selectedColor };
    if (isEdit) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Reminder" : "Add Medicine Reminder"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Medicine Name" error={errors.medicineName?.message} required className="col-span-2">
              <Input placeholder="e.g. Metformin" {...register("medicineName")} />
            </FormField>

            <FormField label="Dosage" error={errors.dosage?.message} required>
              <Input placeholder="e.g. 500mg" {...register("dosage")} />
            </FormField>

            <FormField label="Frequency" error={errors.frequency?.message} required>
              <Select defaultValue={editData?.frequency ?? "DAILY"} onValueChange={(v) => setValue("frequency", v as CreateReminderInput["frequency"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Start Date" error={errors.startDate?.message} required>
              <Input type="date" defaultValue={editData?.startDate ? new Date(editData.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}
                onChange={(e) => setValue("startDate", new Date(e.target.value).toISOString())} />
            </FormField>

            <FormField label="End Date" error={errors.endDate?.message}>
              <Input type="date" defaultValue={editData?.endDate ? new Date(editData.endDate).toISOString().split("T")[0] : undefined}
                onChange={(e) => setValue("endDate", e.target.value ? new Date(e.target.value).toISOString() : undefined)} />
            </FormField>
          </div>

          <FormField label="Reminder Times" error={errors.times?.message} required>
            <div className="space-y-2">
              {times.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input type="time" value={t} onChange={(e) => updateTime(i, e.target.value)} className="flex-1" />
                  {times.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeTime(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addTime} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Add Time
              </Button>
            </div>
          </FormField>

          <FormField label="Color">
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setSelectedColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${selectedColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </FormField>

          <FormField label="Instructions">
            <Textarea placeholder="Take with food, avoid alcohol..." {...register("instructions")} rows={2} />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner size="sm" /> : isEdit ? "Save Changes" : "Add Reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
