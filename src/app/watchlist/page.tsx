
'use client';

import { useState, useEffect } from 'react';
import type { Event } from '@/types/event';
import { EventCard } from '@/components/event-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ListChecks, Info, Loader2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/authContext'; // Using Firebase Auth
import { useRouter } from 'next/navigation';
import { MOCK_EVENTS_DATA } from '@/lib/mockEvents'; 
import { collection, getDocs, query, where, Timestamp, doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';


// Function to fetch events by IDs from Firestore
async function fetchEventsByIds(eventIds: string[]): Promise<Event[]> {
  if (!firestore || eventIds.length === 0) {
    return [];
  }
  const events: Event[] = [];
  // Firestore 'in' query limit is 10 (or 30 in some cases). Batch if necessary.
  // For simplicity, this example assumes eventIds length is within limits.
  // A more robust solution would batch requests if eventIds.length > 10.
  const batches = [];
  for (let i = 0; i < eventIds.length; i += 10) {
    batches.push(eventIds.slice(i, i + 10));
  }

  for (const batch of batches) {
    if (batch.length === 0) continue;
    const eventsCollectionRef = collection(firestore, 'events');
    // Note: Using documentId() for filtering is tricky with 'in'.
    // A common pattern is to fetch each document individually or structure data differently.
    // For this example, we'll fetch one by one (less efficient for many IDs).
    for (const id of batch) {
        const eventDocRef = doc(firestore, 'events', id);
        const docSnap = await getDoc(eventDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data() as Omit<Event, 'id' | 'createdAt'> & { createdAt: Timestamp, date: Timestamp, endDate?: Timestamp };
            events.push({ 
                ...data, 
                id: docSnap.id, 
                createdAt: data.createdAt.toDate().toISOString(),
                date: data.date.toDate().toISOString().split('T')[0],
                endDate: data.endDate ? data.endDate.toDate().toISOString().split('T')[0] : undefined,
            });
        }
    }
  }
  return events;
}


export default function WatchlistPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [watchlistEvents, setWatchlistEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login?redirect_url=/watchlist'); 
    } else if (currentUser) {
      setIsLoading(true);
      // Fetch watchlist event IDs from localStorage (client-side only)
      const watchlistEventIds: string[] = [];
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('watchlist_') && key.endsWith(`_${currentUser.uid}`) && localStorage.getItem(key) === 'true') {
            const eventId = key.split('_')[1]; 
            if (eventId) {
              watchlistEventIds.push(eventId);
            }
          }
        }
      }
      
      if (watchlistEventIds.length > 0) {
        fetchEventsByIds(watchlistEventIds)
          .then(setWatchlistEvents)
          .catch(err => {
            console.error("Failed to load watchlist events from Firestore:", err);
            setError("Could not load your watchlist. Please try again later.");
          })
          .finally(() => setIsLoading(false));
      } else {
        setWatchlistEvents([]); // No items in watchlist
        setIsLoading(false);
      }
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || isLoading) { 
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading your watchlist...</p>
      </div>
    );
  }

  // This redirect should be covered by the useEffect above, but kept as a safeguard
  if (!currentUser && !authLoading) { 
    return (
      <div className="container mx-auto px-4 py-8">
         <Button variant="outline" asChild className="mb-6">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Login Required</AlertTitle>
          <AlertDescription>
            Please <Link href="/login?redirect_url=/watchlist" className="underline text-primary">log in</Link> to view your watchlist.
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
