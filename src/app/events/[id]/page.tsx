'use client';

import { useEffect, useState } from 'react';
import type { Event, Rating as RatingType } from '@/types/event';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { CalendarDays, MapPin, Star, Tag, User, Edit3, Send, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Mock event data and functions - replace with actual API calls
const MOCK_EVENTS: Event[] = [
  { id: '1', name: 'Summer Music Fest', description: 'An amazing outdoor music festival with local bands. Enjoy live performances from upcoming artists and established names. Food trucks and craft stalls will also be available. A perfect day out for music lovers of all ages. Don\'t miss this annual highlight!', date: '2024-08-15', time: '02:00 PM', locationName: 'Central Park Amphitheater', address: '123 Park Ave, Cityville, CA 90210', latitude: 34.0522, longitude: -118.2437, category: 'Music', imageUrl: 'https://picsum.photos/seed/musicfest/800/500', createdAt: '2024-01-01', averageRating: 4.5, ratings: [
    {id: 'r1', userId: 'u1', eventId: '1', rating: 5, reviewText: 'Absolutely fantastic! The bands were incredible and the atmosphere was electric. Can\'t wait for next year!', createdAt: '2024-08-16', updatedAt: '2024-08-16', user: { id: 'u1', username: 'MusicLover22', createdAt: '2023-01-01'}},
    {id: 'r2', userId: 'u2', eventId: '1', rating: 4, reviewText: 'Great event, well organized. A bit crowded but that\'s expected. Good selection of food too.', createdAt: '2024-08-17', updatedAt: '2024-08-17', user: { id: 'u2', username: 'FestivalFan', createdAt: '2023-02-01'}},
  ]},
  { id: '2', name: 'Tech Workshop: AI & You', description: 'Learn the latest in web development and artificial intelligence. This hands-on workshop will cover fundamental concepts and practical applications. Suitable for beginners and intermediate developers.', date: '2024-07-20', time: '10:00 AM', endDate: '2024-07-20', endTime: '04:00 PM', locationName: 'Community Tech Hub', address: '456 Main St, Suite 200, Cityville, CA 90211', latitude: 34.0580, longitude: -118.2500, category: 'Workshop', imageUrl: 'https://picsum.photos/seed/techworkshop/800/500', createdAt: '2024-01-01', averageRating: 4.2, ratings: [
    {id: 'r3', userId: 'u3', eventId: '2', rating: 4, reviewText: 'Very informative and well-paced. The instructors were knowledgeable.', createdAt: '2024-07-21', updatedAt: '2024-07-21', user: { id: 'u3', username: 'CodeNewbie', createdAt: '2023-03-01'}},
  ]},
];

async function fetchEventById(id: string): Promise<Event | null> {
  return new Promise(resolve => {
    setTimeout(() => {
      const event = MOCK_EVENTS.find(e => e.id === id) || null;
      resolve(event);
    }, 500);
  });
}

async function submitReview(eventId: string, rating: number, reviewText: string): Promise<RatingType> {
   console.log("Submitting review for event:", eventId, "Rating:", rating, "Review:", reviewText);
   return new Promise(resolve => {
    setTimeout(() => {
      const newReview: RatingType = {
        id: `r${Date.now()}`,
        userId: 'currentUser', // Mock current user
        eventId,
        rating,
        reviewText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { id: 'currentUser', username: 'You', createdAt: new Date().toISOString() }
      };
      // In a real app, you'd update the event's ratings array and averageRating
      resolve(newReview);
    }, 1000);
  });
}


interface EventPageProps {
  params: { id: string };
}

export default function EventPage({ params }: EventPageProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [userRating, setUserRating] = useState(0);
  const [userReviewText, setUserReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Mock authentication status
  const isAuthenticated = true; // Set to false to test guest view
  const currentUserId = 'currentUser'; // Mock current user ID

  const { toast } = useToast();

  useEffect(() => {
    if (params.id) {
      setIsLoading(true);
      fetchEventById(params.id)
        .then(data => {
          if (data) {
            setEvent(data);
            // Check if current user has already reviewed this event
            const existingReview = data.ratings?.find(r => r.userId === currentUserId);
            if (existingReview) {
              setUserRating(existingReview.rating);
              setUserReviewText(existingReview.reviewText || '');
            }
          } else {
            setError('Event not found.');
          }
        })
        .catch(() => setError('Failed to load event details.'))
        .finally(() => setIsLoading(false));
    }
  }, [params.id]);

  const handleRatingSubmit = async () => {
    if (!isAuthenticated) {
      toast({ title: "Login Required", description: "Please log in to submit a review.", variant: "destructive" });
      return;
    }
    if (userRating === 0) {
      toast({ title: "Rating Required", description: "Please select a star rating.", variant: "destructive" });
      return;
    }
    setIsSubmittingReview(true);
    try {
      const newReview = await submitReview(params.id, userRating, userReviewText);
      setEvent(prevEvent => {
        if (!prevEvent) return null;
        // Remove old review if exists, then add new one
        const otherReviews = prevEvent.ratings?.filter(r => r.userId !== currentUserId) || [];
        const updatedRatings = [...otherReviews, newReview];
        const totalRatingSum = updatedRatings.reduce((sum, r) => sum + r.rating, 0);
        const newAverageRating = updatedRatings.length > 0 ? totalRatingSum / updatedRatings.length : 0;
        
        return {
          ...prevEvent,
          ratings: updatedRatings,
          averageRating: newAverageRating,
        };
      });
      toast({ title: "Review Submitted!", description: "Your review has been successfully submitted." });
    } catch (err) {
      toast({ title: "Submission Failed", description: "Could not submit your review. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Event data is not available.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const displayDate = `${new Date(event.date).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })} at ${event.time}`;
  const displayEndDate = event.endDate && event.endTime ? ` to ${new Date(event.endDate).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })} at ${event.endTime}` : '';


  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="p-0 relative">
          <Image
            src={event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/600`}
            alt={event.name}
            width={1200}
            height={600}
            className="w-full h-64 md:h-96 object-cover"
            priority
            data-ai-hint="event banner"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <CardTitle className="text-3xl md:text-5xl font-bold text-primary-foreground tracking-tight drop-shadow-lg">{event.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-primary">Event Details</h2>
              <p className="text-foreground leading-relaxed whitespace-pre-line">{event.description}</p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">Reviews & Ratings</h2>
              {isAuthenticated && (
                <div className="mb-6 p-4 border rounded-lg bg-secondary/30">
                  <h3 className="text-lg font-medium mb-2">
                    {event.ratings?.find(r => r.userId === currentUserId) ? 'Update Your Review' : 'Leave a Review'}
                  </h3>
                  <div className="flex items-center mb-3 space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-7 w-7 cursor-pointer transition-colors ${
                          userRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-300'
                        }`}
                        onClick={() => setUserRating(star)}
                      />
                    ))}
                  </div>
                  <Textarea
                    placeholder="Share your experience (optional)..."
                    value={userReviewText}
                    onChange={(e) => setUserReviewText(e.target.value)}
                    className="mb-3 min-h-[100px]"
                    aria-label="Your review text"
                  />
                  <Button onClick={handleRatingSubmit} disabled={isSubmittingReview || userRating === 0}>
                    {isSubmittingReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {event.ratings?.find(r => r.userId === currentUserId) ? 'Update Review' : 'Submit Review'}
                  </Button>
                </div>
              )}

              {event.ratings && event.ratings.length > 0 ? (
                <div className="space-y-4">
                  {event.ratings.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((review) => (
                    <Card key={review.id} className="bg-card">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center">
                           <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={`https://picsum.photos/seed/${review.user?.username || review.userId}/40/40`} alt={review.user?.username || 'User'} data-ai-hint="avatar person"/>
                            <AvatarFallback>{review.user?.username ? review.user.username.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                             <p className="font-semibold text-sm">{review.user?.username || 'Anonymous User'}</p>
                             <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {review.reviewText && <p className="text-sm text-foreground whitespace-pre-line">{review.reviewText}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews yet. Be the first to leave one!</p>
              )}
            </section>
          </div>

          <aside className="md:col-span-1 space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start">
                  <CalendarDays className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-muted-foreground">{displayDate}{displayEndDate}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{event.locationName}</p>
                    <p className="text-muted-foreground">{event.address}</p>
                    {/* TODO: Add link to map or embedded map */}
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs"
                    >
                      View on Google Maps
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <Tag className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                   <div>
                    <p className="font-medium">Category</p>
                    <Badge variant="secondary" className="text-sm">{event.category}</Badge>
                   </div>
                </div>
                 <div className="flex items-start">
                  <Star className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-medium">Average Rating</p>
                    <p className="text-muted-foreground">
                      {event.averageRating ? `${event.averageRating.toFixed(1)} / 5` : 'Not Rated Yet'} 
                      <span className="ml-1 text-xs">({event.ratings?.length || 0} reviews)</span>
                    </p>
                  </div>
                </div>
                {/* Optional: Organizer */}
                {/* 
                <div className="flex items-start">
                  <User className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-medium">Organizer</p>
                    <p className="text-muted-foreground">To be added</p>
                  </div>
                </div>
                */}
              </CardContent>
            </Card>
          </aside>
        </CardContent>
      </Card>
    </div>
  );
}
