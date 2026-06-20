"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/shared/spinner";
import { Plus, X } from "lucide-react";
import { format, addDays } from "date-fns";

type Props = { doctorId: string };

export function ManageSlotsForm({ doctorId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [slotDuration, setSlotDuration] = useState(30);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  const today = format(new Date(), "yyyy-MM-dd");
  const maxDate = format(addDays(new Date(), 60), "yyyy-MM-dd");

  function toggleDate(date: string) {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedDates.length === 0) {
      toast.warning("Select at least one date");
      return;
    }
    setLoading(true);
    try {
      const result = await api.post<{ data: { count: number } }>(
        `/api/doctors/${doctorId}/slots`,
        { dates: selectedDates, startTime, endTime, slotDuration }
      );
      toast.success(`Created ${result.data.count} slots`);
      setSelectedDates([]);
      router.refresh();
    } catch (e: unknown) {
      toast.error("Failed to create slots", e instanceof Error ? e.message : undefined);
    } finally {
      setLoading(false);
    }
  }

  // Generate next 14 days for quick selection
  const nextDays = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i + 1);
    return { value: format(d, "yyyy-MM-dd"), label: format(d, "EEE d") };
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Create New Slots</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Start Time" required>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </FormField>
            <FormField label="End Time" required>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </FormField>
            <FormField label="Slot Duration (min)" required>
              <Input
                type="number"
                min={15}
                max={120}
                step={15}
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
              />
            </FormField>
          </div>

          <FormField label="Select Dates">
            <div className="flex flex-wrap gap-2 mt-1">
              {nextDays.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDate(d.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedDates.includes(d.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {selectedDates.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {selectedDates.length} date{selectedDates.length > 1 ? "s" : ""} selected
              </p>
            )}
          </FormField>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading || selectedDates.length === 0}>
              {loading ? <Spinner size="sm" /> : <><Plus className="h-4 w-4 mr-2" /> Create Slots</>}
            </Button>
            {selectedDates.length > 0 && (
              <Button type="button" variant="ghost" onClick={() => setSelectedDates([])}>
                <X className="h-4 w-4 mr-2" /> Clear
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
