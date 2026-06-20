import { prisma } from "@/lib/prisma";
import { reminderRepository } from "@/repositories/reminder.repository";
import { emailService } from "@/services/email.service";
import { addDays, startOfDay, endOfDay, parseISO, format } from "date-fns";

export const reminderService = {
  async generateScheduledDoses(reminderId: string, from: Date, to: Date) {
    const reminder = await reminderRepository.findById(reminderId);
    if (!reminder || reminder.status !== "ACTIVE") return [];

    const doses: { scheduledAt: Date }[] = [];
    let current = new Date(Math.max(from.getTime(), reminder.startDate.getTime()));
    const end = reminder.endDate ? new Date(Math.min(to.getTime(), reminder.endDate.getTime())) : to;

    while (current <= end) {
      for (const time of reminder.times) {
        const [hours, minutes] = time.split(":").map(Number);
        const scheduledAt = new Date(current);
        scheduledAt.setHours(hours, minutes, 0, 0);
        if (scheduledAt >= from && scheduledAt <= end) doses.push({ scheduledAt });
      }

      if (reminder.frequency === "ONCE") break;
      if (reminder.frequency === "WEEKLY") current = addDays(current, 7);
      else current = addDays(current, 1);
    }

    return doses;
  },

  async sendDueReminders() {
    const now = new Date();
    const activeReminders = await reminderRepository.findActive();

    for (const reminder of activeReminders) {
      const doses = await this.generateScheduledDoses(reminder.id, startOfDay(now), endOfDay(now));

      for (const dose of doses) {
        const diff = dose.scheduledAt.getTime() - now.getTime();
        if (diff > 0 && diff <= 15 * 60 * 1000) {
          // Within 15 min
          const existing = await prisma.doseLog.findFirst({
            where: {
              reminderId: reminder.id,
              scheduledAt: dose.scheduledAt,
            },
          });

          if (!existing) {
            await emailService
              .sendMedicineReminder({
                to: reminder.patient.user.email!,
                patientName: reminder.patient.user.name ?? "Patient",
                medicineName: reminder.medicineName,
                dosage: reminder.dosage,
                time: format(dose.scheduledAt, "h:mm a"),
              })
              .catch(() => {});
          }
        }
      }
    }
  },

  async markMissedDoses() {
    const now = new Date();
    const yesterday = addDays(now, -1);

    const activeReminders = await reminderRepository.findActive();

    for (const reminder of activeReminders) {
      const doses = await this.generateScheduledDoses(reminder.id, startOfDay(yesterday), endOfDay(yesterday));

      for (const dose of doses) {
        const existing = await prisma.doseLog.findFirst({
          where: { reminderId: reminder.id, scheduledAt: dose.scheduledAt },
        });

        if (!existing) {
          await reminderRepository.logDose(reminder.patientId, reminder.id, {
            scheduledAt: dose.scheduledAt,
            status: "MISSED",
          });
        }
      }
    }
  },
};
