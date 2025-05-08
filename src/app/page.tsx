'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { EventDiscovery } from '@/components/event-discovery';
import { FeaturedEventsCarousel } from '@/components/featured-events-carousel';
import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import type { Event as EventType } from '@/types/event';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { EventCard } from '@/components/event-card';


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


export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const [recentEvents, setRecentEvents] = useState<EventType[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
    if (!firestore) {
      setIsLoadingEvents(false);
      console.warn("Firestore not available for recent events.");
      return;
    }

    const eventsCollectionRef = collection(firestore, 'events');
    const q = query(eventsCollectionRef, orderBy('createdAt', 'desc'), limit(6)); // Get latest 6 events

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const events: EventType[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Ensure date fields are strings for EventCard compatibility
        events.push({ 
          ...data, 
          id: doc.id, 
          date: data.date?.toDate?.().toISOString().split('T')[0] || data.date,
          endDate: data.endDate?.toDate?.().toISOString().split('T')[0] || data.endDate,
          createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        } as EventType);
      });
      setRecentEvents(events);
      setIsLoadingEvents(false);
    }, (error) => {
      console.error("Error fetching recent events:", error);
      setIsLoadingEvents(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Local Pulse...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {!isSignedIn ? (
        <section className="w-full py-20 md:py-32 text-center relative overflow-hidden glassmorphism">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6"
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
              Sign in to explore, create, and share events happening near you.
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
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg py-3 px-8 text-lg shadow-lg transition-transform hover:scale-105 active:scale-95 animate-pulse focus-visible:ring-primary/50"
                >
                  <LogIn className="mr-2 h-5 w-5" /> Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                 <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-primary border-primary hover:bg-primary/10 rounded-lg py-3 px-8 text-lg shadow-md transition-transform hover:scale-105 active:scale-95 focus-visible:ring-primary/50"
                >
                  <UserPlus className="mr-2 h-5 w-5" /> Sign Up
                </Button>
              </SignUpButton>
            </motion.div>
          </div>
        </section>
      ) : (
        <div className="container mx-auto px-0 sm:px-4 py-8 w-full">
          <FeaturedEventsCarousel />
          <section className="my-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left text-primary">
              Recent Events
            </h2>
            {isLoadingEvents ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card/50 backdrop-blur-sm border border-border/20 rounded-xl shadow-lg overflow-hidden animate-pulse p-4 glassmorphism">
                    <div className="h-40 bg-muted/30 rounded-md mb-4"></div>
                    <div className="h-6 w-3/4 bg-muted/30 rounded-md mb-2"></div>
                    <div className="h-4 w-1/2 bg-muted/30 rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : recentEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {recentEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No recent events found. Be the first to <Link href="/dashboard" className="text-primary hover:underline">create one</Link>!</p>
            )}
          </section>
          <EventDiscovery />
        </div>
      )}
    </div>
  );
}
