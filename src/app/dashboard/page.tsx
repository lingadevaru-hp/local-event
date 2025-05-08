'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Edit, BarChart2, BellRing, UploadCloud, Link as LinkIcon, ArrowLeft, Trash2, UserCircle, Save, CalendarClock, MapPinIcon, Users, IndianRupeeIcon, Globe } from 'lucide-react';
import { KARNATAKA_DISTRICTS, EVENT_CATEGORIES, LANGUAGE_PREFERENCES, type KarnatakaDistrict, type EventCategory, type LanguagePreference, type Event } from '@/types/event';
import { useUser, UserProfile, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, addDoc, getDocs, query, where, serverTimestamp, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function OrganizerDashboardPage() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(''); // Will be YYYY-MM-DD
  const [time, setTime] = useState(''); // Will be HH:MM
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [locationName, setLocationName] = useState(''); // Venue Name
  const [address, setAddress] = useState(''); // Full Address
  const [district, setDistrict] = useState<KarnatakaDistrict | ''>('');
  const [city, setCity] = useState(''); 
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [guestSpeaker, setGuestSpeaker] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [category, setCategory] = useState<EventCategory | ''>('');
  const [language, setLanguage] = useState<LanguagePreference | ''>('');
  const [posterEngFile, setPosterEngFile] = useState<File | null>(null);
  const [posterEngUrl, setPosterEngUrl] = useState<string>('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [latitude, setLatitude] = useState<number | ''>(''); // Added for completeness
  const [longitude, setLongitude] = useState<number | ''>(''); // Added for completeness

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirectUrl=/dashboard');
    } else if (isSignedIn && clerkUser && firestore) {
      setIsLoadingEvents(true);
      const eventsCollectionRef = collection(firestore, 'events');
      const q = query(eventsCollectionRef, where('organizerId', '==', clerkUser.id));
      
      getDocs(q)
        .then(querySnapshot => {
          const userEvents: Event[] = [];
          querySnapshot.forEach(docSnap => {
            const data = docSnap.data() as Omit<Event, 'id' | 'createdAt'> & { createdAt: Timestamp, date: Timestamp | string, endDate?: Timestamp | string };
            userEvents.push({ 
                ...data, 
                id: docSnap.id, 
                createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt as string,
                date: typeof data.date === 'string' ? data.date : (data.date as Timestamp)?.toDate?.().toISOString().split('T')[0] || '',
                endDate: typeof data.endDate === 'string' ? data.endDate : (data.endDate as Timestamp)?.toDate?.().toISOString().split('T')[0] || undefined,
            } as Event);
          });
          setMyEvents(userEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        })
        .catch(err => {
          console.error("Error fetching events:", err);
          toast({ title: "Error", description: "Could not fetch your events.", variant: "destructive" });
        })
        .finally(() => setIsLoadingEvents(false));
    }
  }, [isSignedIn, isLoaded, clerkUser, router, toast]);

  const resetForm = () => {
    setEventName(''); setDescription(''); setDate(''); setTime(''); setEndDate(''); setEndTime('');
    setLocationName(''); setAddress(''); setDistrict(''); setCity(''); setGoogleMapsUrl('');
    setGuestSpeaker(''); setCapacity(''); setCategory(''); setLanguage(''); 
    setPosterEngFile(null); setPosterEngUrl('');
    setRegistrationUrl(''); setPrice(''); setLatitude(''); setLongitude('');
    setEditingEvent(null);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventName(event.name);
    setDescription(event.description);
    setDate(event.date ? event.date.toString().split('T')[0] : '');
    setTime(event.time);
    setEndDate(event.endDate ? event.endDate.toString().split('T')[0] : '');
    setEndTime(event.endTime || '');
    setLocationName(event.locationName);
    setAddress(event.address);
    setDistrict(event.district);
    setCity(event.city as string); // Assuming city is string, adjust if it can be KarnatakaCity type
    setGoogleMapsUrl(event.googleMapsUrl || '');
    setGuestSpeaker(event.guestSpeaker || '');
    setCapacity(event.capacity !== undefined ? event.capacity : '');
    setCategory(event.category);
    setLanguage(event.language);
    setPosterEngUrl(event.imageUrl || '');
    setRegistrationUrl(event.registrationUrl || '');
    setPrice(event.price !== undefined ? event.price : '');
    setLatitude(event.latitude !== undefined ? event.latitude : '');
    setLongitude(event.longitude !== undefined ? event.longitude : '');
  };

  const handleCreateOrUpdateEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (!eventName || !description || !date || !time || !locationName || !address || !district || !city || !category || !language || latitude === '' || longitude === '') {
        toast({ title: "Missing Fields", description: "Please fill all required fields (*).", variant: "destructive" });
        return;
    }
    if (!isSignedIn || !clerkUser || !firestore) {
        toast({ title: "Not Authenticated or DB Error", description: "Please log in. Database service might be unavailable.", variant: "destructive" });
        if(!isSignedIn) router.push('/sign-in?redirectUrl=/dashboard');
        return;
    }
    setIsSubmitting(true);
    
    const uploadFile = async (file: File | null): Promise<string | undefined> => {
        if (!file) return undefined;
        return `https://picsum.photos/seed/${file.name}-${Date.now()}/800/600`; // Mock URL
    };

    const finalPosterEngUrl = posterEngFile ? await uploadFile(posterEngFile) : (editingEvent?.imageUrl || `https://picsum.photos/seed/${eventName.replace(/\s+/g, '_')}/800/600`);
    
    // Combine date and time for Firestore Timestamp, if storing as Timestamp
    // For simplicity with string dates from form:
    // const startDateTime = new Date(`${date}T${time}`);
    // const endDateTime = endDate && endTime ? new Date(`${endDate}T${endTime}`) : undefined;

    const eventData: Omit<Event, 'id' | 'averageRating' | 'ratings' | 'distance' | 'createdAt'> & { createdAt?: any } = {
        name: eventName, 
        description, 
        date: date, 
        time, 
        endDate: endDate || undefined,
        endTime: endTime || undefined,
        locationName, address,
        district: district as KarnatakaDistrict, 
        city: city, 
        latitude: parseFloat(latitude as string), 
        longitude: parseFloat(longitude as string), 
        googleMapsUrl: googleMapsUrl || undefined,
        guestSpeaker: guestSpeaker || undefined,
        capacity: typeof capacity === 'number' && capacity >= 0 ? capacity : undefined,
        category: category as EventCategory, 
        language: language as LanguagePreference,
        registrationUrl: registrationUrl || undefined,
        price: typeof price === 'number' && price >= 0 ? price : undefined,
        imageUrl: finalPosterEngUrl,
        organizerId: clerkUser.id,
        organizerName: clerkUser.fullName || clerkUser.username || 'Organizer',
    };

    try {
      if (editingEvent) {
        const eventDocRef = doc(firestore, 'events', editingEvent.id);
        await updateDoc(eventDocRef, eventData);
        setMyEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...ev, ...eventData, id: editingEvent.id, createdAt: editingEvent.createdAt } as Event : ev));
        toast({ title: 'Event Updated!', description: `${eventName} has been successfully updated.`, className: 'bg-green-500 text-white rounded-lg' });
      } else {
        eventData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(firestore, 'events'), eventData);
        const newEvent: Event = { 
            ...eventData, 
            id: docRef.id, 
            createdAt: new Date().toISOString(), 
        } as Event; // Cast as Event, averageRating etc. will be undefined
        setMyEvents(prev => [newEvent, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        toast({ title: 'Event Created!', description: `${eventName} has been successfully created.`, className: 'bg-green-500 text-white rounded-lg' });
      }
      resetForm();
    } catch (err) {
        console.error("Error saving event:", err);
        toast({ title: "Save Failed", description: "Could not save the event. Please try again.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    // ... (Keep existing handleDeleteEvent logic, adapt if necessary for Clerk user ID)
    if (!firestore || !clerkUser) return;
    const confirmation = window.confirm("Are you sure you want to delete this event?");
    if (!confirmation) return;

    setIsSubmitting(true);
    try {
        const eventDocRef = doc(firestore, 'events', eventId);
        await deleteDoc(eventDocRef);
        setMyEvents(prev => prev.filter(ev => ev.id !== eventId));
        toast({ title: "Event Deleted", description: "The event has been successfully deleted." });
    } catch (error) {
        console.error("Error deleting event:", error);
        toast({ title: "Delete Failed", description: "Could not delete the event.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!isLoaded || isLoadingEvents && !clerkUser) { 
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="container mx-auto px-4 py-8"
    >
       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Event Dashboard</h1>
         <Button variant="outline" asChild className="rounded-lg shadow-sm hover:shadow-md">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
        <Card className="shadow-xl rounded-2xl bg-card/70 glassmorphism border-none">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center text-foreground">
                {editingEvent ? <Edit className="mr-2 h-6 w-6 text-accent" /> : <PlusCircle className="mr-2 h-6 w-6 text-accent" />} 
                {editingEvent ? 'Edit Event' : 'Create New Event'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">Fill in the details for your event in Karnataka.</CardDescription>
            {editingEvent && <Button variant="outline" size="sm" onClick={resetForm} className="mt-2 w-fit rounded-lg">Cancel Edit</Button>}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrUpdateEvent} className="space-y-6">
              {/* Event Name */}
              <div><Label htmlFor="eventName" className="text-foreground/80">Event Name *</Label><Input id="eventName" value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g., Karnataka Tech Summit" required disabled={isSubmitting} className="bg-background/70 rounded-lg focus:border-primary"/></div>
              {/* Description */}
              <div><Label htmlFor="description" className="text-foreground/80">Description *</Label><Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed event description..." required disabled={isSubmitting} rows={4} className="bg-background/70 rounded-lg focus:border-primary"/></div>
              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="date" className="text-foreground/80">Start Date * <CalendarClock className="inline h-4 w-4 ml-1"/></Label><Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required disabled={isSubmitting} className="bg-background/70 rounded-lg focus:border-primary"/></div>
                <div><Label htmlFor="time" className="text-foreground/80">Start Time *</Label><Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required disabled={isSubmitting} className="bg-background/70 rounded-lg focus:border-primary"/></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="endDate" className="text-foreground/80">End Date (Optional) <CalendarClock className="inline h-4 w-4 ml-1"/></Label><Input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={isSubmitting} className="bg-background/70 rounded-lg focus:border-primary"/></div>
                <div><Label htmlFor="endTime" className="text-foreground/80">End Time (Optional)</Label><Input id="endTime" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} disabled={isSubmitting} className="bg-background/70 rounded-lg focus:border-primary"/></div>
              </div>
              {/* Location */}
              <div><Label htmlFor="locationName" className="text-foreground/80">Venue Name * <MapPinIcon className="inline h-4 w-4 ml-1"/></Label><Input id="locationName" value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="e.g., Palace Grounds" required disabled={isSubmitting} className="bg-background/70 rounded-lg focus:border-primary"/></div>
              <div><Label htmlFor="address" className="text-foreground/80">Full Address *</Label><Input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, Area, Landmark" required disabled={isSubmitting} className="bg-background/70 rounded-lg focus:border-primary"/></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="district" className="text-foreground/80">District (Karnataka) *</Label>
                  <Select value={district} onValueChange={v => setDistrict(v as KarnatakaDistrict)} required disabled={isSubmitting}>
                    <SelectTrigger className="bg-background/70 rounded-lg focus:border-primary"><SelectValue placeholder="Select District" /></SelectTrigger>
                    <SelectContent className="bg-popover glassmorphism">{KARNATAKA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor="city" className="text-foreground/80">City/Town *</Label><Input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g., Bengaluru, Mysuru" required disabled={isSubmitting} className="bg-background/70 rounded-lg focus:border-primary"/></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="latitude" className="text-foreground/80">Latitude *</Label><Input id="latitude" type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="e.g., 12.9716" required disabled={isSubmitting} className="bg-background/70 rounded-lg"/></div>
                <div><Label htmlFor="longitude" className="text-foreground/80">Longitude *</Label><Input id="longitude" type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="e.g., 77.5946" required disabled={isSubmitting} className="bg-background/70 rounded-lg"/></div>
              </div>
              <div><Label htmlFor="googleMapsUrl" className="text-foreground/80">Google Maps Link <Globe className="inline h-4 w-4 ml-1"/></Label><Input id="googleMapsUrl" type="url" value={googleMapsUrl} onChange={e => setGoogleMapsUrl(e.target.value)} placeholder="https://maps.app.goo.gl/..." disabled={isSubmitting} className="bg-background/70 rounded-lg"/></div>
              {/* Guest Speaker & Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="guestSpeaker" className="text-foreground/80">Guest Speaker (Optional) <Users className="inline h-4 w-4 ml-1"/></Label><Input id="guestSpeaker" value={guestSpeaker} onChange={e => setGuestSpeaker(e.target.value)} placeholder="e.g., Dr. Vani Kola" disabled={isSubmitting} className="bg-background/70 rounded-lg"/></div>
                <div><Label htmlFor="capacity" className="text-foreground/80">Capacity (Optional)</Label><Input id="capacity" type="number" value={capacity} onChange={e => setCapacity(e.target.value === '' ? '' : parseInt(e.target.value))} placeholder="e.g., 200" min="0" disabled={isSubmitting} className="bg-background/70 rounded-lg"/></div>
              </div>
              {/* Category & Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-foreground/80">Category *</Label>
                  <Select value={category} onValueChange={v => setCategory(v as EventCategory)} required disabled={isSubmitting}>
                    <SelectTrigger className="bg-background/70 rounded-lg focus:border-primary"><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent className="bg-popover glassmorphism">{EVENT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language" className="text-foreground/80">Event Language *</Label>
                  <Select value={language} onValueChange={v => setLanguage(v as LanguagePreference)} required disabled={isSubmitting}>
                    <SelectTrigger className="bg-background/70 rounded-lg focus:border-primary"><SelectValue placeholder="Select Language" /></SelectTrigger>
                    <SelectContent className="bg-popover glassmorphism">{LANGUAGE_PREFERENCES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              {/* Registration & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="registrationUrl" className="text-foreground/80">Registration Link <LinkIcon className="inline h-4 w-4 ml-1"/></Label>
                    <Input id="registrationUrl" type="url" value={registrationUrl} onChange={e => setRegistrationUrl(e.target.value)} placeholder="https://example.com/register" disabled={isSubmitting} className="bg-background/70 rounded-lg"/>
                </div>
                <div>
                    <Label htmlFor="price" className="text-foreground/80">Price (INR, 0 or empty for free) <IndianRupeeIcon className="inline h-4 w-4 ml-1"/></Label>
                    <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="e.g., 500" min="0" step="any" disabled={isSubmitting} className="bg-background/70 rounded-lg"/>
                </div>
              </div>
              {/* Poster */}
              <div>
                  <Label htmlFor="posterEngFile" className="text-foreground/80">Poster Image <UploadCloud className="inline h-4 w-4 ml-1"/></Label>
                  <Input id="posterEngFile" type="file" onChange={e => setPosterEngFile(e.target.files ? e.target.files[0] : null)} accept="image/*" disabled={isSubmitting} className="bg-background/70 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"/>
                  {posterEngUrl && !posterEngFile && <Image src={posterEngUrl} alt="Current Poster" width={100} height={75} className="mt-2 rounded-md object-cover shadow-md" data-ai-hint="event poster preview" />}
                  {posterEngFile && <p className="text-xs text-muted-foreground mt-1">New: {posterEngFile.name}</p>}
              </div>

              <Button type="submit" className="w-full bg-green-600 text-white hover:bg-green-700 py-3 text-base rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all duration-200" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (editingEvent ? <Save className="mr-2 h-5 w-5"/> :<PlusCircle className="mr-2 h-5 w-5" />)} 
                {editingEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
        {/* Profile Section and Other Dashboard Widgets */}
        <div className="space-y-8">
            <Card className="shadow-xl rounded-2xl bg-card/70 glassmorphism border-none">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center text-foreground"><UserCircle className="mr-2 h-6 w-6 text-accent" /> Your Profile</CardTitle>
                    <CardDescription className="text-muted-foreground">Manage your account details.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    {clerkUser && (
                        <>
                            <UserButton afterSignOutUrl="/" appearance={{
                                elements: { avatarBox: "h-20 w-20", userButtonPopoverCard: "shadow-xl rounded-lg glassmorphism" }
                            }}/>
                            <p className="font-semibold text-lg text-foreground">{clerkUser.fullName || clerkUser.username}</p>
                            <p className="text-sm text-muted-foreground">{clerkUser.primaryEmailAddress?.emailAddress}</p>
                            <Button variant="outline" asChild className="rounded-lg">
                                <Link href="/user">Edit Profile</Link>
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
             <Card className="shadow-xl rounded-2xl bg-card/70 glassmorphism border-none">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center text-foreground"><BellRing className="mr-2 h-5 w-5 text-accent" /> Custom Notifications</CardTitle>
                    <CardDescription className="text-muted-foreground">Send updates to users. (Coming soon)</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="text-center py-8 text-muted-foreground">
                        <BellRing className="mx-auto h-12 w-12 mb-2" />
                        <p>Notification controls will appear here.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Manage Your Events Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-primary flex items-center"><Edit className="mr-2 h-6 w-6" /> Manage Your Events</h2>
        {isLoadingEvents ? (
             <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2 text-muted-foreground">Loading your events...</p></div>
        ) : myEvents.length > 0 ? (
            <div className="space-y-4">
                {myEvents.map(event => (
                    <Card key={event.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 hover:shadow-lg transition-shadow rounded-xl bg-card/60 glassmorphism">
                        <div className="flex-grow mb-3 sm:mb-0">
                            <h3 className="font-semibold text-lg text-foreground">{event.name}</h3>
                            <p className="text-sm text-muted-foreground">{event.district} - {new Date(event.date).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)} disabled={isSubmitting} className="rounded-lg"><Edit className="mr-1 h-3 w-3" /> Edit</Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)} disabled={isSubmitting} className="rounded-lg"><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>
                        </div>
                    </Card>
                ))}
            </div>
        ) : (
            <p className="text-muted-foreground text-center py-4">You haven&apos;t created any events yet. Use the form above to create your first event!</p>
        )}
      </div>
    </motion.div>
  );
}
