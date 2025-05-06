'use client';

import { useState, useEffect } from 'react';
import type { Event } from '@/types/event';
import { EventCard } from '@/components/event-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ListChecks, Info, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock function to get watchlist events - replace with actual API call
async function fetchWatchlistEvents(userId: string): Promise<Event[]> {
  console.log('Fetching watchlist for user:', userId);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, filter MOCK_EVENTS_KARNATAKA or fetch from backend based on localStorage/DB
  const MOCK_EVENTS_KARNATAKA: Event[] = [ // Copied from event-discovery for demo
    { 
      id: '1', name: 'Kala Utsava Bengaluru', nameKa: 'ಕಲಾ ಉತ್ಸವ ಬೆಂಗಳೂರು', 
      description: 'A grand celebration of Karnataka\'s art and culture...', 
      date: '2024-09-15', time: '10:00 AM', 
      locationName: 'Vidhana Soudha Grounds', address: 'Bengaluru', 
      district: 'Bengaluru Urban', city: 'Bengaluru', latitude: 12.9797, longitude: 77.5913, 
      category: 'Utsava', language: 'Bilingual', 
      imageUrl: 'https://picsum.photos/seed/utsava/600/400', createdAt: '2024-02-01', averageRating: 4.7, price: 0
    },
    { 
      id: '3', name: 'Yakshagana Sammelana Udupi', nameKa: 'ಯಕ್ಷಗಾನ ಸಮ್ಮೇಳನ ಉಡುಪಿ',
      description: 'A grand gathering of Yakshagana artists...', 
      date: '2024-11-20', time: '06:00 PM', 
      locationName: 'Sri Krishna Mutt Complex', address: 'Udupi', 
      district: 'Udupi', city: 'Udupi', latitude: 13.342, longitude: 74.747, 
      category: 'Yakshagana', language: 'Kannada', 
      imageUrl: 'https://picsum.photos/seed/yakshagana/600/400', createdAt: '2024-04-01', averageRating: 4.5, price: 50
    },
  ];

  const watchlistEventIds: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('watchlist_') && localStorage.getItem(key) === 'true') {
      watchlistEventIds.push(key.replace('watchlist_', ''));
    }
  }
  return MOCK_EVENTS_KARNATAKA.filter(event => watchlistEventIds.includes(event.id));
}


export default function WatchlistPage() {
  const [watchlistEvents, setWatchlistEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock current user ID - replace with actual user from auth context
  const currentUserId = 'devUser123'; 

  useEffect(() => {
    if (currentUserId) {
      setIsLoading(true);
      fetchWatchlistEvents(currentUserId)
        .then(setWatchlistEvents)
        .catch(err => {
          console.error("Failed to load watchlist:", err);
          setError("Could not load your watchlist. Please try again later.");
        })
        .finally(() => setIsLoading(false));
    } else {
      // Handle case where user is not authenticated, though page access should be protected
      setError("Please log in to view your watchlist.");
      setIsLoading(false);
    }
  }, [currentUserId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading your watchlist...</p>
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
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center">
          <ListChecks className="mr-3 h-8 w-8" /> My Watchlist (ನನ್ನ ವೀಕ್ಷಣಾ ಪಟ್ಟಿ)
        </h1>
      </div>

      {watchlistEvents.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Your Watchlist is Empty (ನಿಮ್ಮ ವೀಕ್ಷಣಾ ಪಟ್ಟಿ ಖಾಲಿಯಾಗಿದೆ)</AlertTitle>
          <AlertDescription>
            You haven&apos;t added any events to your watchlist yet. Browse events and click the heart icon to save them here.
            <br />
            <Button asChild variant="link" className="px-0">
              <Link href="/">Discover Events (ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಅನ್ವೇಷಿಸಿ)</Link>
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
