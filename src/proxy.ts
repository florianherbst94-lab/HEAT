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
      // Create a completely new URL and Request object so next-intl processes it as '/access'
      const newUrl = request.nextUrl.clone();
      newUrl.pathname = pathname === '/' ? '/access' : '/access' + pathname;
      
      const modifiedRequest = new NextRequest(newUrl, request);
      
      // Let next-intl handle the localized routing based on the new pathname
      return handleI18nRouting(modifiedRequest);
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
