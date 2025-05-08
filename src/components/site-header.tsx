
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, ListChecks, LogOut, UserCircle, LayoutDashboard } from 'lucide-react'; 
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { useClerk, UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useAuth } from '@/contexts/authContext'; // Keep for appUser if needed beyond Clerk's user

export function SiteHeader() {
  const { signOut: clerkSignOut, user: clerkUser } = useClerk();
  const { appUser } = useAuth(); // appUser from custom context
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await clerkSignOut(() => router.push('/'));
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };
  
  const logoSrc = "/logo-placeholder.png"; // Path to your actual logo

  const handleVibrate = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20); // Short vibration
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2" aria-label="Local Pulse Karnataka Home" onClick={handleVibrate}>
          <img 
            src={logoSrc} 
            alt="Local Pulse Logo" 
            className="h-9 w-9 object-contain transition-transform hover:scale-105"
            data-ai-hint="pulse logo orange blue"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("viewBox", "0 0 24 24");
                svg.setAttribute("fill", "currentColor");
                svg.setAttribute("class", "h-8 w-8 text-primary");
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", "M12 2.25c-5.107 0-9.25 4.037-9.25 9 0 4.962 4.143 9 9.25 9s9.25-4.038 9.25-9c0-4.963-4.143-9-9.25-9zm0 16.5c-4.006 0-7.25-3.244-7.25-7.25S7.994 4.75 12 4.75s7.25 3.244 7.25 7.25S16.006 18.75 12 18.75zm0-5.5c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75z");
                svg.appendChild(path);
                if (target.nextSibling) {
                    parent.insertBefore(svg, target.nextSibling);
                } else {
                    parent.appendChild(svg);
                }
              }
            }}
          />
          <span className="text-xl font-semibold tracking-tight text-foreground">Local Pulse</span>
        </Link>
        
        <div className="flex items-center space-x-2">
          <ThemeToggleButton />
          
          <SignedIn>
            <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex" onClick={handleVibrate}>
              <Link href="/watchlist" aria-label="Watchlist">
                <ListChecks className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex" onClick={handleVibrate}>
              <Link href="/notifications" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex" onClick={handleVibrate}>
                <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4 sm:mr-0 md:mr-2"/> <span className="hidden md:inline">Dashboard</span></Link>
            </Button>
            <UserButton afterSignOutUrl="/" appearance={{
              elements: {
                avatarBox: "h-9 w-9",
                userButtonPopoverCard: "shadow-xl border-border rounded-lg",
              }
            }}/>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" onClick={handleVibrate}>Login</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleVibrate}>Register</Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
