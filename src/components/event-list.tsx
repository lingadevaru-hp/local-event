
import type { Event } from '@/types/event';
import { EventCard } from './event-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SearchX, WifiOff } from 'lucide-react'; // Added WifiOff for error

interface EventListProps {
  events: Event[];
  isLoading?: boolean;
  error?: string | null;
}

const EventCardSkeleton = () => (
  <div className="bg-card rounded-xl shadow-lg overflow-hidden animate-pulse">
    <div className="h-48 bg-muted/70"></div>
    <div className="p-4 space-y-3">
      <div className="h-6 w-3/4 bg-muted/60 rounded-md"></div>
      <div className="h-4 w-1/2 bg-muted/50 rounded-md"></div>
      <div className="h-4 w-full bg-muted/50 rounded-md"></div>
      <div className="h-4 w-2/3 bg-muted/50 rounded-md"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 w-1/4 bg-muted/50 rounded-md"></div>
        <div className="h-8 w-1/3 bg-muted/60 rounded-full"></div>
      </div>
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
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 min-h-[300px]">
        <WifiOff className="h-16 w-16 text-destructive mb-4" />
        <AlertTitle className="text-2xl font-semibold text-destructive mb-2">Oops! Something went wrong.</AlertTitle>
        <AlertDescription className="text-muted-foreground max-w-md">
          {error || "We couldn't load events at the moment. Please check your internet connection or try again later."}
        </AlertDescription>
      </div>
    );
  }

  if (events.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center text-center py-12 min-h-[300px]">
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
