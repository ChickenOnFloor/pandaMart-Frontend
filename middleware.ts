import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = ['/cart', '/checkout', '/seller', '/admin']
const authRoutes = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if route needs authentication
  const needsAuth = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (needsAuth) {
    // Check for token cookie (backend sets 'token' cookie)
    const token = request.cookies.get('token')?.value

    if (!token) {
      // Not authenticated, redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // For dashboard routes, we'll allow the request to proceed
    // The frontend will handle detailed authentication checks
    if (pathname.startsWith('/seller') || pathname.startsWith('/admin')) {
      return NextResponse.next()
    }
  }

  // Allow auth routes to be accessible (login/register pages)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('token')?.value
    if (token) {
      // Already authenticated, redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.*|apple-icon.*).*)',
  ],
}