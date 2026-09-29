import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, isValidSession } from '@/lib/admin-session'

export function proxy(request: NextRequest) {
  // Protect /dashboard route
  if (request.nextUrl.pathname.startsWith('/dashboard') && !request.nextUrl.pathname.startsWith('/dashboard/login')) {
    if (!isValidSession(request.cookies.get(SESSION_COOKIE)?.value)) {
      return NextResponse.redirect(new URL('/dashboard/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
