'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { EventDiscovery } from '@/components/event-discovery';
import { FeaturedEventsCarousel } from '@/components/featured-events-carousel';
import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, LogIn, UserPlus, WifiOff, SearchX, ServerCrash } from 'lucide-react';
import type { Event as EventType } from '@/types/event';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { EventCard } from '@/components/event-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


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
  <div className="bg-card/50 backdrop-blur-sm border border-border/20 rounded-xl shadow-lg overflow-hidden p-4 glassmorphism animate-pulse">
    <Skeleton className="h-40 w-full rounded-md mb-4 bg-muted/30" />
    <Skeleton className="h-6 w-3/4 bg-muted/30 rounded-md mb-2" />
    <Skeleton className="h-4 w-1/2 bg-muted/30 rounded-md" />
  </div>
);


export default function HomePage() {
  const { isSignedIn, isLoaded: isClerkLoaded } = useUser();
  const [recentEvents, setRecentEvents] = useState<EventType[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        setEventError(null); // Clear previous offline error
        // Optionally re-fetch data if coming back online
      };
      const handleOffline = () => {
        setIsOnline(false);
        setEventError("You are offline. Please check your internet connection.");
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
    if (!isOnline) {
      // Error is already set by the online/offline listener
      setIsLoadingEvents(false);
      return;
    }
    if (!firestore) {
       setEventError("Database service is currently unavailable. Please try again later.");
       setIsLoadingEvents(false);
       console.warn("Firestore not available for recent events fetch.");
       return;
    }

    setIsLoadingEvents(true);
    setEventError(null);
    console.log("Attempting to fetch recent events...");

    const eventsCollectionRef = collection(firestore, 'events');
    const q = query(eventsCollectionRef, orderBy('createdAt', 'desc'), limit(6)); 

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log("Recent events snapshot received:", querySnapshot.size, "documents");
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
      setEventError(null); // Clear any previous error on successful fetch
      setIsLoadingEvents(false);
    }, (error) => {
      console.error("Error fetching recent events from Firestore:", error);
      setEventError("Failed to load recent events. Please try again or check your connection.");
      setIsLoadingEvents(false);
    });

    const loadTimer = setTimeout(() => {
      if (isLoadingEvents) {
        console.warn("Recent events loading timed out.");
        setEventError("Loading events is taking longer than usual. Please ensure you have a stable internet connection.");
        // setIsLoadingEvents(false); // Optionally stop showing skeleton if timeout is too long
      }
    }, 20000); // 20-second timeout

    return () => {
      console.log("Unsubscribing from recent events snapshot.");
      unsubscribe();
      clearTimeout(loadTimer);
    };
  }, [isOnline]); // Re-fetch if online status changes and was previously offline.

  // Combined initial loading state for Clerk and basic connectivity
  if (!isClerkLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Initializing Local Pulse...</p>
      </div>
    );
  }
  
  const renderHeroSection = () => (
    <section className="w-full py-16 md:py-24 text-center relative overflow-hidden bg-card/50 glassmorphism-light dark:glassmorphism-dark rounded-xl shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-30 mix-blend-multiply dark:opacity-50"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 drop-shadow-lg"
            initial="hidden" animate="visible" variants={headlineVariants}
        >
            Discover Local Events in Karnataka
        </motion.h1>
        <motion.p
            className="text-md sm:text-lg text-muted-foreground max-w-lg mx-auto mb-8"
            initial="hidden" animate="visible" variants={taglineVariants}
        >
            {!isSignedIn 
            ? "Sign in to explore, create, and share events happening near you. Your local pulse, at your fingertips."
            : "Explore events, manage your watchlist, or create your own!"
            }
        </motion.p>
        {!isSignedIn && (
            <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial="hidden" animate="visible" variants={buttonVariants}
            >
            <SignInButton mode="modal">
                <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-3 px-8 text-md shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-primary/40 active:scale-95 animate-pulse"
                >
                <LogIn className="mr-2 h-5 w-5" /> Sign In
                </Button>
            </SignInButton>
            <SignUpButton mode="modal">
                <Button 
                variant="outline" 
                size="lg" 
                className="text-primary border-primary hover:bg-primary/10 rounded-xl py-3 px-8 text-md shadow-md hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-primary/40 active:scale-95"
                >
                <UserPlus className="mr-2 h-5 w-5" /> Sign Up
                </Button>
            </SignUpButton>
            </motion.div>
        )}
        </div>
    </section>
  );

  return (
    <div className="flex flex-col items-center w-full py-6 px-2 sm:px-4">
      {renderHeroSection()}

      <div className="container mx-auto px-0 sm:px-4 mt-10 w-full">
        <FeaturedEventsCarousel />
        
        <section className="my-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left text-primary tracking-tight">
            Recent Events
          </h2>
          {!isOnline && eventError && (
             <Alert variant="destructive" className="my-8">
              <WifiOff className="h-5 w-5" />
              <AlertTitle>Offline</AlertTitle>
              <AlertDescription>{eventError}</AlertDescription>
            </Alert>
          )}
          {isOnline && isLoadingEvents && !eventError && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(3)].map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
          )}
          {isOnline && !isLoadingEvents && eventError && (
            <Alert variant="destructive" className="my-8">
              <ServerCrash className="h-5 w-5" />
              <AlertTitle>Error Loading Events</AlertTitle>
              <AlertDescription>{eventError}</AlertDescription>
            </Alert>
          )}
          {isOnline && !isLoadingEvents && !eventError && recentEvents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {recentEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
          {isOnline && !isLoadingEvents && !eventError && recentEvents.length === 0 && (
            <Alert className="my-8">
                <SearchX className="h-5 w-5" />
                <AlertTitle>No Recent Events</AlertTitle>
                <AlertDescription>
                No recent events found.
                {isSignedIn ? (
                    <> Be the first to <Link href="/dashboard" className="text-primary hover:underline font-semibold">create one</Link>!</>
                ) : (
                    <> <SignInButton mode="modal"><Button variant="link" className="p-0 h-auto text-primary hover:underline font-semibold">Sign in</Button></SignInButton> to create events.</>
                )}
                </AlertDescription>
            </Alert>
          )}
        </section>
        <EventDiscovery />
      </div>
    </div>
  );
}