import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Public admin pages that don't require a session
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

export async function proxy(request: Request) {
  const { pathname } = new URL(request.url);

  // Allow public admin auth pages without session
  if (PUBLIC_ADMIN_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Protect all other /admin routes
  const session = await auth.api.getSession({
    headers: request.headers as any,
  });

  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
