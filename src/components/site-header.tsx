
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, ListChecks, UserCircle, LogIn, UserPlus, LogOut, LayoutDashboard } from 'lucide-react'; 
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { useAuth } from '@/contexts/authContext'; // Using Firebase Auth
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


export function SiteHeader() {
  const { currentUser, appUser, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/'); // Redirect to home after sign out
    } catch (error) {
      console.error("Failed to sign out:", error);
      // Handle sign out error (e.g., show a toast)
    }
  };
  
  // Logo concept: A vibrant pulse icon (stylized heartbeat line) in orange, 
  // paired with the text "Local Pulse" in a modern sans-serif font (e.g., Poppins) in blue.
  // Placeholder for logo.png - ensure this image exists in public/
  const logoSrc = "/logo-placeholder.png"; // Replace with actual logo path e.g., /logo.png


  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-2 sm:space-x-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 mr-auto" aria-label="Local Pulse Karnataka Home">
           {/* Placeholder for logo - actual image to be added at public/logo.png */}
          <img 
            src={logoSrc} 
            alt="Local Pulse Logo" 
            className="h-8 w-8 object-contain" // Adjust size as needed
            data-ai-hint="pulse logo orange blue"
            onError={(e) => {
              // Fallback if logoSrc is not found, render SVG to avoid broken image
              const target = e.target as HTMLImageElement;
              target.style.display = 'none'; // Hide broken image
              const parent = target.parentElement;
              if (parent) {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("viewBox", "0 0 24 24");
                svg.setAttribute("fill", "currentColor");
                svg.setAttribute("class", "h-7 w-7 text-primary"); // Match original SVG style
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", "M12.0001 2.2627C12.0001 2.2627 6.66207 6.20034 6.00012 11.953C5.33816 17.7056 10.6522 21.9031 12.0001 21.9999C13.348 21.9031 18.662 17.7056 18.0001 11.953C17.3381 6.20034 12.0001 2.2627 12.0001 2.2627ZM12.0001 13.4999C11.1717 13.4999 10.5001 12.8283 10.5001 11.9999C10.5001 11.1715 11.1717 10.4999 12.0001 10.4999C12.8285 10.4999 13.5001 11.1715 13.5001 11.9999C13.5001 12.8283 12.8285 13.4999 12.0001 13.4999Z");
                svg.appendChild(path);
                // Insert SVG before the original img or its placeholder
                if (target.nextSibling) {
                    parent.insertBefore(svg, target.nextSibling);
                } else {
                    parent.appendChild(svg);
                }
              }
            }}
          />
          <span className="text-xl font-bold tracking-tight">Local Pulse <span className="text-sm font-normal text-primary">Karnataka</span></span>
        </Link>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <ThemeToggleButton />
          <nav className="flex items-center space-x-1">
            {currentUser ? (
              <>
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
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                    <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4 sm:mr-0 md:mr-2"/> <span className="hidden md:inline">Dashboard</span></Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={appUser?.photoURL || currentUser.photoURL || undefined} alt={appUser?.name || currentUser.displayName || "User"} data-ai-hint="user avatar small" />
                        <AvatarFallback>{appUser?.name?.charAt(0) || currentUser.displayName?.charAt(0) || <UserCircle className="h-5 w-5"/>}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{appUser?.name || currentUser.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {currentUser.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile"><UserCircle className="mr-2 h-4 w-4" /> Profile</Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                      <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login"><LogIn className="mr-2 h-4 w-4"/> Login</Link>
                </Button>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/register"><UserPlus className="mr-2 h-4 w-4"/> Register</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
