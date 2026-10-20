import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Use nextUrl.hostname for reliable hostname matching
  const hostname = request.nextUrl.hostname;
  
  const isAccessSubdomain = 
    hostname.startsWith('access.') || 
    hostname === 'access.heatdresden.de' || 
    hostname === 'access.localhost';

  if (isAccessSubdomain) {
    // Check if the path already points to access
    const pathname = request.nextUrl.pathname;
    const isAlreadyAccess = pathname === '/access' || 
                            routing.locales.some(loc => pathname === `/${loc}/access` || pathname.startsWith(`/${loc}/access/`));
                            
    if (!isAlreadyAccess) {
      // Create a cloned URL to pass to next-intl
      // This is safer than mutating the original request which might cause inconsistencies
      const newUrl = request.nextUrl.clone();
      
      const segments = pathname.split('/').filter(Boolean);
      const firstSegment = segments[0];
      
      if (firstSegment && routing.locales.includes(firstSegment as any)) {
        segments.splice(1, 0, 'access');
        newUrl.pathname = '/' + segments.join('/');
      } else {
        newUrl.pathname = pathname === '/' ? '/access' : '/access' + pathname;
      }
      
      // We create a new request with the modified URL so next-intl processes the new path
      const modifiedRequest = new NextRequest(newUrl, request);
      
      return handleI18nRouting(modifiedRequest);
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for api, _next, _vercel and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
