import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const hostHeader = request.headers.get('host') || '';
  const xForwardedHost = request.headers.get('x-forwarded-host') || '';
  const hostname = request.nextUrl.hostname || '';
  
  const isAccessSubdomain = 
    hostname.startsWith('access.') || 
    hostHeader.startsWith('access.') || 
    xForwardedHost.startsWith('access.') ||
    hostname === 'access.heatdresden.de' || 
    hostHeader === 'access.heatdresden.de' || 
    xForwardedHost === 'access.heatdresden.de' ||
    hostname === 'access.localhost';

  if (isAccessSubdomain) {
    const pathname = request.nextUrl.pathname;
    const isAlreadyAccess = pathname === '/access' || 
                            routing.locales.some(loc => pathname === `/${loc}/access` || pathname.startsWith(`/${loc}/access/`));
                            
    if (!isAlreadyAccess) {
      // Mutate the nextUrl pathname directly so next-intl processes it as if the user requested /access
      if (pathname === '/') {
        request.nextUrl.pathname = '/access';
      } else {
        request.nextUrl.pathname = '/access' + pathname;
      }
    }
  }

  // Now hand over to next-intl, which will read request.nextUrl.pathname,
  // detect/assign the locale, and rewrite to /[locale]/access...
  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
