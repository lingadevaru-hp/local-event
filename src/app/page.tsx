
'use client';
import { EventDiscovery } from '@/components/event-discovery';
import { FeaturedEventsCarousel } from '@/components/featured-events-carousel'; // New component
import { HeroSection } from '@/components/hero-section'; // New component
import { useEffect, useState }
from 'react';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading Local Pulse...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <HeroSection />
      <div className="container mx-auto px-0 sm:px-4 py-8 w-full">
        {/* Search engine and filters will be part of EventDiscovery */}
        {/* Featured Events Carousel placeholder, to be implemented if time permits or in a separate component */}
        <FeaturedEventsCarousel />
        <EventDiscovery />
      </div>
    </div>
  );
}
