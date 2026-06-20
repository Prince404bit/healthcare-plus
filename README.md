# HealthCare+ | Smart Healthcare Management System

Production-ready web-based healthcare management platform built with Next.js 15, TypeScript, Prisma, and PostgreSQL.

## 🎯 Features (Phase 1)

- **Patient Panel**: Dashboard, appointments, medical records, medicine reminders, dose analytics
- **Doctor Panel**: Dashboard, appointments, patient management, medical records
- **Admin Panel**: User management, doctor verification, system analytics
- **Medicine Reminder System**: Schedule medications with custom frequencies
- **Dose Tracking Analytics**: Adherence rates, daily tracking, visual charts
- **Medical Records Management**: Upload, view, and manage medical documents
- **Doctor Appointment Booking**: Schedule, confirm, cancel appointments

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **TailwindCSS v4**
- **shadcn/ui** (Radix UI components)
- **React Query** (data fetching)
- **Zustand** (state management)
- **Recharts** (analytics charts)
- **React Hook Form** + **Zod** (forms & validation)

### Backend
- **Next.js API Routes**
- **Prisma ORM**
- **PostgreSQL**
- **NextAuth v5** (authentication)
- **Supabase Storage** (file uploads)
- **Resend** (email notifications)

## 📁 Project Structure

```
medical/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, register)
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── patient/              # Patient panel
│   │   ├── doctor/               # Doctor panel
│   │   └── admin/                # Admin panel
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication
│   │   ├── patients/             # Patient endpoints
│   │   ├── doctors/              # Doctor endpoints
│   │   ├── appointments/         # Appointment endpoints
│   │   ├── medical-records/      # Medical records endpoints
│   │   ├── reminders/            # Medicine reminder endpoints
│   │   └── analytics/            # Analytics endpoints
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Root page (redirect)
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Layout components (sidebar, header)
│   └── shared/                   # Shared components (stat-card, page-header)
├── modules/                      # Feature modules
│   └── analytics/                # Analytics charts
├── lib/                          # Core libraries
│   ├── auth.ts                   # NextAuth config
│   ├── prisma.ts                 # Prisma client
│   ├── permissions.ts            # RBAC permissions
│   ├── validations.ts            # Zod schemas
│   ├── supabase.ts               # Supabase client
│   ├── resend.ts                 # Email client
│   ├── store.ts                  # Zustand store
│   └── query-provider.tsx        # React Query provider
├── repositories/                 # Data access layer
│   ├── patient.repository.ts
│   ├── doctor.repository.ts
│   ├── appointment.repository.ts
│   ├── medical-record.repository.ts
│   └── reminder.repository.ts
├── services/                     # Business logic layer
│   ├── auth.service.ts
│   ├── storage.service.ts
│   ├── email.service.ts
│   └── analytics.service.ts
├── types/                        # TypeScript types
│   ├── index.ts                  # Domain types
│   └── next-auth.d.ts            # NextAuth type augmentation
├── utils/                        # Utility functions
│   ├── api-response.ts           # API response helpers
│   └── helpers.ts                # General utilities
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seeder
├── middleware.ts                 # Route protection middleware
└── prisma.config.ts              # Prisma 7 config
```

## 🗄️ Database Schema

### Core Models
- **User**: Base user with role (PATIENT, DOCTOR, ADMIN)
- **Patient**: Patient profile with medical info
- **Doctor**: Doctor profile with specialization, license
- **Admin**: Admin profile

### Feature Models
- **Appointment**: Doctor-patient appointments with status tracking
- **MedicalRecord**: Medical documents with file storage
- **MedicineReminder**: Medication schedules with frequencies
- **DoseLog**: Individual dose tracking (taken/missed/skipped)
- **Notification**: Email/browser notifications

## 🔐 RBAC Permissions

### Patient
- Create/view/cancel own appointments
- View/upload own medical records
- Create/manage medicine reminders
- Log doses and view analytics
- View all doctors

### Doctor
- View all appointments
- Confirm/complete/cancel appointments
- Create medical records for patients
- View assigned patients
- View own analytics

### Admin
- View all users, doctors, patients
- Verify doctors
- View system-wide analytics
- Manage users

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Supabase account (for file storage)
- Resend account (for emails)

### 1. Clone & Install

```bash
cd medical
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/healthcare_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="medical-records"

# Resend
RESEND_API_KEY="re_your_api_key"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="HealthCare+"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial admin user
npm run db:seed
```

**Default Admin Credentials:**
- Email: `admin@healthcare.app`
- Password: `Admin@123456`

### 4. Supabase Storage Setup

1. Create a bucket named `medical-records` in Supabase Storage
2. Set bucket to **private** (authenticated access only)
3. Add RLS policies for authenticated users

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Patients
- `GET /api/patients` - List patients (admin)
- `PUT /api/patients` - Update patient profile
- `GET /api/patients/[id]` - Get patient by ID

### Doctors
- `GET /api/doctors` - List doctors
- `PUT /api/doctors` - Update doctor profile
- `PATCH /api/doctors/[id]` - Verify doctor (admin)

### Appointments
- `GET /api/appointments` - List appointments (filtered by role)
- `POST /api/appointments` - Create appointment (patient)
- `PATCH /api/appointments/[id]` - Update appointment status

### Medical Records
- `GET /api/medical-records` - List records
- `POST /api/medical-records` - Upload record (with file)
- `DELETE /api/medical-records/[id]` - Delete record

### Medicine Reminders
- `GET /api/reminders` - List reminders (patient)
- `POST /api/reminders` - Create reminder
- `PATCH /api/reminders/[id]` - Update reminder status
- `POST /api/reminders/[id]/dose` - Log dose

### Analytics
- `GET /api/analytics/patient` - Patient adherence stats
- `GET /api/analytics/doctor` - Doctor stats
- `GET /api/analytics/admin` - System-wide stats

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#22c55e)
- **Warning**: Yellow (#f59e0b)
- **Destructive**: Red (#ef4444)
- **Info**: Blue (#3b82f6)

### Components
All UI components follow shadcn/ui patterns with Radix UI primitives.

## 🔧 Development Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:push      # Push schema to DB
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database
- Use Vercel Postgres, Supabase Postgres, or any PostgreSQL provider
- Run migrations: `npm run db:push`
- Seed admin: `npm run db:seed`

### Storage
- Supabase Storage is production-ready
- Ensure bucket policies are configured

## 📊 Future Enhancements (Phase 2+)

- SOS ambulance module
- Live tracking
- Payment integration
- SMS/WhatsApp notifications
- Video consultations
- Lab test integration
- Prescription management
- Insurance claims

## 🤝 Contributing

This is a production-grade foundation. Follow clean architecture principles:
- Keep repositories focused on data access
- Keep services focused on business logic
- Keep API routes thin (delegate to services)
- Use TypeScript strictly
- Write reusable components

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
