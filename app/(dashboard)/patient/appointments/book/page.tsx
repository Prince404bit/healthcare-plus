"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDoctors, useDoctorSlots, useBookAppointment } from "@/hooks/use-appointments";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Spinner, FullPageSpinner } from "@/components/shared/spinner";
import { Search, Stethoscope, Calendar, Clock, ArrowLeft, CheckCircle } from "lucide-react";
import { getInitials, formatCurrency } from "@/utils/helpers";
import { addDays, format } from "date-fns";
import type { Metadata } from "next";

const SPECIALIZATIONS = [
  "All Specializations", "Cardiology", "Dermatology", "General Practice", "Gynecology",
  "Neurology", "Oncology", "Orthopedics", "Pediatrics", "Psychiatry", "Surgery",
];

type Doctor = {
  id: string;
  specialization: string;
  consultationFee: number | null;
  yearsExperience: number | null;
  isVerified: boolean;
  user: { name: string | null; email: string | null };
};

type Slot = { id: string; date: string; startTime: string; endTime: string };

export default function BookAppointmentPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [reason, setReason] = useState("");
  const [step, setStep] = useState<"browse" | "slots" | "confirm">("browse");

  const from = format(new Date(), "yyyy-MM-dd");
  const to = format(addDays(new Date(), 30), "yyyy-MM-dd");

  const { data: doctorsData, isLoading: loadingDoctors } = useDoctors(1, 100, specialization || undefined);
  const { data: slots, isLoading: loadingSlots } = useDoctorSlots(
    selectedDoctor?.id ?? "",
    new Date(from).toISOString(),
    new Date(to).toISOString()
  );
  const bookMutation = useBookAppointment();

  const doctors: Doctor[] = (doctorsData as { data?: Doctor[] } | undefined)?.data ?? [];
  const filtered = doctors.filter((d) =>
    !search || d.user.name?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleBook() {
    if (!selectedDoctor || !selectedSlot) return;
    await bookMutation.mutateAsync({
      doctorId: selectedDoctor.id,
      scheduledAt: new Date(`${selectedSlot.date}T${selectedSlot.startTime}`).toISOString(),
      duration: 30,
      reason: reason || undefined,
      slotId: selectedSlot.id,
    });
    router.push("/patient/appointments");
  }

  if (step === "confirm" && selectedDoctor && selectedSlot) {
    return (
      <div className="space-y-6 max-w-lg">
        <PageHeader title="Confirm Appointment" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                  {getInitials(selectedDoctor.user.name ?? "DR")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Dr. {selectedDoctor.user.name}</p>
                <p className="text-sm text-muted-foreground">{selectedDoctor.specialization}</p>
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{format(new Date(selectedSlot.date), "EEEE, MMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{selectedSlot.startTime} – {selectedSlot.endTime}</span>
              </div>
              {selectedDoctor.consultationFee && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-medium">{formatCurrency(Number(selectedDoctor.consultationFee))}</span>
                </div>
              )}
            </div>
            <FormField label="Reason for visit (optional)">
              <Textarea
                placeholder="Describe your symptoms or reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </FormField>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("slots")} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Button onClick={handleBook} disabled={bookMutation.isPending} className="flex-1">
                {bookMutation.isPending ? <Spinner size="sm" /> : <><CheckCircle className="h-4 w-4 mr-2" /> Confirm</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "slots" && selectedDoctor) {
    const slotList: Slot[] = (slots as Slot[] | undefined) ?? [];
    const grouped = slotList.reduce<Record<string, Slot[]>>((acc, s) => {
      const d = s.date.split("T")[0];
      if (!acc[d]) acc[d] = [];
      acc[d].push(s);
      return acc;
    }, {});

    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep("browse")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader title={`Available Slots — Dr. ${selectedDoctor.user.name}`} />
        </div>

        {loadingSlots ? (
          <FullPageSpinner />
        ) : slotList.length === 0 ? (
          <EmptyState icon={Calendar} title="No available slots" description="This doctor has no open slots in the next 30 days." />
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([date, daySlots]) => (
              <div key={date}>
                <p className="text-sm font-semibold mb-2">{format(new Date(date), "EEEE, MMMM d")}</p>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => { setSelectedSlot(slot); setStep("confirm"); }}
                      className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Book Appointment" description="Find a doctor and schedule your visit" />

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={specialization || "All Specializations"} onValueChange={(v) => setSpecialization(v === "All Specializations" ? "" : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Specialization" />
          </SelectTrigger>
          <SelectContent>
            {SPECIALIZATIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loadingDoctors ? (
        <FullPageSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No doctors found" description="Try adjusting your search or filter." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedDoctor(doctor); setStep("slots"); }}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                      {getInitials(doctor.user.name ?? "DR")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">Dr. {doctor.user.name}</p>
                      <StatusBadge status={doctor.isVerified ? "VERIFIED" : "UNVERIFIED"} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{doctor.specialization}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {doctor.yearsExperience && <span>{doctor.yearsExperience} yrs exp</span>}
                      {doctor.consultationFee && <span className="font-medium text-foreground">{formatCurrency(Number(doctor.consultationFee))}</span>}
                    </div>
                  </div>
                </div>
                <Button size="sm" className="w-full mt-4">
                  <Calendar className="h-3.5 w-3.5 mr-2" /> View Slots
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
