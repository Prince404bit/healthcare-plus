import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { PatientRegisterInput, DoctorRegisterInput } from "@/lib/validations";

const RESET_TOKEN_EXPIRY_HOURS = 2;

export const authService = {
  async registerPatient(data: PatientRegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error("EMAIL_EXISTS");

    const hashed = await bcrypt.hash(data.password, 12);

    const allergiesList = data.allergies
      ? data.allergies.split(",").map((a) => a.trim()).filter(Boolean)
      : [];

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        password: hashed,
        role: "PATIENT",
        patient: {
          create: {
            gender: data.gender,
            bloodGroup: data.bloodGroup,
            allergies: allergiesList,
            emergencyContactName: data.emergencyContactName,
            emergencyContactPhone: data.emergencyContactPhone,
          },
        },
      },
      include: { patient: true },
    });

    return user;
  },

  async registerDoctor(data: DoctorRegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error("EMAIL_EXISTS");

    const licenseExists = await prisma.doctor.findUnique({
      where: { licenseNumber: data.licenseNumber },
    });
    if (licenseExists) throw new Error("LICENSE_EXISTS");

    const hashed = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        password: hashed,
        role: "DOCTOR",
        doctor: {
          create: {
            specialization: data.specialization,
            qualification: data.qualification,
            licenseNumber: data.licenseNumber,
            yearsExperience: data.yearsExperience,
            consultationFee: data.consultationFee,
            clinicName: data.clinicName,
            clinicAddress: data.clinicAddress,
            phone: data.phone,
            bio: data.bio,
          },
        },
      },
      include: { doctor: true },
    });

    return user;
  },

  async createPasswordResetToken(email: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return null; // silent — don't reveal if email exists

    // Invalidate existing tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expires: new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
      },
    });

    return { user, rawToken };
  },

  async resetPassword(rawToken: string, newPassword: string) {
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const record = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!record) throw new Error("INVALID_TOKEN");
    if (record.used) throw new Error("TOKEN_USED");
    if (record.expires < new Date()) throw new Error("TOKEN_EXPIRED");

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);

    return record.user;
  },
};
