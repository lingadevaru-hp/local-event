
'use client';

import { useState, useEffect } from 'react';
import type { Event } from '@/types/event';
import { EventCard } from '@/components/event-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ListChecks, Info, Loader2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser from '@clerk/nextjs'; // Changed from useAuth
import { useRouter } from 'next/navigation';
import { MOCK_EVENTS_DATA from '@/lib/mockEvents'; 

async function fetchWatchlistEvents(userId: string): Promise<Event[]> {
  console.log('Fetching watchlist for user:', userId);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const watchlistEventIds: string[] = [];
  if (typeof window !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('watchlist_') && key.endsWith(`_${userId}`) && localStorage.getItem(key) === 'true') {
        const eventId = key.split('_')[1]; 
        if (eventId) {
          watchlistEventIds.push(eventId);
        }
      }
    }
  }
  return MOCK_EVENTS_DATA.filter(event => watchlistEventIds.includes(event.id));
}


export default function WatchlistPage() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser(); // Using Clerk
  const router = useRouter();

  const [watchlistEvents, setWatchlistEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For watchlist data fetching
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/watchlist'); 
    } else if (isSignedIn && clerkUser) {
      setIsLoading(true);
      fetchWatchlistEvents(clerkUser.id) 
        .then(setWatchlistEvents)
        .catch(err => {
          console.error("Failed to load watchlist:", err);
          setError("Could not load your watchlist. Please try again later.");
        })
        .finally(() => setIsLoading(false));
    } else if (isLoaded && !isSignedIn) {
        setIsLoading(false); 
    }
  }, [clerkUser, isLoaded, isSignedIn, router]);

  if (!isLoaded || isLoading) { 
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading your watchlist...</p>
      </div>
    );
  }

  if (isLoaded && !isSignedIn) { 
    return (
      <div className="container mx-auto px-4 py-8">
         <Button variant="outline" asChild className="mb-6">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Login Required</AlertTitle>
          <AlertDescription>
            Please <Link href="/sign-in?redirect_url=/watchlist" className="underline text-primary">log in</Link> to view your watchlist.
          </AlertDescription>
        </Alert>
      </div>
    );
  }


  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
         <Button variant="outline" asChild className="mt-4">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center">
          <ListChecks className="mr-3 h-8 w-8" /> My Watchlist
        </h1>
         <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </div>

      {watchlistEvents.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Your Watchlist is Empty</AlertTitle>
          <AlertDescription>
            You haven&apos;t added any events to your watchlist yet. Browse events and click the heart icon to save them here.
            <br />
            <Button asChild variant="link" className="px-0">
              <Link href="/">Discover Events</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {watchlistEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
