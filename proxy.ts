import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, getClientIp, rateLimitedResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { getToken } from "next-auth/jwt";
import type { Role } from "@prisma/client";

// Pages that don't require authentication
const PUBLIC_PAGES = ["/login", "/register", "/forgot-password", "/reset-password", "/"];

// API routes that don't require authentication
const PUBLIC_API_PATHS = [
  "/api/auth",               // all NextAuth routes
  "/api/auth/register",
  "/api/auth/register-patient",
  "/api/auth/register-doctor",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

// Auth API routes to rate limit more strictly
const AUTH_RATE_LIMIT_PATHS = [
  "/api/auth/register-patient",
  "/api/auth/register-doctor",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

const ROLE_PROTECTED: Record<string, Role[]> = {
  "/patient": ["PATIENT"],
  "/doctor": ["DOCTOR"],
  "/admin": ["ADMIN"],
};

const ROLE_REDIRECTS: Record<Role, string> = {
  PATIENT: "/patient/dashboard",
  DOCTOR: "/doctor/dashboard",
  ADMIN: "/admin/dashboard",
};

function secureResponse(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getClientIp(req);

  // Strict rate limit on auth mutation endpoints
  if (AUTH_RATE_LIMIT_PATHS.some((p) => pathname.startsWith(p))) {
    const result = checkRateLimit(`auth:${ip}`, RATE_LIMITS.auth);
    if (!result.allowed) return rateLimitedResponse(result.resetAt);
  }

  // General API rate limit
  if (pathname.startsWith("/api/") && !PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
    const result = checkRateLimit(`api:${ip}`, RATE_LIMITS.api);
    if (!result.allowed) return rateLimitedResponse(result.resetAt);
  }

  // Public API routes — no auth needed
  if (PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
    return secureResponse(NextResponse.next());
  }

  // Public pages — no auth needed
  const isPublicPage = PUBLIC_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isPublicPage) return secureResponse(NextResponse.next());

  // All other routes require authentication
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token?.sub) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as Role;

  // Role-based route protection
  for (const [prefix, allowedRoles] of Object.entries(ROLE_PROTECTED)) {
    if (pathname.startsWith(prefix) && !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL(ROLE_REDIRECTS[role], req.url));
    }
  }

  return secureResponse(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
