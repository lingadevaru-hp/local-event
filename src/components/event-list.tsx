import type { Event } from '@/types/event';
import { EventCard } from './event-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface EventListProps {
  events: Event[];
  isLoading?: boolean;
  error?: string | null;
}

export function EventList({ events, isLoading, error }: EventListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
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
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (events.length === 0) {
    return (
       <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No Events Found</AlertTitle>
        <AlertDescription>
          No events match your current filters or location. Try adjusting your search criteria or location settings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
