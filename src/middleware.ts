
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// This middleware function can be expanded later if needed for other purposes.
// For now, it doesn't enforce any specific authentication beyond what app pages might do.
export function middleware(request: NextRequest) {
  // Example: You could add logic here to redirect users based on cookies, headers, etc.
  // if (request.nextUrl.pathname.startsWith('/admin') && !request.cookies.has('admin_token')) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - icons/ (PWA icons)
    // - sw.js (Service Worker)
    // - manifest.json (PWA manifest)
    // - firebase-messaging-sw.js (Firebase messaging service worker)
    '/((?!api|_next/static|_next/image|favicon.ico|icons/|sw.js|manifest.json|firebase-messaging-sw.js).*)',
  ],
};
