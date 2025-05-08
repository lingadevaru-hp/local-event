
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/', 
  '/events/(.*)', // Allows viewing specific event details
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/api/webhook/clerk(.*)', // Clerk webhooks should be public
  // Add other public routes here if any (e.g., about page, contact page)
]);

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/watchlist(.*)',
  '/notifications(.*)',
  // Add other routes that need protection
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect(); // Protects the route if it matches any in isProtectedRoute
  }
  // Public routes are accessible by default if not matched by isProtectedRoute
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
