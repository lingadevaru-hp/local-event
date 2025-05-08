'use client';

import * as React from 'react';
import { Moon, Sun, Computer } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggleButton() {
  const { setTheme } = useTheme(); // Removed 'theme' as it's not used

  const handleVibrate = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20); 
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" onClick={handleVibrate} className="rounded-full hover:bg-muted/50 focus-visible:ring-primary transition-colors">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 text-muted-foreground transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 text-muted-foreground transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-border/50 bg-popover/80 glassmorphism py-1.5">
        <DropdownMenuItem onClick={() => { setTheme('light'); handleVibrate();}} className="cursor-pointer hover:bg-muted/50 focus:bg-muted/60 py-2 px-3 rounded-md text-sm flex items-center gap-2">
          <Sun className="h-4 w-4 text-muted-foreground" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTheme('dark'); handleVibrate();}} className="cursor-pointer hover:bg-muted/50 focus:bg-muted/60 py-2 px-3 rounded-md text-sm flex items-center gap-2">
          <Moon className="h-4 w-4 text-muted-foreground" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setTheme('system'); handleVibrate();}} className="cursor-pointer hover:bg-muted/50 focus:bg-muted/60 py-2 px-3 rounded-md text-sm flex items-center gap-2">
          <Computer className="h-4 w-4 text-muted-foreground" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
