import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Redirect root to /in
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/in', request.url))
  }

  // Handle legacy un-localized paths
  const legacyPaths = ['/salaries', '/compare', '/companies']
  
  for (const legacyPath of legacyPaths) {
    if (pathname === legacyPath || pathname.startsWith(`${legacyPath}/`)) {
      return NextResponse.redirect(
        new URL(`/in${pathname}${request.nextUrl.search}`, request.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - icon.svg (icon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon.svg).*)',
  ],
}
