'use client';
import type React from 'react'; 
import { useEffect, useState, use } from 'react'; 
import type { Event, Rating as RatingType } from '@/types/event'; 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { CalendarDays, MapPin, Star, Send, Loader2, Languages, IndianRupee, Landmark, Users, Info, ArrowLeft, Ticket, Share2, Bell, ExternalLink as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion, runTransaction, Timestamp, collection } from 'firebase/firestore';
import { firestore, messaging } from '@/lib/firebase'; // messaging for future FCM
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
// For FCM, if implementing notifications
// import { getToken, onMessage } from "firebase/messaging";

async function fetchEventById(id: string): Promise<Event | null> {
  if (!firestore) {
    console.error("Firestore not initialized");
    return null;
  }
  try {
    const eventDocRef = doc(firestore, 'events', id);
    const docSnap = await getDoc(eventDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as Omit<Event, 'id' | 'createdAt'> & { createdAt: Timestamp, date: Timestamp, endDate?: Timestamp };
      return { 
        ...data, 
        id: docSnap.id, 
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        date: data.date?.toDate?.().toISOString().split('T')[0] || data.date,
        endDate: data.endDate ? (data.endDate.toDate?.().toISOString().split('T')[0] || data.endDate) : undefined,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching event from Firestore:", error);
    return null;
  }
}

// Simplified review submission, assuming appUser details are not strictly needed here or fetched separately
async function submitReviewToFirestore(eventId: string, ratingValue: number, reviewText: string, clerkUser: NonNullable<ReturnType<typeof useUser>['user']> ): Promise<RatingType> {
  if (!firestore) throw new Error("Firestore not initialized");

  const newReview: RatingType = {
    id: `r_${Date.now()}_${clerkUser.id}`,
    userId: clerkUser.id,
    eventId,
    rating: ratingValue,
    reviewText,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: { 
        id: clerkUser.id,
        username: clerkUser.username || clerkUser.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Anonymous',
        name: clerkUser.fullName || 'Anonymous User',
        photoURL: clerkUser.imageUrl || undefined,
    }
  };

  const eventDocRef = doc(firestore, 'events', eventId);

  try {
    await runTransaction(firestore, async (transaction) => {
      const eventDoc = await transaction.get(eventDocRef);
      if (!eventDoc.exists()) throw "Event document does not exist!";
      
      const currentEventData = eventDoc.data() as Event;
      const existingRatings = currentEventData.ratings || [];
      
      // Remove previous review by the same user, if any
      const otherReviews = existingRatings.filter(r => r.userId !== clerkUser.id);
      const updatedRatingsArray = [...otherReviews, newReview];
      
      const totalRatingSum = updatedRatingsArray.reduce((sum, r) => sum + r.rating, 0);
      const newAverageRating = updatedRatingsArray.length > 0 ? totalRatingSum / updatedRatingsArray.length : 0;

      transaction.update(eventDocRef, { 
        ratings: updatedRatingsArray,
        averageRating: newAverageRating 
      });
    });
    return newReview;
  } catch (error) {
    console.error("Transaction failed: ", error);
    throw error;
  }
}

interface EventPageProps {
  params: { id: string };
}

export default function EventPage({ params: paramsProp }: EventPageProps) {
  const resolvedParams = use(paramsProp); 
  const { user: clerkUser, isSignedIn, isLoaded: clerkLoaded } = useUser();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  
  const [userRating, setUserRating] = useState(0);
  const [userReviewText, setUserReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const eventId = resolvedParams.id;
    if (eventId) {
      setIsLoadingEvent(true);
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
          } else {
            setError('Event not found.');
          }
        })
        .catch((err) => {
          console.error("Error in fetchEventById promise chain:", err);
          setError('Failed to load event details.');
        })
        .finally(() => setIsLoadingEvent(false));
    }
  }, [resolvedParams.id, clerkUser, isSignedIn]);

  const handleRatingSubmit = async () => {
    if (!isSignedIn || !clerkUser) {
      toast({ title: "Login Required", description: "Please log in to submit a review.", variant: "destructive" });
      router.push(`/sign-in?redirect_url=/events/${resolvedParams.id}`);
      return;
    }
    if (userRating === 0) {
      toast({ title: "Rating Required", description: "Please select a star rating.", variant: "destructive" });
      return;
    }
    setIsSubmittingReview(true);
    try {
      const newReview = await submitReviewToFirestore(resolvedParams.id, userRating, userReviewText, clerkUser);
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

  const handleShareEvent = async () => {
    if (!event) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: `Check out this event: ${event.name} - ${event.description.substring(0,100)}...`,
          url: window.location.href,
        });
        toast({title: "Event Shared!", description: "Thanks for sharing."});
      } catch (error) {
        toast({title: "Share Failed", description: "Could not share the event.", variant: "destructive"});
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({title: "Link Copied!", description: "Event link copied to clipboard."});
      } catch (err) {
         toast({title: "Share Not Available", description: "Sharing is not available on this browser or device.", variant: "destructive"});
      }
    }
     if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
  };

  const handleSetReminder = async () => {
    // Basic FCM permission request - full implementation is more complex
    if (!messaging || !("Notification" in window)) {
        toast({ title: "Notifications Not Supported", description: "Your browser does not support push notifications.", variant: "destructive" });
        return;
    }
    if (Notification.permission === "granted") {
        // TODO: Implement logic to subscribe to event-specific topic or store token with event preference
        toast({ title: "Reminder Set!", description: "We'll notify you before the event." });
    } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            // TODO: Implement logic as above
            toast({ title: "Reminder Set!", description: "We'll notify you before the event." });
        } else {
            toast({ title: "Permission Denied", description: "You won't receive reminders for this event.", variant: "destructive" });
        }
    } else {
         toast({ title: "Notifications Blocked", description: "Please enable notifications in your browser settings.", variant: "destructive" });
    }
  };

  if (!clerkLoaded || isLoadingEvent) { 
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
         <Button variant="outline" asChild className="mt-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert><AlertDescription>Event data is not available.</AlertDescription></Alert>
         <Button variant="outline" asChild className="mt-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const displayDate = `${eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, ${event.time}`;
  const displayEndDate = event.endDate && event.endTime ? ` to ${new Date(event.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, ${event.endTime}` : '';
  const googleMapsLink = event.googleMapsUrl || (event.latitude && event.longitude ? `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}` : undefined);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="container mx-auto px-2 sm:px-4 py-8"
    >
      <div className="mb-6">
        <Button variant="outline" asChild className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </div>
      <Card className="overflow-hidden shadow-2xl bg-card/70 glassmorphism rounded-2xl border-none">
        <CardHeader className="p-0 relative">
          <Image
            src={event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/500`}
            alt={event.name}
            width={1200} height={500}
            className="w-full h-56 md:h-[400px] object-cover" priority
            data-ai-hint="event panorama"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <CardTitle className="text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-lg">
              {event.name}
            </CardTitle>
             {event.nameKa && <p className="text-lg md:text-xl text-gray-200 mt-1 drop-shadow-sm">{event.nameKa}</p>}
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-primary">Event Description</h2>
              <p className="text-foreground/90 leading-relaxed whitespace-pre-line text-base">
                {event.description}
              </p>
            </section>

            <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
                {event.registrationUrl && (
                    <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg py-3 px-6 text-base shadow-md hover:scale-105 active:scale-95 transition-all duration-200">
                        <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                            <Ticket className="mr-2 h-5 w-5" /> Register Now
                        </a>
                    </Button>
                )}
                <Button onClick={handleShareEvent} variant="outline" size="lg" className="rounded-lg py-3 px-6 text-base shadow-sm hover:shadow-md hover:bg-accent/10 transition-all duration-200">
                    <Share2 className="mr-2 h-5 w-5" /> Share Event
                </Button>
                <Button onClick={handleSetReminder} variant="outline" size="lg" className="rounded-lg py-3 px-6 text-base shadow-sm hover:shadow-md hover:bg-accent/10 transition-all duration-200">
                    <Bell className="mr-2 h-5 w-5" /> Set Reminder
                </Button>
            </div>

            <Separator className="my-8 bg-border/50" />

            <section>
              <h2 className="text-2xl font-semibold mb-6 text-primary">Reviews & Ratings</h2>
              {isSignedIn && clerkUser ? (
                <div className="mb-8 p-5 border border-border/30 rounded-xl bg-card/50 glassmorphism shadow-sm">
                  <h3 className="text-lg font-medium mb-3 text-foreground">
                    {event.ratings?.find(r => r.userId === clerkUser.id) ? 'Update Your Review' : 'Leave a Review'}
                  </h3>
                  <div className="flex items-center mb-4 space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`h-8 w-8 cursor-pointer transition-all duration-150 ${userRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50 hover:text-yellow-300'}`}
                        onClick={() => setUserRating(star)} />
                    ))}
                  </div>
                  <Textarea placeholder="Share your experience..." value={userReviewText} onChange={(e) => setUserReviewText(e.target.value)} className="mb-4 min-h-[120px] rounded-lg border-input bg-background/70 focus:border-primary" aria-label="Your review text" />
                  <Button onClick={handleRatingSubmit} disabled={isSubmittingReview || userRating === 0} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-3 text-base shadow-md hover:scale-105 active:scale-95 transition-all">
                    {isSubmittingReview ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                    {event.ratings?.find(r => r.userId === clerkUser.id) ? 'Update Review' : 'Submit Review'}
                  </Button>
                </div>
              ) : (
                <Alert className="rounded-xl border-primary/30 bg-primary/5 mb-6">
                  <Star className="h-5 w-5 text-primary" />
                  <AlertDescription className="text-foreground/80">
                    <Link href={`/sign-in?redirect_url=/events/${resolvedParams.id}`} className="font-medium text-primary hover:underline">Log in</Link> to leave a review.
                  </AlertDescription>
                </Alert>
              )}

              {event.ratings && event.ratings.length > 0 ? (
                <div className="space-y-6">
                  {event.ratings.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((review) => (
                    <Card key={review.id} className="bg-card/60 glassmorphism p-5 rounded-xl shadow-md border-border/30">
                      <CardHeader className="flex flex-row items-start justify-between pb-2 p-0 mb-3">
                        <div className="flex items-center">
                           <Avatar className="h-10 w-10 mr-3 border-2 border-primary/50">
                            <AvatarImage src={review.user?.photoURL || `https://picsum.photos/seed/${review.user?.id || 'anon'}/50/50`} alt={review.user?.name || 'User'} data-ai-hint="reviewer avatar"/>
                            <AvatarFallback className="bg-muted text-muted-foreground">{review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                             <p className="font-semibold text-foreground">{review.user?.name || review.user?.username || 'Anonymous User'}</p>
                             <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                          </div>
                        </div>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => ( <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/40'}`} /> ))}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2 p-0">
                        {review.reviewText && <p className="text-sm text-foreground/90 whitespace-pre-line">{review.reviewText}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                !isSignedIn && event.ratings?.length === 0 ? null : <p className="text-muted-foreground mt-6 text-center">No reviews yet. Be the first to leave one!</p>
              )}
            </section>
          </div>

          <aside className="md:col-span-1 space-y-6">
            <Card className="shadow-lg bg-card/50 glassmorphism p-1 rounded-xl border-none">
              <CardHeader className="pb-4 pt-5 px-5">
                <CardTitle className="text-xl font-semibold text-primary flex items-center"><Info className="mr-2 h-5 w-5"/>Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-sm px-5 pb-5">
                <InfoItem icon={CalendarDays} label="Date & Time" value={`${displayDate}${displayEndDate}`} />
                <InfoItem icon={MapPin} label="Location" value={`${event.locationName}, ${event.address}, ${event.city}, ${event.district}`} mapLink={googleMapsLink} />
                {event.guestSpeaker && <InfoItem icon={Users} label="Guest Speaker" value={event.guestSpeaker} />}
                {event.capacity !== undefined && <InfoItem icon={Users} label="Capacity" value={`Max ${event.capacity} attendees`} />}
                <InfoItem icon={IndianRupee} label="Price" value={event.price !== undefined && event.price > 0 ? `₹${event.price}` : 'Free'} boldValue />
                <InfoItem icon={Languages} label="Language" value={event.language} />
                <InfoItem icon={Star} label="Average Rating" value={event.averageRating ? `${event.averageRating.toFixed(1)} / 5 (${event.ratings?.length || 0} reviews)` : 'Not Rated Yet'} />
                {event.organizerName && <InfoItem icon={Landmark} label="Organizer" value={event.organizerName} />}
              </CardContent>
            </Card>
          </aside>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const InfoItem: React.FC<{icon: React.ElementType, label: string, value?: string | React.ReactNode, boldValue?: boolean, mapLink?: string}> = ({icon: Icon, label, value, boldValue, mapLink, children}) => {
  if (!value && !children) return null;
  return (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 mt-0.5 text-accent flex-shrink-0" />
      <div>
        <p className="font-medium text-foreground/90">{label}</p>
        {value && typeof value === 'string' ? <p className={`text-muted-foreground ${boldValue ? 'font-semibold text-foreground' : ''}`}>{value}</p> : value}
        {children}
        {mapLink && <a href={mapLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs block mt-1 flex items-center"><LinkIcon className="h-3 w-3 mr-1"/>View on Map</a>}
      </div>
    </div>
  );
};
