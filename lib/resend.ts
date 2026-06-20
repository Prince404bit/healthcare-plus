import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      // Return a no-op client during build/test
      return { emails: { send: async () => ({ data: null, error: null }) } } as unknown as Resend;
    }
    _resend = new Resend(key);
  }
  return _resend;
}

export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    return (getResend() as unknown as Record<string, unknown>)[prop as string];
  },
});

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@healthcare.app";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "HealthCare+";
