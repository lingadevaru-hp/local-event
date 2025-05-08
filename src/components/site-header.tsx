
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, ListChecks } from 'lucide-react'; 
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
// useUser hook can be used if user information is needed directly in this component, but for now, UserButton handles profile links.

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-2 sm:space-x-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 mr-auto" aria-label="Local Pulse Karnataka Home">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-primary">
            <path d="M12.0001 2.2627C12.0001 2.2627 6.66207 6.20034 6.00012 11.953C5.33816 17.7056 10.6522 21.9031 12.0001 21.9999C13.348 21.9031 18.662 17.7056 18.0001 11.953C17.3381 6.20034 12.0001 2.2627 12.0001 2.2627ZM12.0001 13.4999C11.1717 13.4999 10.5001 12.8283 10.5001 11.9999C10.5001 11.1715 11.1717 10.4999 12.0001 10.4999C12.8285 10.4999 13.5001 11.1715 13.5001 11.9999C13.5001 12.8283 12.8285 13.4999 12.0001 13.4999Z" />
          </svg>
          <span className="text-xl font-bold tracking-tight">Local Pulse <span className="text-sm font-normal text-primary">Karnataka</span></span>
        </Link>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <ThemeToggleButton />
          <nav className="flex items-center space-x-1">
            <SignedIn>
              <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
                <Link href="/watchlist" aria-label="Watchlist">
                  <ListChecks className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
                <Link href="/notifications" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                </Link>
              </Button>
              <UserButton afterSignOutUrl="/">
                <UserButton.UserProfileLink label="My App Profile" url="/profile" />
                {/* Clerk's default "Manage Account" links to /user */}
              </UserButton>
               <Button variant="ghost" size="sm" asChild className="ml-2">
                  <Link href="/dashboard">Dashboard</Link>
              </Button>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">Login</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Register</Button>
              </SignUpButton>
            </SignedOut>
          </nav>
        </div>
      </div>
    </header>
  );
}
