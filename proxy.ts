import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow auth API routes, login page, dan fail statik (logo, ikon, dll.)
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(png|jpe?g|svg|gif|webp|ico|txt|xml|json|woff2?)$/i.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Check for session cookie (next-auth v5 uses "authjs.session-token")
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value

  // Guru penuh — akses semua
  if (sessionToken) {
    return NextResponse.next()
  }

  // Tetamu — hanya benarkan lihat dashboard
  const isGuest = request.cookies.get("guest")?.value === "1"
  if (isGuest) {
    if (pathname === "/dashboard") {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.redirect(new URL("/login", request.url))
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
