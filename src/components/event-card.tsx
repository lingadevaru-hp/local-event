
import type { Event } from '@/types/event';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, MapPin, Star, Tag, Languages, IndianRupee, Compass } from 'lucide-react'; // Changed Landmark to Compass
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const displayDate = new Date(event.date).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-card">
      <CardHeader className="p-0 relative">
        <Link href={`/events/${event.id}`} className="block">
          <Image
            src={event.imageUrl || `https://picsum.photos/seed/${event.id}/600/400`}
            alt={event.name}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint="event image karnataka"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/events/${event.id}`}>
          <CardTitle className="text-xl mb-1 hover:text-primary transition-colors">
            {event.name}
          </CardTitle>
          {/* Optional: Display Kannada name if available and desired, e.g., for screen readers or specific user preference */}
          {/* {event.nameKa && <p className="text-sm text-muted-foreground mb-2">({event.nameKa})</p>} */}
        </Link>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {event.description}
        </CardDescription>
        <div className="space-y-2 text-sm text-foreground">
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2 text-accent" />
            <span>{displayDate} at {event.time}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-accent" />
            <span>{event.locationName}, {event.city}, {event.district}</span>
          </div>
           {event.distance && (
            <div className="flex items-center">
               <Compass className="h-4 w-4 mr-2 text-accent" /> {/* Using Compass icon */}
              <span>{event.distance.toFixed(1)} km away</span>
            </div>
          )}
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-2 text-accent" />
            <Badge variant="secondary" className="text-xs">{event.category}</Badge>
          </div>
          <div className="flex items-center">
            <Languages className="h-4 w-4 mr-2 text-accent" />
            <span className="text-xs">{event.language}</span>
          </div>
          {event.price !== undefined && event.price !== null && (
             <div className="flex items-center">
                <IndianRupee className="h-4 w-4 mr-2 text-accent" />
                <span className="text-sm font-semibold">{event.price > 0 ? `₹${event.price}` : 'Free'}</span>
             </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <div className="flex items-center">
          <Star className={`h-5 w-5 mr-1 ${event.averageRating && event.averageRating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
          <span className="text-sm font-semibold">
            {event.averageRating ? event.averageRating.toFixed(1) : 'N/A'}
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            ({event.ratings?.length || 0} reviews)
          </span>
        </div>
        <Button asChild size="sm" variant="outline" className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href={`/events/${event.id}`}>Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
