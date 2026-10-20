import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Handle subdomain routing
  if (hostname.startsWith('access.') || hostname === 'access.heatdresden.de' || hostname === 'access.localhost:3000') {
    const url = request.nextUrl;
    
    // We want to map / to /access, /de to /de/access, etc.
    // Let's check if the path already starts with /access or a locale + /access
    const pathname = url.pathname;
    const isAlreadyAccess = pathname === '/access' || 
                            routing.locales.some(loc => pathname === `/${loc}/access` || pathname.startsWith(`/${loc}/access/`));
                            
    if (!isAlreadyAccess) {
      // Split the path to check if there's a locale
      const segments = pathname.split('/').filter(Boolean);
      const firstSegment = segments[0];
      
      if (firstSegment && routing.locales.includes(firstSegment as any)) {
        // It has a locale, e.g., /de
        segments.splice(1, 0, 'access'); // insert 'access' after locale
        url.pathname = '/' + segments.join('/');
      } else {
        // No locale, e.g., /
        if (pathname === '/') {
          url.pathname = '/access';
        } else {
          url.pathname = '/access' + pathname;
        }
      }
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for api, _next, _vercel and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
