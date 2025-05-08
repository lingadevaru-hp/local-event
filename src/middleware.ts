
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',    // All routes starting with /dashboard
  '/user(.*)',         // Clerk's user profile page
  '/profile(.*)',      // Custom profile page (if any, though /user is standard for Clerk)
  '/notifications(.*)',
  '/watchlist(.*)',
  // Add other routes here that need to be protected
  // For example, an API route for event submission if it's not a Server Action
  // '/api/submit-event(.*)' 
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect(); // Protect routes defined in isProtectedRoute
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
