import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, MapPin, UserPlus, Bell, ListChecks } from 'lucide-react'; // Added Bell and ListChecks for notifications/watchlist

// Mock authentication status & user - replace with actual auth context/hook
const isAuthenticated = true; // Change to true to see authenticated state
const user = {
  name: 'Ananya Kulkarni',
  username: 'AnanyaK',
  email: 'ananya.k@example.com',
  avatarUrl: 'https://picsum.photos/seed/ananya/100/100', // Placeholder avatar
};

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link href="/" className="flex items-center space-x-2">
          {/* Using an inline SVG for Karnataka map icon placeholder */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-primary">
            <path d="M12.0001 2.2627C12.0001 2.2627 6.66207 6.20034 6.00012 11.953C5.33816 17.7056 10.6522 21.9031 12.0001 21.9999C13.348 21.9031 18.662 17.7056 18.0001 11.953C17.3381 6.20034 12.0001 2.2627 12.0001 2.2627ZM12.0001 13.4999C11.1717 13.4999 10.5001 12.8283 10.5001 11.9999C10.5001 11.1715 11.1717 10.4999 12.0001 10.4999C12.8285 10.4999 13.5001 11.1715 13.5001 11.9999C13.5001 12.8283 12.8285 13.4999 12.0001 13.4999Z" />
          </svg>
          <span className="text-xl font-bold tracking-tight">Local Pulse <span className="text-sm font-normal text-primary">ಕರ್ನಾಟಕ</span></span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <nav className="flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                {/* Placeholder for Watchlist and Notifications - functionality to be built */}
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
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile person karnataka" />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                       <Link href="/profile">My Profile (ನನ್ನ ವಿವರ)</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                       <Link href="/dashboard">Organizer Dashboard (ಆಯೋಜಕರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್)</Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild className="sm:hidden">
                       <Link href="/watchlist"><ListChecks className="mr-2 h-4 w-4" />Watchlist</Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild className="sm:hidden">
                       <Link href="/notifications"><Bell className="mr-2 h-4 w-4" />Notifications</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem> {/* Mock Logout */}
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out (ಲಾಗ್ ಔಟ್)</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Login (ಲಾಗಿನ್)
                  </Link>
                </Button>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/register">
                    <UserPlus className="mr-2 h-4 w-4" /> Register (ನೋಂದಣಿ)
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
