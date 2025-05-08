'use client';

import Link from 'next/link';
import { Home, CalendarDays, Bell, UserCircle, ListChecks } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs'; 

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/watchlist', label: 'Watchlist', icon: ListChecks, authRequired: true },
  { href: '/notifications', label: 'Alerts', icon: Bell, authRequired: true },
  { href: '/profile', label: 'Profile', icon: UserCircle, authRequired: false }, 
];

export function BottomNavigationBar() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  const handleTap = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20); 
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/30 bg-background/70 glassmorphism p-1 sm:hidden shadow-t-lg">
      <div className="container mx-auto flex justify-around items-center h-16"> {/* Increased height for better touch targets */}
        {navItems.map((item) => {
          let effectiveHref = item.href;
          let effectiveLabel = item.label;

          if (item.authRequired && !isSignedIn) {
            return null; 
          }
          
          if (item.href === '/profile') {
            effectiveHref = isSignedIn ? '/user' : '/sign-in'; // Redirect to Clerk's user profile or sign-in
            effectiveLabel = isSignedIn ? 'Profile' : 'Login';
          }
          
          const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link key={item.href} href={effectiveHref} legacyBehavior>
              <a
                onClick={handleTap}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ease-in-out w-1/5 h-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isActive 
                    ? 'text-primary scale-105 bg-primary/10' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className={cn('h-5 w-5 mb-1 transition-transform', isActive ? 'scale-110' : '')} />
                <span className={cn('text-[10px] font-medium tracking-tight', isActive ? 'text-primary font-semibold' : '')}>{effectiveLabel}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
