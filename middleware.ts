import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 🔹 arquivos públicos
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-icon") ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2?)$/)
  ) {
    return NextResponse.next()
  }

  // 🔹 rotas públicas
  if (pathname.startsWith("/auth")) {
    return NextResponse.next()
  }

  const token = req.cookies.get("token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf-8")
    )

    const role = payload.role

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    if (pathname.startsWith("/familiar") && role !== "FAMILIAR") {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    if (pathname.startsWith("/idoso") && role !== "IDOSO") {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
