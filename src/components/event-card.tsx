
import type { Event } from '@/types/event';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // CardDescription removed as it's not used here
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, MapPin, Star, Tag, Languages, IndianRupee, Compass } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const displayDate = new Date(event.date).toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const handleVibrate = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20); // Short vibration for interaction
    }
  };

  return (
    <Card 
      className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col h-full bg-card rounded-xl border-border/50 group"
      onClick={handleVibrate} // Vibrate on card click as well for touch feedback
    >
      <CardHeader className="p-0 relative">
        <Link href={`/events/${event.id}`} className="block aspect-[16/9] overflow-hidden">
          <Image
            src={event.imageUrl || `https://picsum.photos/seed/${event.id}/600/400`}
            alt={event.name}
            width={600}
            height={338} // Adjusted for 16:9 aspect ratio
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="event image karnataka"
            loading="lazy" // Added lazy loading
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <Link href={`/events/${event.id}`}>
            <CardTitle className="text-lg md:text-xl font-semibold mb-1.5 hover:text-primary transition-colors line-clamp-2">
              {event.name}
            </CardTitle>
          </Link>
          {/* Description removed for cleaner card, full description on details page */}
          <div className="space-y-1.5 text-xs md:text-sm text-muted-foreground mb-3">
            <div className="flex items-center">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-accent flex-shrink-0" />
              <span>{displayDate} at {event.time}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-accent flex-shrink-0" />
              <span className="line-clamp-1">{event.locationName}, {event.city}</span>
            </div>
            {event.distance !== undefined && ( // Check if distance is defined
              <div className="flex items-center">
                 <Compass className="h-3.5 w-3.5 mr-1.5 text-accent flex-shrink-0" />
                <span>{event.distance.toFixed(1)} km away</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          <Badge variant="secondary" className="text-xs bg-secondary/70 text-secondary-foreground">{event.category}</Badge>
          <Badge variant="outline" className="text-xs border-primary/50 text-primary">{event.language}</Badge>
          {event.price !== undefined && event.price !== null && (
             <Badge variant={event.price > 0 ? "outline" : "default"} className={`text-xs ${event.price > 0 ? 'border-accent text-accent' : 'bg-accent text-accent-foreground'}`}>
                <IndianRupee className="h-3 w-3 mr-0.5" />
                {event.price > 0 ? `₹${event.price}` : 'Free'}
             </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t border-border/50">
        <div className="flex items-center">
          <Star className={`h-4 w-4 mr-1 ${event.averageRating && event.averageRating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/70'}`} />
          <span className="text-xs font-medium text-foreground">
            {event.averageRating ? event.averageRating.toFixed(1) : 'New'}
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            ({event.ratings?.length || 0})
          </span>
        </div>
        <Button asChild size="sm" variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-xs px-4 py-2 transition-transform hover:scale-105 active:scale-95" onClick={handleVibrate}>
          <Link href={`/events/${event.id}`}>Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
