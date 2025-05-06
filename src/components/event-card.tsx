import type { Event } from '@/types/event';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, MapPin, Star, Tag, Users, Languages, IndianRupee, Landmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const displayDate = new Date(event.date).toLocaleDateString('en-IN', { // Using en-IN for broader Indian date format
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
            data-ai-hint="event image"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/events/${event.id}`}>
          <CardTitle className="text-xl mb-1 hover:text-primary transition-colors">
            {event.name}
          </CardTitle>
          {event.nameKa && <p className="text-sm text-muted-foreground mb-2">{event.nameKa}</p>}
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
               {/* Using an inline SVG for compass-like icon as per guideline example */}
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 text-accent"><path d="M4 10c0 4.4 4 8 8 8s8-3.6 8-8c0-4.4-4-8-8-8s-8 3.6-8 8Z"/><path d="M16 10c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4Z"/><path d="M12 2v3"/><path d="M12 20v-3"/><path d="m6.4 7.4-.8-.8"/><path d="m18.4 16.4-.8-.8"/><path d="M4 12H1"/><path d="M23 12h-3"/><path d="m6.4 16.6.8-.8"/><path d="m18.4 7.6.8-.8"/></svg>
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
          <Link href={`/events/${event.id}`}>ವಿವರಗಳು (Details)</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
