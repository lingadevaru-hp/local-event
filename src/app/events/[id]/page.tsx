
'use client';
import type React from 'react'; 
import { useEffect, useState, use } from 'react'; 
import type { Event, Rating as RatingType } from '@/types/event'; //Removed AppUser as it's covered by Clerk
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { CalendarDays, MapPin, Star, Tag, User as UserIcon, Send, Loader2, Languages, IndianRupee, Landmark, Heart, CheckCircle, ExternalLink, UserCircle as UserCircleIcon, ArrowLeft, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MOCK_EVENTS_DATA } from '@/lib/mockEvents'; 

async function fetchEventById(id: string): Promise<Event | null> {
  console.log("Fetching event by ID:", id);
  return new Promise(resolve => {
    setTimeout(() => {
      const event = MOCK_EVENTS_DATA.find(e => e.id === id) || null;
      if (event) console.log("Event found:", event.name);
      else console.log("Event not found for ID:", id);
      resolve(event);
    }, 500);
  });
}

async function submitReview(eventId: string, rating: number, reviewText: string, clerkUser: ReturnType<typeof useUser>['user']): Promise<RatingType> {
   console.log("Submitting review for event:", eventId, "Rating:", rating, "Review:", reviewText);
   return new Promise(resolve => {
    setTimeout(() => {
      const newReview: RatingType = {
        id: `r${Date.now()}`,
        userId: clerkUser?.id || 'anonymousUser', 
        eventId,
        rating,
        reviewText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { 
            id: clerkUser?.id || 'anonymousUser', 
            username: clerkUser?.username || clerkUser?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Anonymous', 
            name: clerkUser?.fullName || 'Anonymous User',
            photoURL: clerkUser?.imageUrl || undefined,
            languagePreference: 'English', 
        }
      };
      const eventIndex = MOCK_EVENTS_DATA.findIndex(e => e.id === eventId);
      if (eventIndex > -1) {
        const existingRatings = MOCK_EVENTS_DATA[eventIndex].ratings || [];
        const userPreviousReviewIndex = existingRatings.findIndex(r => r.userId === newReview.userId);
        if(userPreviousReviewIndex > -1) {
            MOCK_EVENTS_DATA[eventIndex].ratings![userPreviousReviewIndex] = newReview;
        } else {
            MOCK_EVENTS_DATA[eventIndex].ratings = [...existingRatings, newReview];
        }
        const totalRatingSum = MOCK_EVENTS_DATA[eventIndex].ratings!.reduce((sum, r) => sum + r.rating, 0);
        MOCK_EVENTS_DATA[eventIndex].averageRating = MOCK_EVENTS_DATA[eventIndex].ratings!.length > 0 ? totalRatingSum / MOCK_EVENTS_DATA[eventIndex].ratings!.length : 0;
      }
      resolve(newReview);
    }, 1000);
  });
}

async function signUpForEvent(eventId: string, userId: string): Promise<{ success: boolean; message: string }> {
    console.log(`User ${userId} signing up for event ${eventId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            const success = Math.random() > 0.1; 
            if (success) {
                console.log(`User ${userId} successfully signed up for event ${eventId}`);
                resolve({ success: true, message: "Successfully signed up for the event!" });
            } else {
                resolve({ success: false, message: "Failed to sign up for the event. Please try again." });
            }
        }, 1000);
    });
}


interface EventPageProps {
  params: { id: string };
}

export default function EventPage({ params: paramsProp }: EventPageProps) {
  const params = use(paramsProp); 
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  
  const [userRating, setUserRating] = useState(0);
  const [userReviewText, setUserReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const eventId = params.id;
    if (eventId) {
      setIsLoading(true);
      setError(null); 
      fetchEventById(eventId)
        .then(data => {
          if (data) {
            setEvent(data);
            if (isSignedIn && clerkUser && data.ratings) {
              const existingReview = data.ratings.find(r => r.userId === clerkUser.id);
              if (existingReview) {
                setUserRating(existingReview.rating);
                setUserReviewText(existingReview.reviewText || '');
              }
            }
            if (typeof window !== 'undefined') {
                 setIsInWatchlist(localStorage.getItem(`watchlist_${eventId}_${clerkUser?.id || 'guest'}`) === 'true');
            }
          } else {
            setError('Event not found.');
          }
        })
        .catch(() => setError('Failed to load event details.'))
        .finally(() => setIsLoading(false));
    }
  }, [params.id, clerkUser, isSignedIn]);

  const handleRatingSubmit = async () => {
    if (!isSignedIn || !clerkUser) {
      toast({ title: "Login Required", description: "Please log in to submit a review.", variant: "destructive" });
      router.push(`/sign-in?redirect_url=/events/${params.id}`);
      return;
    }
    if (userRating === 0) {
      toast({ title: "Rating Required", description: "Please select a star rating.", variant: "destructive" });
      return;
    }
    setIsSubmittingReview(true);
    try {
      const newReview = await submitReview(params.id, userRating, userReviewText, clerkUser);
      setEvent(prevEvent => {
        if (!prevEvent) return null;
        const otherReviews = prevEvent.ratings?.filter(r => r.userId !== clerkUser.id) || [];
        const updatedRatings = [...otherReviews, newReview];
        const totalRatingSum = updatedRatings.reduce((sum, r) => sum + r.rating, 0);
        const newAverageRating = updatedRatings.length > 0 ? totalRatingSum / updatedRatings.length : 0;
        
        return { ...prevEvent, ratings: updatedRatings, averageRating: newAverageRating };
      });
      toast({ title: "Review Submitted!", description: "Your review has been successfully submitted." });
    } catch (err) {
      toast({ title: "Submission Failed", description: "Could not submit your review. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEventSignUp = async () => {
    if (!isSignedIn || !clerkUser) {
        toast({ title: "Login Required", description: "Please log in to sign up for this event.", variant: "destructive" });
        router.push(`/sign-in?redirect_url=/events/${params.id}`);
        return;
    }
    setIsSigningUp(true);
    const result = await signUpForEvent(params.id, clerkUser.id);
    if (result.success) {
        toast({ title: "Event Signup Successful", description: result.message });
    } else {
        toast({ title: "Event Signup Failed", description: result.message, variant: "destructive" });
    }
    setIsSigningUp(false);
  };

  const handleToggleWatchlist = async () => {
    if (!isSignedIn || !clerkUser) {
      toast({ title: "Login Required", description: "Please log in to manage your watchlist.", variant: "destructive" });
      router.push(`/sign-in?redirect_url=/events/${params.id}`);
      return;
    }
    setIsWatchlistLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const newWatchlistStatus = !isInWatchlist;
    const watchlistItemKey = `watchlist_${params.id}_${clerkUser.id}`; 
    setIsInWatchlist(newWatchlistStatus);
    if (typeof window !== 'undefined') {
        if (newWatchlistStatus) {
        localStorage.setItem(watchlistItemKey, 'true');
        toast({ title: "Added to Watchlist!", description: `${event?.name} is now in your watchlist.` });
        } else {
        localStorage.removeItem(watchlistItemKey);
        toast({ title: "Removed from Watchlist", description: `${event?.name} has been removed from your watchlist.` });
        }
    }
    setIsWatchlistLoading(false);
  };

  if (!isLoaded || isLoading) { 
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
         <Button variant="outline" asChild className="mt-4">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert><AlertDescription>Event data is not available.</AlertDescription></Alert>
         <Button variant="outline" asChild className="mt-4">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </div>
    );
  }

  const displayDate = `${new Date(event.date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })} at ${event.time}`;
  const displayEndDate = event.endDate && event.endTime ? ` to ${new Date(event.endDate).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })} at ${event.endTime}` : '';

  const eventImage = event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/600`;
  const eventTitle = event.name;
  const eventDescription = event.description;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </div>
      <Card className="overflow-hidden shadow-xl bg-card rounded-lg">
        <CardHeader className="p-0 relative">
          <Image
            src={eventImage}
            alt={event.name}
            width={1200} height={600}
            className="w-full h-64 md:h-96 object-cover" priority
            data-ai-hint="event banner"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <CardTitle className="text-3xl md:text-5xl font-bold text-primary-foreground tracking-tight drop-shadow-lg">
              {eventTitle}
            </CardTitle>
             {event.nameKa && <p className="text-lg md:text-xl text-primary-foreground/90 mt-1 drop-shadow-sm">{event.nameKa}</p>}
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-primary">Event Description</h2>
              <p className="text-foreground leading-relaxed whitespace-pre-line text-base">
                {eventDescription}
              </p>
              {event.descriptionKa && (
                <div className="mt-4 p-3 bg-secondary/30 rounded-md">
                    <h3 className="text-lg font-medium text-primary mb-1">Description (Kannada)</h3>
                    <p className="text-foreground leading-relaxed whitespace-pre-line text-base">{event.descriptionKa}</p>
                </div>
              )}
            </section>

            
            <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3">
                <Button onClick={handleEventSignUp} disabled={isSigningUp} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                    {isSigningUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ticket className="mr-2 h-4 w-4" />}
                    Sign Up for Event
                </Button>
                {isSignedIn && (
                    <Button onClick={handleToggleWatchlist} disabled={isWatchlistLoading} variant={isInWatchlist ? "secondary" : "outline"} className="w-full sm:w-auto">
                    {isWatchlistLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isInWatchlist ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <Heart className="mr-2 h-4 w-4" />)}
                    {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                    </Button>
                )}
                {event.registrationUrl && (
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" /> Official Registration
                        </a>
                    </Button>
                )}
            </div>


            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">Reviews & Ratings</h2>
              {isSignedIn && clerkUser ? (
                <div className="mb-6 p-4 border rounded-lg bg-secondary/30">
                  <h3 className="text-lg font-medium mb-2">
                    {event.ratings?.find(r => r.userId === clerkUser.id) ? 'Update Your Review' : 'Leave a Review'}
                  </h3>
                  <div className="flex items-center mb-3 space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`h-7 w-7 cursor-pointer transition-colors ${userRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-300'}`}
                        onClick={() => setUserRating(star)} />
                    ))}
                  </div>
                  <Textarea placeholder="Share your experience..." value={userReviewText} onChange={(e) => setUserReviewText(e.target.value)} className="mb-3 min-h-[100px]" aria-label="Your review text" />
                  <Button onClick={handleRatingSubmit} disabled={isSubmittingReview || userRating === 0} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {isSubmittingReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {event.ratings?.find(r => r.userId === clerkUser.id) ? 'Update Review' : 'Submit Review'}
                  </Button>
                </div>
              ) : (
                <Alert>
                  <Star className="h-4 w-4" />
                  <AlertDescription>
                    <Link href={`/sign-in?redirect_url=/events/${params.id}`} className="font-medium text-primary hover:underline">Log in</Link> to leave a review or sign up for this event.
                  </AlertDescription>
                </Alert>
              )}

              {event.ratings && event.ratings.length > 0 ? (
                <div className="space-y-4">
                  {event.ratings.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((review) => (
                    <Card key={review.id} className="bg-background/80 p-4 rounded-md shadow">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 p-0 mb-2">
                        <div className="flex items-center">
                           <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={review.user?.photoURL || `https://picsum.photos/seed/${review.user?.username || review.userId}/40/40`} alt={review.user?.name || 'User'} data-ai-hint="avatar person"/>
                            <AvatarFallback>{review.user?.name ? review.user.name.charAt(0).toUpperCase() : <UserCircleIcon className="h-5 w-5"/>}</AvatarFallback>
                          </Avatar>
                          <div>
                             <p className="font-semibold text-sm">{review.user?.name || review.user?.username || 'Anonymous User'}</p>
                             <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => ( <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} /> ))}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2 p-0">
                        {review.reviewText && <p className="text-sm text-foreground whitespace-pre-line">{review.reviewText}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                !isSignedIn && event.ratings?.length === 0 ? null : <p className="text-muted-foreground mt-4">No reviews yet. Be the first to leave one!</p>
              )}
            </section>
          </div>

          <aside className="md:col-span-1 space-y-6">
            <Card className="shadow-md bg-secondary/50 p-1 rounded-lg">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-xl text-primary">Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm px-4 pb-4">
                <div className="flex items-start">
                  <CalendarDays className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                  <div><p className="font-medium">Date & Time</p><p className="text-muted-foreground">{displayDate}{displayEndDate}</p></div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{event.locationName}</p>
                    <p className="text-muted-foreground">{event.address}</p>
                    {event.taluk && <p className="text-muted-foreground">Taluk: {event.taluk}</p>}
                    <p className="text-muted-foreground">District: {event.district}</p>
                    {event.pinCode && <p className="text-muted-foreground">PIN: {event.pinCode}</p>}
                    { (event.googleMapsUrl || (event.latitude && event.longitude)) &&
                        <a 
                            href={event.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`} 
                            target="_blank" rel="noopener noreferrer" 
                            className="text-primary hover:underline text-xs block mt-1">
                                View on Google Maps
                        </a>
                    }
                  </div>
                </div>
                {event.localLandmark && (
                    <div className="flex items-start">
                        <Landmark className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                        <div><p className="font-medium">Local Landmark</p><p className="text-muted-foreground">{event.localLandmark}</p></div>
                    </div>
                )}
                <div className="flex items-start">
                  <Tag className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                   <div><p className="font-medium">Category</p><Badge variant="outline" className="text-sm bg-primary/10 text-primary-foreground border-primary/50">{event.category}</Badge></div>
                </div>
                <div className="flex items-start">
                  <Languages className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                  <div><p className="font-medium">Language of Event</p><p className="text-muted-foreground">{event.language}</p></div>
                </div>
                {event.culturalRelevance && event.culturalRelevance.length > 0 && (
                    <div className="flex items-start">
                        <Star className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                        <div>
                        <p className="font-medium">Cultural Relevance</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {event.culturalRelevance.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                        </div>
                        </div>
                    </div>
                )}
                {event.price !== undefined && event.price !== null && (
                    <div className="flex items-start">
                        <IndianRupee className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                        <div><p className="font-medium">Price</p><p className="text-muted-foreground font-semibold">{event.price > 0 ? `₹${event.price}` : 'Free'}</p></div>
                    </div>
                )}
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
                {event.organizerName && (
                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                  <div><p className="font-medium">Organizer</p><p className="text-muted-foreground">{event.organizerName}</p></div>
                </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </CardContent>
      </Card>
    </div>
  );
}
