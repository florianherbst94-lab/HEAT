
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const hostHeader = request.headers.get('host') || '';
  const xForwardedHost = request.headers.get('x-forwarded-host') || '';
  const hostname = request.nextUrl.hostname || '';
  
  console.log("PROXY HOSTS:", { hostHeader, xForwardedHost, hostname, url: request.url });
  
  const isAccessSubdomain = 
    hostname.includes('access.') || 
    hostHeader.includes('access.') || 
    xForwardedHost.includes('access.');

  if (isAccessSubdomain) {
    const pathname = request.nextUrl.pathname;
    
    // Check if path already contains /access (e.g. /access, /de/access)
    const isAlreadyAccess = pathname === '/access' || 
                            routing.locales.some(loc => pathname === `/${loc}/access` || pathname.startsWith(`/${loc}/access/`));
                            
    if (!isAlreadyAccess) {
      // Find if the path starts with a locale
      const pathParts = pathname.split('/').filter(Boolean);
      const hasLocale = pathParts.length > 0 && routing.locales.includes(pathParts[0] as any);
      
      const newUrl = request.nextUrl.clone();
      
      if (hasLocale) {
        // e.g. /de -> /de/access
        const locale = pathParts[0];
        const rest = pathParts.slice(1).join('/');
        newUrl.pathname = `/${locale}/access` + (rest ? `/${rest}` : '');
      } else {
        // e.g. / -> /access
        newUrl.pathname = pathname === '/' ? '/access' : '/access' + pathname;
      }
      
      return NextResponse.rewrite(newUrl);
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
