
import type { Event } from '@/types/event';
import { EventCard } from './event-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SearchX, WifiOff, ServerCrash } from 'lucide-react'; // Added ServerCrash for general errors

interface EventListProps {
  events: Event[];
  isLoading?: boolean;
  error?: string | null;
}

const EventCardSkeleton = () => (
  <div className="bg-card/50 backdrop-blur-sm border border-border/20 rounded-2xl shadow-lg overflow-hidden animate-pulse p-4 glassmorphism flex flex-col">
    <div className="aspect-[16/10] bg-muted/40 rounded-xl mb-4"></div> {/* Image placeholder */}
    <div className="space-y-3 flex-grow">
      <div className="h-6 w-4/5 bg-muted/30 rounded-md"></div> {/* Title placeholder */}
      <div className="h-4 w-3/5 bg-muted/20 rounded-md"></div> {/* Date/Time placeholder */}
      <div className="h-4 w-4/6 bg-muted/20 rounded-md"></div> {/* Location placeholder */}
    </div>
    <div className="flex justify-between items-center pt-4 mt-auto">
      <div className="h-5 w-1/3 bg-muted/20 rounded-md"></div> {/* Rating placeholder */}
      <div className="h-9 w-1/4 bg-muted/30 rounded-lg"></div> {/* Button placeholder */}
    </div>
  </div>
);


export function EventList({ events, isLoading, error }: EventListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 py-8">
        {[...Array(6)].map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    let ErrorIcon = ServerCrash;
    let title = "Oops! Something went wrong.";
    if (error.toLowerCase().includes("offline") || error.toLowerCase().includes("network")) {
        ErrorIcon = WifiOff;
        title = "You are Offline";
    }

    return (
      <div className="flex flex-col items-center justify-center text-center py-12 min-h-[300px] bg-card/30 glassmorphism rounded-xl shadow-lg">
        <ErrorIcon className="h-16 w-16 text-destructive mb-4" />
        <AlertTitle className="text-2xl font-semibold text-destructive mb-2">{title}</AlertTitle>
        <AlertDescription className="text-muted-foreground max-w-md">
          {error || "We couldn't load events at the moment. Please check your internet connection or try again later."}
        </AlertDescription>
      </div>
    );
  }

  if (events.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center text-center py-12 min-h-[300px] bg-card/30 glassmorphism rounded-xl shadow-lg">
        <SearchX className="h-16 w-16 text-primary mb-4" />
        <AlertTitle className="text-2xl font-semibold text-foreground mb-2">No Events Found</AlertTitle>
        <AlertDescription className="text-muted-foreground max-w-md">
          We couldn&apos;t find any events matching your current filters.
          Try adjusting your search or explore all events!
        </AlertDescription>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 py-8">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
