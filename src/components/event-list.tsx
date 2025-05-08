
import type { Event } from '@/types/event';
import { EventCard } from './event-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, SearchX } from 'lucide-react'; // Added SearchX

interface EventListProps {
  events: Event[];
  isLoading?: boolean;
  error?: string | null;
}

export function EventList({ events, isLoading, error }: EventListProps) {
  if (isLoading) {
    return (
      // Adjusted grid for better responsiveness and skeleton count
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => ( // Show more skeletons for larger screens
          <div key={i} className="border bg-card text-card-foreground shadow-sm rounded-lg p-4 space-y-3 animate-pulse">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-6 w-3/4 bg-muted rounded"></div>
            <div className="h-4 w-1/2 bg-muted rounded"></div>
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-4 w-2/3 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Events</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (events.length === 0) {
    return (
       <Alert className="mt-8 text-center">
        <SearchX className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
        <AlertTitle className="text-xl font-semibold">No Events Found</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          We couldn&apos;t find any events matching your current filters.
          <br /> Try adjusting your search criteria or check back later for new events!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    // Adjusted grid for better responsiveness
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
