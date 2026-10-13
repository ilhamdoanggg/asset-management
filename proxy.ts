import { NextResponse, type NextRequest } from "next/server";
import {
  PROTECTED_ROUTES,
  AUTH_ROUTES,
  COOKIES,
  LOCALES,
  DEFAULT_LOCALE,
} from "@/lib/constants";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(COOKIES.SESSION)?.value;
  const cookieLocale = request.cookies.get(COOKIES.LOCALE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;

  // Ignore internal/api paths
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Check if pathname has a locale prefix
  const pathnameHasLocale = LOCALES.some(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
  );

  // Redirect to localized path if missing locale prefix
  if (!pathnameHasLocale) {
    const targetUrl = new URL(
      `/${locale}${pathname === "/" ? "" : pathname}`,
      request.url
    );
    return NextResponse.redirect(targetUrl);
  }

  // Extract route path without locale prefix (e.g. /id/login -> /login)
  const currentLocale = pathname.split("/")[1];
  const subpath = pathname.replace(new RegExp(`^/${currentLocale}`), "") || "/";

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    subpath.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => subpath.startsWith(route));

  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL(`/${currentLocale}/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", subpath);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
