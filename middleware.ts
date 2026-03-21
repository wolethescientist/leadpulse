import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

// ── In-memory rate limiter ────────────────────────────────────────────────────
// Good enough for Vercel Hobby (single region). If you upgrade to Vercel Pro
// with multi-region, swap this for @upstash/ratelimit + @upstash/redis.

type Entry = { count: number; windowStart: number };
const store = new Map<string, Entry>();
const WINDOW_MS = 60_000;
const MAX = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX;
}

function pruneStore() {
  const now = Date.now();
  store.forEach((entry, ip) => {
    if (now - entry.windowStart > WINDOW_MS) store.delete(ip);
  });
}

const AUTH_ROUTES = ["/api/auth/signin", "/api/auth/signup"];

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/settings(.*)", "/billing(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const { pathname } = request.nextUrl;

  if (request.method === "POST" && AUTH_ROUTES.some((r) => pathname === r)) {
    pruneStore();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: { "Retry-After": "60", "Content-Type": "text/plain" },
      });
    }
  }

  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/sign-in");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
