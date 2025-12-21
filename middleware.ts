import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')

  // Dashboard sayfalarına erişim kontrolü
  if (isDashboardPage && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Login sayfasına erişim kontrolü (oturum varsa dashboard'a yönlendir)
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}

