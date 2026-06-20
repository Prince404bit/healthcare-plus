import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { doctorRepository } from "@/repositories/doctor.repository";
import { slotRepository } from "@/repositories/slot.repository";
import { PageHeader } from "@/components/shared/page-header";
import { ManageSlotsForm } from "@/modules/doctor/manage-slots-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format, addDays } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Availability" };

export default async function DoctorSlotsPage() {
  const session = await auth();
  if (!session || session.user.role !== "DOCTOR") redirect("/login");

  const doctor = await doctorRepository.findByUserId(session.user.id);
  if (!doctor) redirect("/doctor/profile");

  const from = new Date();
  const to = addDays(from, 14);
  const slots = await slotRepository.findByDoctor(doctor.id, from, to);

  const grouped = slots.reduce<Record<string, typeof slots>>((acc, s) => {
    const d = format(new Date(s.date), "yyyy-MM-dd");
    if (!acc[d]) acc[d] = [];
    acc[d].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Availability Management"
        description="Create and manage your appointment slots"
      />

      <ManageSlotsForm doctorId={doctor.id} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Upcoming Slots (Next 14 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(grouped).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No slots created yet. Use the form above to add availability.
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([date, daySlots]) => (
                <div key={date}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {format(new Date(date), "EEEE, MMMM d")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((slot) => (
                      <Badge
                        key={slot.id}
                        variant={slot.isBooked ? "default" : "outline"}
                        className="text-xs"
                      >
                        {slot.startTime} – {slot.endTime}
                        {slot.isBooked && " · Booked"}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
