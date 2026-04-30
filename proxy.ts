import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_IDLE_COOKIE,
  ADMIN_IDLE_LIMIT_MS,
  ADMIN_LOGIN_PATH,
} from "@/lib/adminSession";

const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

const applySecurityHeaders = (response: NextResponse) => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
};

const isExpiredAdminActivity = (value: string | undefined) => {
  if (!value) return true;

  const lastActivity = Number(value);

  if (Number.isNaN(lastActivity)) {
    return true;
  }

  return Date.now() - lastActivity > ADMIN_IDLE_LIMIT_MS;
};

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginRoute = pathname === ADMIN_LOGIN_PATH;
  const isExpired = isExpiredAdminActivity(req.cookies.get(ADMIN_IDLE_COOKIE)?.value);

  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    isAdmin = profile?.role === "admin";
  }

  if (user && isExpired) {
    await supabase.auth.signOut();

    const redirectResponse = NextResponse.redirect(
      new URL(`${ADMIN_LOGIN_PATH}?reason=expired`, req.url)
    );

    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    redirectResponse.cookies.delete(ADMIN_IDLE_COOKIE);
    applySecurityHeaders(redirectResponse);
    return redirectResponse;
  }

  if (!isLoginRoute && (!user || !isAdmin)) {
    const redirectResponse = NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, req.url));
    redirectResponse.cookies.delete(ADMIN_IDLE_COOKIE);
    applySecurityHeaders(redirectResponse);
    return redirectResponse;
  }

  if (isLoginRoute && user && isAdmin && !isExpired) {
    const redirectResponse = NextResponse.redirect(new URL("/admin", req.url));
    applySecurityHeaders(redirectResponse);
    return redirectResponse;
  }

  applySecurityHeaders(response);
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
