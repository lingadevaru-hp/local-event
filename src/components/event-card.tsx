import type { Event } from '@/types/event';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, MapPin, Star, IndianRupee, Compass } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const displayDate = new Date(event.date).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleVibrate = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10); // Softer vibration
    }
  };

  return (
    <Card 
      className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col h-full bg-card/70 glassmorphism rounded-2xl border-border/30 group"
      onClick={handleVibrate}
    >
      <CardHeader className="p-0 relative">
        <Link href={`/events/${event.id}`} className="block aspect-[16/10] overflow-hidden rounded-t-2xl"> {/* Slightly taller aspect ratio */}
          <Image
            src={event.imageUrl || `https://picsum.photos/seed/${event.id}/600/375`}
            alt={event.name}
            width={600}
            height={375} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="event image modern karnataka"
            loading="lazy"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-5 flex-grow flex flex-col justify-between"> {/* Increased padding */}
        <div>
          <Link href={`/events/${event.id}`}>
            <CardTitle className="text-lg md:text-xl font-semibold mb-2 hover:text-primary transition-colors line-clamp-2 leading-tight">
              {event.name}
            </CardTitle>
          </Link>
          <div className="space-y-2 text-xs md:text-sm text-muted-foreground mb-3">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-2 text-accent flex-shrink-0" /> {/* Increased icon size and margin */}
              <span>{displayDate} at {event.time}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-accent flex-shrink-0" />
              <span className="line-clamp-1">{event.locationName}, {event.city}</span>
            </div>
            {event.distance !== undefined && (
              <div className="flex items-center">
                 <Compass className="h-4 w-4 mr-2 text-accent flex-shrink-0" />
                <span>{event.distance.toFixed(1)} km away</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-auto pt-3"> {/* Increased gap and padding-top */}
          <Badge variant="secondary" className="text-xs rounded-md px-2 py-1 bg-secondary/80 text-secondary-foreground font-medium">{event.category}</Badge>
          <Badge variant="outline" className="text-xs rounded-md px-2 py-1 border-primary/60 text-primary font-medium">{event.language}</Badge>
          {event.price !== undefined && event.price !== null && (
             <Badge variant={event.price > 0 ? "outline" : "default"} className={`text-xs rounded-md px-2 py-1 font-medium ${event.price > 0 ? 'border-accent/70 text-accent' : 'bg-accent text-accent-foreground'}`}>
                <IndianRupee className="h-3.5 w-3.5 mr-1" /> {/* Slightly larger icon */}
                {event.price > 0 ? `₹${event.price}` : 'Free'}
             </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-5 flex justify-between items-center border-t border-border/30"> {/* Increased padding */}
        <div className="flex items-center">
          <Star className={`h-4.5 w-4.5 mr-1.5 ${event.averageRating && event.averageRating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/70'}`} /> {/* Larger star */}
          <span className="text-sm font-semibold text-foreground">
            {event.averageRating ? event.averageRating.toFixed(1) : 'New'}
          </span>
          <span className="text-xs text-muted-foreground ml-1.5">
            ({event.ratings?.length || 0} reviews)
          </span>
        </div>
        <Button 
          asChild 
          size="sm" 
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs px-4 py-2 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95" 
          onClick={handleVibrate}
        >
          <Link href={`/events/${event.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
