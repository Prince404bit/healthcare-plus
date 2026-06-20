import Link from "next/link";
import { Stethoscope, Heart, Shield, Clock } from "lucide-react";

const FEATURES = [
  { icon: Heart, text: "Track your health in one place" },
  { icon: Shield, text: "Secure & private medical records" },
  { icon: Clock, text: "24/7 medicine reminders" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 left-1/4 w-64 h-64 rounded-full bg-white/5" />
        </div>

        <div className="relative flex flex-col h-full p-10 text-white">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">HealthCare+</span>
          </Link>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Your health,<br />
              <span className="text-blue-200">managed smarter.</span>
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed mb-10">
              A complete healthcare platform for patients and doctors — appointments, records, reminders, and analytics.
            </p>

            <div className="space-y-4">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-blue-50 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-5 border border-white/10">
            <p className="text-sm text-blue-50 leading-relaxed italic">
              "HealthCare+ transformed how I manage my patients. Everything I need is in one place."
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold">
                DR
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Dr. Riya Sharma</p>
                <p className="text-xs text-blue-200">Cardiologist</p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-blue-300">
            © {new Date().getFullYear()} HealthCare+. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-primary">HealthCare+</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
