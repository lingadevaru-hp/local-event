
'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { EventDiscovery } from '@/components/event-discovery';
import { FeaturedEventsCarousel } from '@/components/featured-events-carousel';
import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, LogIn, UserPlus, WifiOff, SearchX } from 'lucide-react'; // Added WifiOff, SearchX
import type { Event as EventType } from '@/types/event';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { EventCard } from '@/components/event-card';
import { Skeleton } from '@/components/ui/skeleton'; // For skeleton loaders


const headlineVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const taglineVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeOut" } },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.4, type: "spring", stiffness: 150 } },
};

const EventCardSkeleton = () => (
  <div className="bg-card/50 backdrop-blur-sm border border-border/20 rounded-xl shadow-lg overflow-hidden p-4 glassmorphism">
    <Skeleton className="h-40 w-full rounded-md mb-4 bg-muted/30" />
    <Skeleton className="h-6 w-3/4 bg-muted/30 rounded-md mb-2" />
    <Skeleton className="h-4 w-1/2 bg-muted/30 rounded-md" />
  </div>
);


export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const [recentEvents, setRecentEvents] = useState<EventType[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => {
        setIsOnline(false);
        setEventError("You are offline. Please check your internet connection to view events.");
        setIsLoadingEvents(false); 
      };
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    if (!isOnline || !firestore) {
      setIsLoadingEvents(false);
      if (!isOnline) {
        // Error already set by online/offline listener
      } else {
         setEventError("Database service is currently unavailable. Please try again later.");
      }
      console.warn("Firestore not available or offline for recent events.");
      return;
    }

    setIsLoadingEvents(true);
    setEventError(null);

    const eventsCollectionRef = collection(firestore, 'events');
    // Ensure Firestore indexes are set up for orderBy queries for optimal performance.
    // Consider adding pagination for very large datasets if performance becomes an issue.
    const q = query(eventsCollectionRef, orderBy('createdAt', 'desc'), limit(6)); 

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData: EventType[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        eventsData.push({ 
          ...data, 
          id: doc.id, 
          date: (data.date as Timestamp)?.toDate?.().toISOString().split('T')[0] || data.date as string,
          endDate: (data.endDate as Timestamp)?.toDate?.().toISOString().split('T')[0] || data.endDate as string | undefined,
          createdAt: (data.createdAt as Timestamp)?.toDate?.().toISOString() || data.createdAt as string,
        } as EventType);
      });
      setRecentEvents(eventsData);
      setIsLoadingEvents(false);
      setEventError(null);
    }, (error) => {
      console.error("Error fetching recent events from Firestore:", error);
      setEventError("Failed to load recent events. Please try again or check your connection.");
      setIsLoadingEvents(false);
    });

    const loadTimer = setTimeout(() => {
      if (isLoadingEvents) { // Check if still loading
        setEventError("Loading events is taking longer than usual. Please ensure you have a stable internet connection.");
        // Optionally set isLoadingEvents to false to show the error instead of indefinite skeletons
        // setIsLoadingEvents(false); 
      }
    }, 15000); // 15-second timeout for initial load feedback

    return () => {
      unsubscribe();
      clearTimeout(loadTimer);
    };
  }, [isOnline]); // Re-fetch if online status changes and was previously offline.

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Local Pulse...</p>
      </div>
    );
  }
  
  if (!isOnline) {
     return (
      <div className="container mx-auto px-4 py-16 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <WifiOff className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
        <h2 className="text-3xl font-semibold mb-3 text-foreground">You are Offline</h2>
        <p className="text-muted-foreground max-w-md">
          Please check your internet connection to access Local Pulse events and features.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {!isSignedIn ? (
        <section className="w-full py-20 md:py-32 text-center relative overflow-hidden bg-card/30 glassmorphism">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-50 mix-blend-multiply"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 drop-shadow-md"
              initial="hidden"
              animate="visible"
              variants={headlineVariants}
            >
              Discover Local Events in Karnataka
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10"
              initial="hidden"
              animate="visible"
              variants={taglineVariants}
            >
              Sign in to explore, create, and share events happening near you. Your local pulse, at your fingertips.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial="hidden"
              animate="visible"
              variants={buttonVariants}
            >
              <SignInButton mode="modal">
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-3.5 px-10 text-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-primary/40 active:scale-95 animate-pulse"
                >
                  <LogIn className="mr-2.5 h-5 w-5" /> Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                 <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-primary border-primary hover:bg-primary/10 rounded-xl py-3.5 px-10 text-lg shadow-md hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-primary/40 active:scale-95"
                >
                  <UserPlus className="mr-2.5 h-5 w-5" /> Sign Up
                </Button>
              </SignUpButton>
            </motion.div>
          </div>
        </section>
      ) : (
        <div className="container mx-auto px-0 sm:px-4 py-8 w-full">
          <FeaturedEventsCarousel />
          <section className="my-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left text-primary tracking-tight">
              Recent Events
            </h2>
            {isLoadingEvents && !eventError && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[...Array(3)].map((_, i) => <EventCardSkeleton key={i} />)}
              </div>
            )}
            {!isLoadingEvents && eventError && (
              <div className="text-center py-10 text-destructive bg-destructive/10 rounded-lg shadow-md">
                <WifiOff className="mx-auto h-12 w-12 mb-3" />
                <p className="font-medium">{eventError}</p>
              </div>
            )}
            {!isLoadingEvents && !eventError && recentEvents.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {recentEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
            {!isLoadingEvents && !eventError && recentEvents.length === 0 && (
              <div className="text-center py-10 text-muted-foreground bg-card/50 rounded-lg shadow">
                <SearchX className="mx-auto h-12 w-12 mb-3 text-primary" />
                <p className="font-medium">No recent events found.</p>
                <p className="text-sm">Be the first to <Link href="/dashboard" className="text-primary hover:underline font-semibold">create one</Link>!</p>
              </div>
            )}
          </section>
          <EventDiscovery />
        </div>
      )}
    </div>
  );
}
