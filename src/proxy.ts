import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const session = request.cookies.get('bpa_session')
  const { pathname } = request.nextUrl

  // Allow auth API, login page, and public assets to pass through freely
  if (
    pathname.startsWith('/api/auth') ||
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname === '/logo.png' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!session || session.value !== 'authenticated') {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|logo.png|uploads).*)',
  ],
}
