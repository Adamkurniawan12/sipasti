import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ambil token auth session dari cookies
  // NextAuth v5 session token cookie names
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  const isAuthPage = pathname.startsWith("/login");
  const isProtectedPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/wilayah") ||
    pathname.startsWith("/hspw") ||
    pathname.startsWith("/validasi") ||
    pathname.startsWith("/laporan") ||
    pathname.startsWith("/profile");

  if (isProtectedPage && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/wilayah/:path*",
    "/hspw/:path*",
    "/validasi/:path*",
    "/laporan/:path*",
    "/profile/:path*",
    "/login",
  ],
};

