
import { NextResponse } from 'next/server';

export async function GET() {
  // This endpoint is for debugging purposes to check if Clerk environment variables are loaded.
  // In a real production app, you might want to restrict access to this endpoint.
  return NextResponse.json({
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'NOT SET',
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? 'Set (available server-side only)' : 'NOT SET (available server-side only)',
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || 'Default (/sign-in)',
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || 'Default (/sign-up)',
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || 'Default (/)',
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || 'Default (/)',
  });
}
