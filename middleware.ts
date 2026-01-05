import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/auth")) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
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
