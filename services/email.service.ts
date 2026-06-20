import { resend, FROM_EMAIL, APP_NAME } from "@/lib/resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type AppointmentEmailData = {
  to: string;
  patientName: string;
  doctorName: string;
  scheduledAt: Date;
  status: string;
};

type ReminderEmailData = {
  to: string;
  patientName: string;
  medicineName: string;
  dosage: string;
  time: string;
};

export const emailService = {
  async sendWelcomePatient(to: string, name: string) {
    return resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Welcome to ${APP_NAME} 🏥`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#3b82f6">Welcome to ${APP_NAME}, ${name}!</h2>
          <p>Your patient account has been created successfully.</p>
          <p>You can now:</p>
          <ul>
            <li>Book appointments with verified doctors</li>
            <li>Manage your medical records</li>
            <li>Set medicine reminders</li>
            <li>Track your dose adherence</li>
          </ul>
          <a href="${APP_URL}/login" style="display:inline-block;background:#3b82f6;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;margin-top:16px">Sign In</a>
          <p style="color:#6b7280;font-size:12px;margin-top:32px">© ${new Date().getFullYear()} ${APP_NAME}</p>
        </div>
      `,
    });
  },

  async sendWelcomeDoctor(to: string, name: string) {
    return resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Welcome to ${APP_NAME} — Doctor Account Created`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#3b82f6">Welcome, Dr. ${name}!</h2>
          <p>Your doctor account has been created and is <strong>pending verification</strong> by our admin team.</p>
          <p>You will receive an email once your account is verified and you can start accepting appointments.</p>
          <p style="color:#6b7280;font-size:12px;margin-top:32px">© ${new Date().getFullYear()} ${APP_NAME}</p>
        </div>
      `,
    });
  },

  async sendPasswordReset(to: string, name: string, rawToken: string) {
    const resetUrl = `${APP_URL}/reset-password?token=${rawToken}`;
    return resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Reset your ${APP_NAME} password`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#3b82f6">Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to set a new password.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;margin-top:8px">Reset Password</a>
          <p style="margin-top:16px;color:#6b7280;font-size:13px">This link expires in 2 hours. If you didn't request this, ignore this email.</p>
          <p style="color:#6b7280;font-size:12px;margin-top:32px">© ${new Date().getFullYear()} ${APP_NAME}</p>
        </div>
      `,
    });
  },

  async sendAppointmentConfirmation(data: AppointmentEmailData) {
    return resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: `Appointment ${data.status} — ${APP_NAME}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#3b82f6">Appointment ${data.status}</h2>
          <p>Dear ${data.patientName},</p>
          <p>Your appointment with Dr. ${data.doctorName} has been <strong>${data.status.toLowerCase()}</strong>.</p>
          <p><strong>Date & Time:</strong> ${data.scheduledAt.toLocaleString()}</p>
          <p style="color:#6b7280;font-size:12px;margin-top:32px">© ${new Date().getFullYear()} ${APP_NAME}</p>
        </div>
      `,
    });
  },

  async sendMedicineReminder(data: ReminderEmailData) {
    return resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: `Reminder: Take ${data.medicineName} — ${APP_NAME}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#3b82f6">Medicine Reminder</h2>
          <p>Dear ${data.patientName},</p>
          <p>Time to take your medicine:</p>
          <ul>
            <li><strong>Medicine:</strong> ${data.medicineName}</li>
            <li><strong>Dosage:</strong> ${data.dosage}</li>
            <li><strong>Time:</strong> ${data.time}</li>
          </ul>
          <p style="color:#6b7280;font-size:12px;margin-top:32px">© ${new Date().getFullYear()} ${APP_NAME}</p>
        </div>
      `,
    });
  },

  // backward compat alias
  async sendWelcome(to: string, name: string) {
    return this.sendWelcomePatient(to, name);
  },
};
