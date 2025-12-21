import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(_request: NextRequest) {
  // Authentication devre dışı bırakıldı - tüm erişime izin ver
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}

