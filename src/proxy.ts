
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const hostHeader = request.headers.get('host') || '';
  const xForwardedHost = request.headers.get('x-forwarded-host') || '';
  const hostname = request.nextUrl.hostname || '';
  
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
      
      // We must pass the request through next-intl middleware first, so the locale is correctly attached
      // But we change the request URL before passing it!
      const modifiedRequest = new NextRequest(newUrl, request);
      // Wait, if we return NextResponse.rewrite directly, next-intl won't handle the locale cookies and headers!
      // This might be breaking Vercel edge. Let's do:
      const response = handleI18nRouting(modifiedRequest);
      // We need to rewrite the response to point to our modified URL
      // Actually, if we just return handleI18nRouting(modifiedRequest), next-intl handles the rewrite.
      return response;
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
