
'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { EventDiscovery } from '@/components/event-discovery';
import { FeaturedEventsCarousel } from '@/components/featured-events-carousel';
import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, LogIn, UserPlus, WifiOff, SearchX, ServerCrash, ShieldAlert } from 'lucide-react';
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
  const { isSignedIn, isLoaded: isClerkLoaded, user } = useUser();
  const [recentEvents, setRecentEvents] = useState<EventType[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Debug: Log Clerk loading state
  useEffect(() => {
    console.log("Clerk isLoaded state:", isClerkLoaded);
    if(isClerkLoaded && isSignedIn) {
      console.log("User is signed in:", user?.id);
    } else if (isClerkLoaded && !isSignedIn) {
      console.log("User is not signed in.");
    }
  }, [isClerkLoaded, isSignedIn, user]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        console.log("App came online.");
        setIsOnline(true);
        setEventError(null); 
        // Re-fetch data if coming back online and there was a network error previously
        if (eventError && eventError.includes("network")) {
          // Logic to re-trigger event fetch could be added here if desired
          // For now, let the main event fetching useEffect handle it based on isOnline state.
        }
      };
      const handleOffline = () => {
        console.log("App went offline.");
        setIsOnline(false);
        setEventError("You are offline. Please check your internet connection to load live event data.");
        setIsLoadingEvents(false); 
      };
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [eventError]);

  useEffect(() => {
    if (!isOnline) {
      setIsLoadingEvents(false); // Error is already set by online/offline listener
      return () => {}; // No cleanup needed for this path
    }
    if (!firestore) {
       setEventError("Database service is currently unavailable. Recent events might not load. Please try again later.");
       setIsLoadingEvents(false);
       console.warn("Firestore not available for recent events fetch.");
       return () => {}; // No cleanup needed
    }

    setIsLoadingEvents(true);
    setEventError(null);
    console.log("Attempting to fetch recent events from Firestore...");

    const eventsCollectionRef = collection(firestore, 'events');
    // Reduced limit for faster initial load during debugging/testing
    const q = query(eventsCollectionRef, orderBy('createdAt', 'desc'), limit(3)); 

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
      setEventError(null); 
      setIsLoadingEvents(false);
    }, (error) => {
      console.error("Error fetching recent events from Firestore:", error);
      setEventError("Failed to load recent events. Please try again or check your connection.");
      setIsLoadingEvents(false);
    });

    const loadTimer = setTimeout(() => {
      if (isLoadingEvents) {
        console.warn("Recent events loading timed out (20s).");
        setEventError("Loading events is taking longer than usual. Please ensure you have a stable internet connection or try refreshing the page.");
        setIsLoadingEvents(false); // Stop showing skeleton if timeout
      }
    }, 20000); 

    return () => {
      console.log("Unsubscribing from recent events snapshot.");
      unsubscribe();
      clearTimeout(loadTimer);
    };
  }, [isOnline]); 

  
  const renderHeroSection = () => (
    <section className="w-full py-16 md:py-24 text-center relative overflow-hidden bg-card/50 glassmorphism-light dark:glassmorphism-dark rounded-xl shadow-xl mb-10">
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
            {!isSignedIn && isClerkLoaded
            ? "Sign in to explore, create, and share events happening near you. Your local pulse, at your fingertips."
            : (isSignedIn && isClerkLoaded ? "Explore events, manage your watchlist, or create your own!" : "Authenticating your experience...")
            }
        </motion.p>
        {!isSignedIn && isClerkLoaded && ( // Only show if Clerk is loaded and user is not signed in
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

  // Main loading state: Covers Clerk initialization and initial online check
  if (!isClerkLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Initializing Local Pulse...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full py-6 px-2 sm:px-4">
      {renderHeroSection()}

      <div className="container mx-auto px-0 sm:px-4 mt-10 w-full">
        <FeaturedEventsCarousel />
        
        <section className="my-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left text-primary tracking-tight">
            Recent Events
          </h2>
          {isLoadingEvents && !eventError && ( // Show skeletons only if actively loading events and no general error
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(3)].map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
          )}
          {eventError && ( // Display event-specific or general errors
             <Alert variant="destructive" className="my-8">
              {eventError.includes("offline") || eventError.includes("network") ? <WifiOff className="h-5 w-5" /> : <ServerCrash className="h-5 w-5" />}
              <AlertTitle>{eventError.includes("offline") || eventError.includes("network") ? "Network Issue" : "Error Loading Events"}</AlertTitle>
              <AlertDescription>{eventError}</AlertDescription>
            </Alert>
          )}
          {!isLoadingEvents && !eventError && recentEvents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {recentEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
          {!isLoadingEvents && !eventError && recentEvents.length === 0 && (
            <Alert className="my-8">
                <SearchX className="h-5 w-5" />
                <AlertTitle>No Recent Events Found</AlertTitle>
                <AlertDescription>
                It seems there are no recent events to display right now.
                {isClerkLoaded && isSignedIn ? (
                    <> Be the first to <Link href="/dashboard" className="text-primary hover:underline font-semibold">create one</Link>!</>
                ) : (
                  isClerkLoaded && <> <SignInButton mode="modal"><Button variant="link" className="p-0 h-auto text-primary hover:underline font-semibold">Sign in</Button></SignInButton> to create and see more events.</>
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
