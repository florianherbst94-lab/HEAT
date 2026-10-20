import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Check if it's the access subdomain
  if (hostname.startsWith('access.') || hostname === 'access.heatdresden.de') {
    // We rewrite the URL to point to our access page.
    // However, we want next-intl to still handle locales.
    // next-intl expects the path to be like /en/something.
    // If they visit access.heatdresden.de/, the path is /.
    // We can let next-intl process it first to get the locale, then rewrite?
    
    // Actually, next-intl returns a response. If we rewrite, we might lose next-intl?
  }
}
