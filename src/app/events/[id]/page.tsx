
'use client';

import { useEffect, useState } from 'react';
import type { Event, Rating as RatingType } from '@/types/event'; // User type not directly needed here, comes from AuthContext
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // CardDescription removed
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { CalendarDays, MapPin, Star, Tag, User as UserIcon, Send, Loader2, Languages, IndianRupee, Landmark, Heart, CheckCircle, ExternalLink, UserCircle as UserCircleIcon } from 'lucide-react'; // Added ExternalLink and UserCircleIcon
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';

const MOCK_EVENTS_KARNATAKA: Event[] = [
  { 
    id: '1', name: 'Kala Utsava Bengaluru', nameKa: 'ಕಲಾ ಉತ್ಸವ ಬೆಂಗಳೂರು', 
    description: 'A grand celebration of Karnataka\'s art and culture in the heart of Bengaluru. This multi-day event features traditional music, dance performances, art exhibitions, food stalls showcasing local cuisine, and handicraft markets. A must-visit for anyone looking to experience the rich heritage of Karnataka.', 
    descriptionKa: 'ಬೆಂಗಳೂರಿನ ಹೃದಯಭಾಗದಲ್ಲಿ ಕರ್ನಾಟಕದ ಕಲೆ ಮತ್ತು ಸಂಸ್ಕೃತಿಯ ಭವ್ಯ ಆಚರಣೆ...', // Kept for data consistency, not displayed
    date: '2024-09-15', time: '10:00 AM', endDate: '2024-09-17', endTime: '08:00 PM',
    locationName: 'Vidhana Soudha Grounds', address: 'Ambedkar Veedhi, Sampangi Rama Nagara, Bengaluru, Karnataka 560001', 
    district: 'Bengaluru Urban', city: 'Bengaluru', taluk: 'Bengaluru North', pinCode: '560001',
    latitude: 12.9797, longitude: 77.5913, googleMapsUrl: 'https://maps.google.com/?q=12.9797,77.5913', localLandmark: 'Opposite to High Court of Karnataka',
    category: 'Utsava', language: 'Bilingual', culturalRelevance: ['Rajyotsava', 'Other Festival'],
    imageUrl: 'https://picsum.photos/seed/utsava_detail/1200/600', posterKaUrl: 'https://picsum.photos/seed/utsavaKA_detail/800/500',
    organizerName: 'Department of Kannada & Culture, GoK',
    createdAt: '2024-02-01', averageRating: 4.7, price: 0, registrationUrl: 'https://example.com/kala-utsava-register',
    ratings: [
      {id: 'r1', userId: 'u1', eventId: '1', rating: 5, reviewText: 'Absolutely fantastic! The performances were mesmerizing.', createdAt: '2024-09-16', updatedAt: '2024-09-16', user: { id: 'u1', username: 'CultureFan', name: 'Ananya Rao', languagePreference: 'English', photoURL: 'https://picsum.photos/seed/ananya/40/40'}},
      {id: 'r2', userId: 'u2', eventId: '1', rating: 4, reviewText: 'Great Utsava, well organized. Parking was challenging.', createdAt: '2024-09-17', updatedAt: '2024-09-17', user: { id: 'u2', username: 'BengaluruExplorer', name: 'Rohan Kumar', languagePreference: 'English'}},
    ],
    targetDistricts: ['Bengaluru Urban', 'Bengaluru Rural', 'Ramanagara']
  },
];

async function fetchEventById(id: string): Promise<Event | null> {
  return new Promise(resolve => {
    setTimeout(() => {
      const event = MOCK_EVENTS_KARNATAKA.find(e => e.id === id) || null;
      resolve(event);
    }, 500);
  });
}

async function submitReview(eventId: string, rating: number, reviewText: string, firebaseUser: import('firebase/auth').User | null): Promise<RatingType> {
   console.log("Submitting review for event:", eventId, "Rating:", rating, "Review:", reviewText);
   return new Promise(resolve => {
    setTimeout(() => {
      const newReview: RatingType = {
        id: `r${Date.now()}`,
        userId: firebaseUser?.uid || 'anonymousUser', 
        eventId,
        rating,
        reviewText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { 
            id: firebaseUser?.uid || 'anonymousUser', 
            username: firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'Anonymous', 
            name: firebaseUser?.displayName || 'Anonymous User',
            photoURL: firebaseUser?.photoURL || undefined,
            languagePreference: 'English', 
            createdAt: new Date().toISOString() 
        }
      };
      resolve(newReview);
    }, 1000);
  });
}

interface EventPageProps {
  params: { id: string };
}

export default function EventPage({ params }: EventPageProps) {
  const { currentUser, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For event data fetching
  const [error, setError] = useState<string | null>(null);
  
  const [userRating, setUserRating] = useState(0);
  const [userReviewText, setUserReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (params.id) {
      setIsLoading(true);
      fetchEventById(params.id)
        .then(data => {
          if (data) {
            setEvent(data);
            if (currentUser && data.ratings) {
              const existingReview = data.ratings.find(r => r.userId === currentUser.uid);
              if (existingReview) {
                setUserRating(existingReview.rating);
                setUserReviewText(existingReview.reviewText || '');
              }
            }
            if (typeof window !== 'undefined') { // Ensure localStorage is available
                 setIsInWatchlist(localStorage.getItem(`watchlist_${params.id}`) === 'true');
            }
          } else {
            setError('Event not found.');
          }
        })
        .catch(() => setError('Failed to load event details.'))
        .finally(() => setIsLoading(false));
    }
  }, [params.id, currentUser]);

  const handleRatingSubmit = async () => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to submit a review.", variant: "destructive" });
      return;
    }
    if (userRating === 0) {
      toast({ title: "Rating Required", description: "Please select a star rating.", variant: "destructive" });
      return;
    }
    setIsSubmittingReview(true);
    try {
      const newReview = await submitReview(params.id, userRating, userReviewText, currentUser);
      setEvent(prevEvent => {
        if (!prevEvent) return null;
        const otherReviews = prevEvent.ratings?.filter(r => r.userId !== currentUser.uid) || [];
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

  const handleToggleWatchlist = async () => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to manage your watchlist.", variant: "destructive" });
      return;
    }
    setIsWatchlistLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const newWatchlistStatus = !isInWatchlist;
    setIsInWatchlist(newWatchlistStatus);
    if (typeof window !== 'undefined') {
        if (newWatchlistStatus) {
        localStorage.setItem(`watchlist_${params.id}`, 'true');
        toast({ title: "Added to Watchlist!", description: `${event?.name} is now in your watchlist.` });
        } else {
        localStorage.removeItem(`watchlist_${params.id}`);
        toast({ title: "Removed from Watchlist", description: `${event?.name} has been removed from your watchlist.` });
        }
    }
    setIsWatchlistLoading(false);
  };

  if (isLoading || authLoading) { // Combined loading state
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
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert><AlertDescription>Event data is not available.</AlertDescription></Alert>
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
      <Card className="overflow-hidden shadow-xl bg-card">
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
            {/* Optional: Display Kannada name if available */}
            {/* {event.nameKa && <p className="text-xl md:text-2xl text-primary-foreground/80 drop-shadow-md mt-1">({event.nameKa})</p>} */}
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-primary">Event Details</h2>
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {eventDescription}
              </p>
              {/* Optional: Display Kannada description */}
              {/* {event.descriptionKa && (
                 <p className="text-foreground/80 leading-relaxed whitespace-pre-line mt-2 text-sm italic">
                    (Kannada: {event.descriptionKa})
                 </p>
              )} */}
            </section>

            {currentUser && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={handleToggleWatchlist} disabled={isWatchlistLoading} variant={isInWatchlist ? "secondary" : "default"} className="w-full sm:w-auto">
                  {isWatchlistLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isInWatchlist ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <Heart className="mr-2 h-4 w-4" />)}
                  {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>
                {event.registrationUrl && (
                    <Button asChild className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                        <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" /> Register Now
                        </a>
                    </Button>
                )}
              </div>
            )}

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">Reviews & Ratings</h2>
              {currentUser && (
                <div className="mb-6 p-4 border rounded-lg bg-secondary/30">
                  <h3 className="text-lg font-medium mb-2">
                    {event.ratings?.find(r => r.userId === currentUser.uid) ? 'Update Your Review' : 'Leave a Review'}
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
                    {event.ratings?.find(r => r.userId === currentUser.uid) ? 'Update Review' : 'Submit Review'}
                  </Button>
                </div>
              )}

              {event.ratings && event.ratings.length > 0 ? (
                <div className="space-y-4">
                  {event.ratings.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((review) => (
                    <Card key={review.id} className="bg-background">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
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
                      <CardContent className="pt-2"> {/* Adjusted padding */}
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
            <Card className="shadow-md bg-secondary/50">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
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
