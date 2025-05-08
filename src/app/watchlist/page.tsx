
'use client';

import { useState, useEffect } from 'react';
import type { Event } from '@/types/event';
import { EventCard } from '@/components/event-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ListChecks, Info, Loader2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { useAuth } from '@/contexts/authContext'; // Removed, use Clerk
import { useUser as useClerkUser } from '@clerk/nextjs'; // Added Clerk's useUser
import { useRouter } from 'next/navigation';
// import { MOCK_EVENTS_DATA } from '@/lib/mockEvents'; // Keep for fallback or remove if direct Firestore fetch is robust
import { collection, getDocs, query, where, Timestamp, doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';


// Function to fetch events by IDs from Firestore
async function fetchEventsByIds(eventIds: string[]): Promise<Event[]> {
  if (!firestore || eventIds.length === 0) {
    return [];
  }
  const events: Event[] = [];
  const batches = [];
  for (let i = 0; i < eventIds.length; i += 10) { // Firestore 'in' query limit
    batches.push(eventIds.slice(i, i + 10));
  }

  for (const batch of batches) {
    if (batch.length === 0) continue;
    // Fetching documents one by one can be inefficient.
    // A better approach for larger watchlists might involve a more complex data structure or cloud functions.
    // For now, individual fetches:
    for (const id of batch) {
        try {
            const eventDocRef = doc(firestore, 'events', id);
            const docSnap = await getDoc(eventDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as Omit<Event, 'id' | 'createdAt'> & { createdAt: Timestamp, date: Timestamp, endDate?: Timestamp };
                events.push({ 
                    ...data, 
                    id: docSnap.id, 
                    createdAt: (data.createdAt as Timestamp)?.toDate?.().toISOString() || data.createdAt as string,
                    date: (data.date as Timestamp)?.toDate?.().toISOString().split('T')[0] || data.date as string,
                    endDate: data.endDate ? ((data.endDate as Timestamp)?.toDate?.().toISOString().split('T')[0] || data.endDate as string) : undefined,
                });
            } else {
                console.warn(`Event with ID ${id} not found in watchlist fetch.`);
            }
        } catch (error) {
            console.error(`Error fetching event ${id} for watchlist:`, error);
            // Optionally, continue fetching other events or rethrow
        }
    }
  }
  return events;
}


export default function WatchlistPage() {
  // const { currentUser, loading: authLoading } = useAuth(); // Removed
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useClerkUser();
  const router = useRouter();

  const [watchlistEvents, setWatchlistEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clerkLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/watchlist'); // Redirect to Clerk sign-in
    } else if (clerkLoaded && isSignedIn && clerkUser) {
      setIsLoading(true);
      const watchlistEventIds: string[] = [];
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          // Ensure the key format matches exactly how it's stored.
          // If watchlist_event_${eventId}_user_${userId} is the format:
          if (key && key.startsWith('watchlist_event_') && key.endsWith(`_user_${clerkUser.id}`) && localStorage.getItem(key) === 'true') {
            const eventId = key.split('_')[2]; 
            if (eventId) {
              watchlistEventIds.push(eventId);
            }
          }
        }
      }
      
      if (watchlistEventIds.length > 0) {
        console.log("Fetching watchlist events for IDs:", watchlistEventIds);
        fetchEventsByIds(watchlistEventIds)
          .then(fetchedEvents => {
            setWatchlistEvents(fetchedEvents.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())); // Sort by date
          })
          .catch(err => {
            console.error("Failed to load watchlist events from Firestore:", err);
            setError("Could not load your watchlist. Please try again later.");
          })
          .finally(() => setIsLoading(false));
      } else {
        console.log("No events in watchlist (localStorage).");
        setWatchlistEvents([]); 
        setIsLoading(false);
      }
    } else if (clerkLoaded && !isSignedIn) {
        setIsLoading(false); // Not signed in, stop loading
    }
  }, [clerkUser, clerkLoaded, isSignedIn, router]);

  if (!clerkLoaded || isLoading) { 
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading your watchlist...</p>
      </div>
    );
  }

  if (clerkLoaded && !isSignedIn) { 
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
