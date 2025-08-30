import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createIntlMiddleware({
  locales: ['ar', 'en'],
  defaultLocale: 'ar'
})

export default function middleware(request: NextRequest) {
  // Handle internationalization
  const response = intlMiddleware(request)
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

export const config = {
  matcher: ['/', '/(ar|en)/:path*']
}
