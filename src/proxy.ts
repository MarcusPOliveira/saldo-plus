import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const protectedRoutes = ['/dashboard', '/transactions', '/settings', '/wizard']
const authRoutes = ['/sign-in', '/sign-up']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute || isAuthRoute) {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/transactions/:path*',
    '/settings/:path*',
    '/wizard/:path*',
    '/sign-in/:path*',
    '/sign-up/:path*',
  ],
}
