import { NextRequest, NextResponse } from "next/server";
import { reminderService } from "@/services/reminder.service";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await reminderService.sendDueReminders();
    await reminderService.markMissedDoses();
    return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (e) {
    console.error("[Cron] Reminder job failed:", e);
    return NextResponse.json({ error: "Job failed" }, { status: 500 });
  }
}
