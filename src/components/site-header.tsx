'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, ListChecks, LayoutDashboard, LogIn, UserPlus } from 'lucide-react'; 
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import Image from 'next/image'; // Using next/image

export function SiteHeader() {
  const handleVibrate = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20); 
    }
  };

  // Placeholder for logo, ideally an SVG or optimized PNG
  const logoSrc = "/logo-placeholder.png"; // Replace with actual logo path if available
                                        // data-ai-hint="pulse logo modern orange blue" 
                                        // The hint is useful if you want AI to generate/find a logo later.

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/80 glassmorphism">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 group" aria-label="Local Pulse Karnataka Home" onClick={handleVibrate}>
          {/* Using a div as a fallback for the logo image */}
          <div className="h-9 w-9 relative group-hover:scale-105 transition-transform" data-ai-hint="pulse logo modern orange blue">
            <Image 
              src={logoSrc} 
              alt="Local Pulse Logo" 
              fill
              sizes="36px"
              className="object-contain"
              onError={(e) => {
                // Fallback to a simple SVG or text if image fails
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                if (fallback) (fallback as HTMLElement).style.display = 'flex';
              }}
            />
             <div 
              className="logo-fallback hidden items-center justify-center h-full w-full bg-primary rounded-full text-primary-foreground font-bold text-lg"
            >
              LP
            </div>
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">Local Pulse</span>
        </Link>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          <ThemeToggleButton />
          
          <SignedIn>
            <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex rounded-full" onClick={handleVibrate}>
              <Link href="/watchlist" aria-label="Watchlist">
                <ListChecks className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex rounded-full" onClick={handleVibrate}>
              <Link href="/notifications" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex rounded-lg" onClick={handleVibrate}>
                <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4 sm:mr-0 md:mr-2"/> <span className="hidden md:inline">Dashboard</span></Link>
            </Button>
            <UserButton afterSignOutUrl="/" appearance={{
              elements: {
                avatarBox: "h-9 w-9 shadow-md hover:shadow-lg transition-shadow",
                userButtonPopoverCard: "shadow-xl rounded-xl border-border/50 bg-popover/80 glassmorphism",
                userButtonPopoverActionButton: "hover:bg-muted/50 rounded-md",
                userButtonPopoverActionButtonIcon: "text-primary",
              }
            }}/>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" onClick={handleVibrate} className="rounded-lg text-sm px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-primary/10">
                <LogIn className="mr-1.5 h-4 w-4 sm:mr-2" /> Login
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm px-3 py-1.5 sm:px-4 sm:py-2 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95" 
                onClick={handleVibrate}
              >
                <UserPlus className="mr-1.5 h-4 w-4 sm:mr-2" /> Register
              </Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
