import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware({
  ...routing,
  localePrefix: 'always'
});

export default async function middleware(request: NextRequest) {
  // First apply internationalization middleware
  const intlResponse = intlMiddleware(request);

  // Check if the request is for a dashboard route
  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname.includes('/dashboard/');

  if (isDashboardRoute) {
    // Get the token from the request
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|.*\..*).*)']
};
