"use client";

import { useEffect, useCallback } from "react";

export function useBrowserNotifications() {
  const isSupported = typeof window !== "undefined" && "Notification" in window;

  const requestPermission = useCallback(async () => {
    if (!isSupported) return "denied";
    if (Notification.permission === "granted") return "granted";
    return Notification.requestPermission();
  }, [isSupported]);

  const notify = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported || Notification.permission !== "granted") return;
      const n = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
      setTimeout(() => n.close(), 8000);
      return n;
    },
    [isSupported]
  );

  const notifyDose = useCallback(
    (medicineName: string, dosage: string, time: string) => {
      notify(`💊 Time to take ${medicineName}`, {
        body: `${dosage} — scheduled at ${time}`,
        tag: `dose-${medicineName}-${time}`,
      });
    },
    [notify]
  );

  // Auto-request permission on mount
  useEffect(() => {
    if (isSupported && Notification.permission === "default") {
      requestPermission();
    }
  }, [isSupported, requestPermission]);

  return {
    isSupported,
    permission: isSupported ? Notification.permission : "denied",
    requestPermission,
    notify,
    notifyDose,
  };
}
