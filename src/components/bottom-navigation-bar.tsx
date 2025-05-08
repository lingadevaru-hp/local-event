
'use client';

import Link from 'next/link';
import { Home, CalendarDays, Bell, UserCircle, ListChecks } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/authContext';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/events', label: 'Events', icon: CalendarDays }, // Assuming an /events overview page
  { href: '/watchlist', label: 'Watchlist', icon: ListChecks, authRequired: true },
  { href: '/notifications', label: 'Alerts', icon: Bell, authRequired: true },
  { href: '/profile', label: 'Profile', icon: UserCircle, authRequired: true },
];

export function BottomNavigationBar() {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  // Haptic feedback on tap
  const handleTap = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50); // Vibrate for 50ms
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 sm:hidden">
      <div className="container mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          if (item.authRequired && !currentUser && item.href !== '/profile') { // Profile link will redirect to login if not authenticated
            return null; 
          }
          // Special handling for profile: if not logged in, link to /login instead
          const href = item.href === '/profile' && !currentUser ? '/login' : item.href;
          const label = item.href === '/profile' && !currentUser ? 'Login' : item.label;


          const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={href} legacyBehavior>
              <a
                onClick={handleTap}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-md transition-colors w-1/5',
                  isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className={cn('h-6 w-6 mb-0.5', isActive ? 'text-primary' : 'text-muted-foreground')} />
                <span className={cn('text-xs', isActive ? 'font-semibold' : 'font-normal')}>{label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
