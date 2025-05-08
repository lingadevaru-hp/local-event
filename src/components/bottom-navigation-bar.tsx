
'use client';

import Link from 'next/link';
import { Home, CalendarDays, Bell, UserCircle, ListChecks } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs'; // Using Clerk's useUser hook

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/watchlist', label: 'Watchlist', icon: ListChecks, authRequired: true },
  { href: '/notifications', label: 'Alerts', icon: Bell, authRequired: true },
  { href: '/profile', label: 'Profile', icon: UserCircle, authRequired: false }, // Profile link will redirect to Clerk's sign-in if not auth
];

export function BottomNavigationBar() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  const handleTap = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20); // Subtle haptic feedback
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/75 p-1 sm:hidden shadow-t-lg">
      <div className="container mx-auto flex justify-around items-center h-14">
        {navItems.map((item) => {
          if (item.authRequired && !isSignedIn) {
            return null; 
          }
          
          const href = item.href === '/profile' && !isSignedIn ? '/sign-in' : item.href; // Link to Clerk sign-in
          const label = item.href === '/profile' && !isSignedIn ? 'Login' : item.label;

          const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link key={item.href} href={href} legacyBehavior>
              <a
                onClick={handleTap}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ease-in-out w-1/5 h-full',
                  isActive 
                    ? 'text-primary scale-105' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className={cn('h-5 w-5 mb-0.5 transition-transform', isActive ? 'scale-110' : '')} />
                <span className={cn('text-[10px] font-medium tracking-tight', isActive ? 'text-primary' : '')}>{label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
