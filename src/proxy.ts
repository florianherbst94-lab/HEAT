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
      // Instead of relying purely on next-intl routing for the rewrite, let's rewrite it explicitly first
      const segments = pathname.split('/').filter(Boolean);
      const firstSegment = segments[0];
      
      let newPath = '';
      if (firstSegment && routing.locales.includes(firstSegment as any)) {
        segments.splice(1, 0, 'access');
        newPath = '/' + segments.join('/');
      } else {
        newPath = pathname === '/' ? '/access' : '/access' + pathname;
      }
      
      const url = request.nextUrl.clone();
      url.pathname = newPath;
      
      // NextResponse.rewrite is the robust way to handle this on Vercel
      return NextResponse.rewrite(url);
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
