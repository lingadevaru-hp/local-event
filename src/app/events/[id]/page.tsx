'use client';

import { useEffect, useState } from 'react';
import type { Event, Rating as RatingType, User } from '@/types/event';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { CalendarDays, MapPin, Star, Tag, User as UserIcon, Edit3, Send, Loader2, Languages, IndianRupee, Landmark, Heart, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Mock event data - replace with actual API calls - Karnataka specific
const MOCK_EVENTS_KARNATAKA: Event[] = [
  { 
    id: '1', name: 'Kala Utsava Bengaluru', nameKa: 'ಕಲಾ ಉತ್ಸವ ಬೆಂಗಳೂರು', 
    description: 'A grand celebration of Karnataka\'s art and culture in the heart of Bengaluru. This multi-day event features traditional music, dance performances, art exhibitions, food stalls showcasing local cuisine, and handicraft markets. A must-visit for anyone looking to experience the rich heritage of Karnataka.', 
    descriptionKa: 'ಬೆಂಗಳೂರಿನ ಹೃದಯಭಾಗದಲ್ಲಿ ಕರ್ನಾಟಕದ ಕಲೆ ಮತ್ತು ಸಂಸ್ಕೃತಿಯ ಭವ್ಯ ಆಚರಣೆ. ಈ ಬಹುದಿನದ ಕಾರ್ಯಕ್ರಮವು ಸಾಂಪ್ರದಾಯಿಕ ಸಂಗೀತ, ನೃತ್ಯ ಪ್ರದರ್ಶನಗಳು, ಕಲಾ ಪ್ರದರ್ಶನಗಳು, ಸ್ಥಳೀಯ ತಿನಿಸುಗಳನ್ನು ಪ್ರದರ್ಶಿಸುವ ಆಹಾರ ಮಳಿಗೆಗಳು ಮತ್ತು ಕರಕುಶಲ ಮಾರುಕಟ್ಟೆಗಳನ್ನು ಒಳಗೊಂಡಿದೆ. ಕರ್ನಾಟಕದ ಶ್ರೀಮಂತ ಪರಂಪರೆಯನ್ನು ಅನುಭವಿಸಲು ಬಯಸುವ ಯಾರಿಗಾದರೂ ಭೇಟಿ ನೀಡಲೇಬೇಕು.',
    date: '2024-09-15', time: '10:00 AM', endDate: '2024-09-17', endTime: '08:00 PM',
    locationName: 'Vidhana Soudha Grounds', address: 'Ambedkar Veedhi, Sampangi Rama Nagara, Bengaluru, Karnataka 560001', 
    district: 'Bengaluru Urban', city: 'Bengaluru', taluk: 'Bengaluru North', pinCode: '560001',
    latitude: 12.9797, longitude: 77.5913, googleMapsUrl: 'https://maps.google.com/?q=12.9797,77.5913', localLandmark: 'Opposite to High Court of Karnataka',
    category: 'Utsava', language: 'Bilingual', culturalRelevance: ['Rajyotsava', 'Other Festival'],
    imageUrl: 'https://picsum.photos/seed/utsava_detail/1200/600', posterKaUrl: 'https://picsum.photos/seed/utsavaKA_detail/800/500',
    organizerName: 'Department of Kannada & Culture, GoK',
    createdAt: '2024-02-01', averageRating: 4.7, price: 0,
    ratings: [
      {id: 'r1', userId: 'u1', eventId: '1', rating: 5, reviewText: 'Absolutely fantastic! The performances were mesmerizing. So much to see and do.', createdAt: '2024-09-16', updatedAt: '2024-09-16', user: { id: 'u1', username: 'CultureFan', name: 'Ananya Rao', languagePreference: 'Kannada'}},
      {id: 'r2', userId: 'u2', eventId: '1', rating: 4, reviewText: 'Great Utsava, well organized. Parking was a bit challenging but worth it.', createdAt: '2024-09-17', updatedAt: '2024-09-17', user: { id: 'u2', username: 'BengaluruExplorer', name: 'Rohan Kumar', languagePreference: 'English'}},
    ],
    targetDistricts: ['Bengaluru Urban', 'Bengaluru Rural', 'Ramanagara']
  },
  // Add more mock events if needed for testing different scenarios
];

async function fetchEventById(id: string): Promise<Event | null> {
  return new Promise(resolve => {
    setTimeout(() => {
      const event = MOCK_EVENTS_KARNATAKA.find(e => e.id === id) || null;
      resolve(event);
    }, 500);
  });
}

async function submitReview(eventId: string, rating: number, reviewText: string, user: Partial<User>): Promise<RatingType> {
   console.log("Submitting review for event:", eventId, "Rating:", rating, "Review:", reviewText);
   return new Promise(resolve => {
    setTimeout(() => {
      const newReview: RatingType = {
        id: `r${Date.now()}`,
        userId: user.id || 'currentUser', 
        eventId,
        rating,
        reviewText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { 
            id: user.id || 'currentUser', 
            username: user.username || 'You', 
            name: user.name || 'You',
            languagePreference: user.languagePreference || 'English', 
            createdAt: new Date().toISOString() 
        }
      };
      resolve(newReview);
    }, 1000);
  });
}

// Mock user data
const mockCurrentUser: User = {
  id: 'devUser123',
  name: 'Developer Dave',
  username: 'DevDave',
  email: 'dave@example.com',
  languagePreference: 'English',
  district: 'Bengaluru Urban',
  city: 'Bengaluru',
  createdAt: '2023-01-01',
};


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
  const [isInWatchlist, setIsInWatchlist] = useState(false); // Mock watchlist state
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);

  // Mock authentication status - replace with actual auth check
  const isAuthenticated = true; 
  const currentUserId = mockCurrentUser.id;

  const { toast } = useToast();

  useEffect(() => {
    if (params.id) {
      setIsLoading(true);
      fetchEventById(params.id)
        .then(data => {
          if (data) {
            setEvent(data);
            const existingReview = data.ratings?.find(r => r.userId === currentUserId);
            if (existingReview) {
              setUserRating(existingReview.rating);
              setUserReviewText(existingReview.reviewText || '');
            }
            // Mock: Check if event is in watchlist
            // In a real app, this would be an API call or check local storage/state management
            setIsInWatchlist(localStorage.getItem(`watchlist_${params.id}`) === 'true');
          } else {
            setError('Event not found. ಕಾರ್ಯಕ್ರಮ ಕಂಡುಬಂದಿಲ್ಲ.');
          }
        })
        .catch(() => setError('Failed to load event details. ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.'))
        .finally(() => setIsLoading(false));
    }
  }, [params.id]);

  const handleRatingSubmit = async () => {
    if (!isAuthenticated) {
      toast({ title: "Login Required (ಲಾಗಿನ್ ಅಗತ್ಯವಿದೆ)", description: "Please log in to submit a review.", variant: "destructive" });
      return;
    }
    if (userRating === 0) {
      toast({ title: "Rating Required (ರೇಟಿಂಗ್ ಅಗತ್ಯವಿದೆ)", description: "Please select a star rating.", variant: "destructive" });
      return;
    }
    setIsSubmittingReview(true);
    try {
      const newReview = await submitReview(params.id, userRating, userReviewText, mockCurrentUser);
      setEvent(prevEvent => {
        if (!prevEvent) return null;
        const otherReviews = prevEvent.ratings?.filter(r => r.userId !== currentUserId) || [];
        const updatedRatings = [...otherReviews, newReview];
        const totalRatingSum = updatedRatings.reduce((sum, r) => sum + r.rating, 0);
        const newAverageRating = updatedRatings.length > 0 ? totalRatingSum / updatedRatings.length : 0;
        
        return { ...prevEvent, ratings: updatedRatings, averageRating: newAverageRating };
      });
      toast({ title: "Review Submitted! (ವಿಮರ್ಶೆ ಸಲ್ಲಿಸಲಾಗಿದೆ!)", description: "Your review has been successfully submitted." });
    } catch (err) {
      toast({ title: "Submission Failed (ಸಲ್ಲಿಕೆ ವಿಫಲವಾಗಿದೆ)", description: "Could not submit your review. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      toast({ title: "Login Required (ಲಾಗಿನ್ ಅಗತ್ಯವಿದೆ)", description: "Please log in to manage your watchlist.", variant: "destructive" });
      return;
    }
    setIsWatchlistLoading(true);
    // Mock API call for watchlist
    await new Promise(resolve => setTimeout(resolve, 500));
    const newWatchlistStatus = !isInWatchlist;
    setIsInWatchlist(newWatchlistStatus);
    // Mock local storage persistence
    if (newWatchlistStatus) {
      localStorage.setItem(`watchlist_${params.id}`, 'true');
      toast({ title: "Added to Watchlist! (ವೀಕ್ಷಣಾ ಪಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ!)", description: `${event?.name} is now in your watchlist.` });
    } else {
      localStorage.removeItem(`watchlist_${params.id}`);
      toast({ title: "Removed from Watchlist (ವೀಕ್ಷಣಾ ಪಟ್ಟಿಯಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ)", description: `${event?.name} has been removed from your watchlist.` });
    }
    setIsWatchlistLoading(false);
    // TODO: Implement actual push notification subscription/unsubscription for watchlist updates if needed.
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
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert><AlertDescription>Event data is not available. ಕಾರ್ಯಕ್ರಮದ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.</AlertDescription></Alert>
      </div>
    );
  }

  const displayDate = `${new Date(event.date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })} at ${event.time}`;
  const displayEndDate = event.endDate && event.endTime ? ` to ${new Date(event.endDate).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })} at ${event.endTime}` : '';

  const userPreferredLanguage = mockCurrentUser.languagePreference; // Or from actual user context

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <Card className="overflow-hidden shadow-xl bg-card">
        <CardHeader className="p-0 relative">
          <Image
            src={userPreferredLanguage === 'Kannada' && event.posterKaUrl ? event.posterKaUrl : (event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/600`)}
            alt={event.name}
            width={1200} height={600}
            className="w-full h-64 md:h-96 object-cover" priority
            data-ai-hint="event banner karnataka"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <CardTitle className="text-3xl md:text-5xl font-bold text-primary-foreground tracking-tight drop-shadow-lg">
              {userPreferredLanguage === 'Kannada' && event.nameKa ? event.nameKa : event.name}
            </CardTitle>
            {((userPreferredLanguage === 'English' && event.nameKa) || (userPreferredLanguage === 'Kannada' && event.name !== event.nameKa)) && (
              <p className="text-xl md:text-2xl text-primary-foreground/80 drop-shadow-md mt-1">
                {userPreferredLanguage === 'English' ? event.nameKa : event.name}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-primary">ವಿವರಗಳು (Event Details)</h2>
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {userPreferredLanguage === 'Kannada' && event.descriptionKa ? event.descriptionKa : event.description}
              </p>
              {((userPreferredLanguage === 'English' && event.descriptionKa) || (userPreferredLanguage === 'Kannada' && event.description !== event.descriptionKa)) && (
                 <p className="text-foreground/80 leading-relaxed whitespace-pre-line mt-2 text-sm italic">
                    ({userPreferredLanguage === 'English' ? event.descriptionKa : event.description})
                 </p>
              )}
            </section>

            {isAuthenticated && (
              <div className="mt-4">
                <Button onClick={handleToggleWatchlist} disabled={isWatchlistLoading} variant={isInWatchlist ? "secondary" : "default"} className="w-full md:w-auto">
                  {isWatchlistLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isInWatchlist ? <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : <Heart className="mr-2 h-4 w-4" />)}
                  {isInWatchlist ? 'ವೀಕ್ಷಣಾ ಪಟ್ಟಿಯಲ್ಲಿದೆ (In Watchlist)' : 'ವೀಕ್ಷಣಾ ಪಟ್ಟಿಗೆ ಸೇರಿಸಿ (Add to Watchlist)'}
                </Button>
              </div>
            )}

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">ವಿಮರ್ಶೆಗಳು ಮತ್ತು ರೇಟಿಂಗ್‌ಗಳು (Reviews & Ratings)</h2>
              {isAuthenticated && (
                <div className="mb-6 p-4 border rounded-lg bg-secondary/30">
                  <h3 className="text-lg font-medium mb-2">
                    {event.ratings?.find(r => r.userId === currentUserId) ? 'ನಿಮ್ಮ ವಿಮರ್ಶೆಯನ್ನು ನವೀಕರಿಸಿ (Update Your Review)' : 'ವಿಮರ್ಶೆಯನ್ನು ನೀಡಿ (Leave a Review)'}
                  </h3>
                  <div className="flex items-center mb-3 space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`h-7 w-7 cursor-pointer transition-colors ${userRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-300'}`}
                        onClick={() => setUserRating(star)} />
                    ))}
                  </div>
                  <Textarea placeholder="ನಿಮ್ಮ ಅನುಭವವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ (Share your experience)..." value={userReviewText} onChange={(e) => setUserReviewText(e.target.value)} className="mb-3 min-h-[100px]" aria-label="Your review text" />
                  <Button onClick={handleRatingSubmit} disabled={isSubmittingReview || userRating === 0} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {isSubmittingReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {event.ratings?.find(r => r.userId === currentUserId) ? 'ವಿಮರ್ಶೆ ನವೀಕರಿಸಿ (Update)' : 'ವಿಮರ್ಶೆ ಸಲ್ಲಿಸಿ (Submit)'}
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
                            <AvatarImage src={`https://picsum.photos/seed/${review.user?.username || review.userId}/40/40`} alt={review.user?.username || 'User'} data-ai-hint="avatar person"/>
                            <AvatarFallback>{review.user?.username ? review.user.username.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
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
                      <CardContent>
                        {review.reviewText && <p className="text-sm text-foreground whitespace-pre-line">{review.reviewText}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews yet. Be the first to leave one! (ಇನ್ನೂ ಯಾವುದೇ ವಿಮರ್ಶೆಗಳಿಲ್ಲ. ಮೊದಲಿಗರಾಗಿರಿ!)</p>
              )}
            </section>
          </div>

          <aside className="md:col-span-1 space-y-6">
            <Card className="shadow-md bg-secondary/50">
              <CardHeader>
                <CardTitle className="text-xl text-primary">ಮಾಹಿತಿ (Information)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start">
                  <CalendarDays className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                  <div><p className="font-medium">ದಿನಾಂಕ ಮತ್ತು ಸಮಯ (Date & Time)</p><p className="text-muted-foreground">{displayDate}{displayEndDate}</p></div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-medium">ಸ್ಥಳ (Location)</p>
                    <p className="text-muted-foreground">{event.locationName}</p>
                    <p className="text-muted-foreground">{event.address}</p>
                    {event.taluk && <p className="text-muted-foreground">ತಾಲ್ಲೂಕು (Taluk): {event.taluk}</p>}
                    <p className="text-muted-foreground">ಜಿಲ್ಲೆ (District): {event.district}</p>
                    {event.pinCode && <p className="text-muted-foreground">ಪಿನ್ ಕೋಡ್ (PIN): {event.pinCode}</p>}
                    {event.googleMapsUrl ? (
                        <a href={event.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs block mt-1">ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಿ (View on Google Maps)</a>
                    ) : (
                        <a href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs block mt-1">ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಿ (View on Google Maps)</a>
                    )}
                  </div>
                </div>
                {event.localLandmark && (
                    <div className="flex items-start">
                        <Landmark className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                        <div><p className="font-medium">ಸ್ಥಳೀಯ ಗುರುತು (Local Landmark)</p><p className="text-muted-foreground">{event.localLandmark}</p></div>
                    </div>
                )}
                <div className="flex items-start">
                  <Tag className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                   <div><p className="font-medium">ವರ್ಗ (Category)</p><Badge variant="outline" className="text-sm bg-primary/10 text-primary-foreground border-primary/50">{event.category}</Badge></div>
                </div>
                <div className="flex items-start">
                  <Languages className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                  <div><p className="font-medium">ಭಾಷೆ (Language of Event)</p><p className="text-muted-foreground">{event.language}</p></div>
                </div>
                {event.culturalRelevance && event.culturalRelevance.length > 0 && (
                    <div className="flex items-start">
                        <Star className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" /> {/* Re-using Star icon for cultural tag for now */}
                        <div>
                        <p className="font-medium">ಸಾಂಸ್ಕೃತಿಕ ಮಹತ್ವ (Cultural Relevance)</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {event.culturalRelevance.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                        </div>
                        </div>
                    </div>
                )}
                {event.price !== undefined && event.price !== null && (
                    <div className="flex items-start">
                        <IndianRupee className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                        <div><p className="font-medium">ಶುಲ್ಕ (Price)</p><p className="text-muted-foreground font-semibold">{event.price > 0 ? `₹${event.price}` : 'ಉಚಿತ (Free)'}</p></div>
                    </div>
                )}
                 <div className="flex items-start">
                  <Star className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-medium">ಸರಾಸರಿ ರೇಟಿಂಗ್ (Average Rating)</p>
                    <p className="text-muted-foreground">
                      {event.averageRating ? `${event.averageRating.toFixed(1)} / 5` : 'Not Rated Yet'} 
                      <span className="ml-1 text-xs">({event.ratings?.length || 0} reviews)</span>
                    </p>
                  </div>
                </div>
                {event.organizerName && (
                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 mr-3 mt-0.5 text-accent flex-shrink-0" />
                  <div><p className="font-medium">ಆಯೋಜಕರು (Organizer)</p><p className="text-muted-foreground">{event.organizerName}</p></div>
                </div>
                )}
                {event.registrationUrl && (
                    <Button asChild className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
                        <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">ನೋಂದಾಯಿಸಿ (Register Now)</a>
                    </Button>
                )}
              </CardContent>
            </Card>
          </aside>
        </CardContent>
      </Card>
    </div>
  );
}
