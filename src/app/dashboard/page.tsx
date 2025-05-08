
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Edit, BarChart2, BellRing, UploadCloud, Link as LinkIcon, ArrowLeft, Trash2 } from 'lucide-react';
import { KARNATAKA_DISTRICTS, EVENT_CATEGORIES, LANGUAGE_PREFERENCES, type KarnatakaDistrict, type EventCategory, type LanguagePreference, type Event } from '@/types/event';
import { useAuth } from '@/contexts/authContext'; // Using Firebase Auth
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, addDoc, getDocs, query, where, serverTimestamp, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Image from 'next/image'; // For displaying posters

// Placeholder for image upload to Firebase Storage (to be implemented)
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function OrganizerDashboardPage() {
  const { currentUser, appUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState<KarnatakaDistrict | ''>('');
  const [city, setCity] = useState(''); 
  const [category, setCategory] = useState<EventCategory | ''>('');
  const [language, setLanguage] = useState<LanguagePreference | ''>('');
  const [targetDistricts, setTargetDistricts] = useState<KarnatakaDistrict[]>([]);
  const [posterEngFile, setPosterEngFile] = useState<File | null>(null); // For file input
  const [posterKaFile, setPosterKaFile] = useState<File | null>(null); // For file input
  const [posterEngUrl, setPosterEngUrl] = useState<string>(''); // For display and saving URL
  const [posterKaUrl, setPosterKaUrl] = useState<string>(''); // For display and saving URL
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  // Fetch organizer's events
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login?redirect_url=/dashboard');
    } else if (currentUser && firestore) {
      setIsLoadingEvents(true);
      const eventsCollectionRef = collection(firestore, 'events');
      const q = query(eventsCollectionRef, where('organizerId', '==', currentUser.uid));
      
      getDocs(q)
        .then(querySnapshot => {
          const userEvents: Event[] = [];
          querySnapshot.forEach(docSnap => {
            // Convert Firestore Timestamp to ISO string for date inputs
            const data = docSnap.data() as Omit<Event, 'id' | 'createdAt'> & { createdAt: Timestamp };
            userEvents.push({ 
                ...data, 
                id: docSnap.id, 
                createdAt: data.createdAt.toDate().toISOString(),
                // Ensure date fields are strings
                date: typeof data.date === 'string' ? data.date : (data.date as any as Timestamp)?.toDate?.().toISOString().split('T')[0] || '',
                endDate: typeof data.endDate === 'string' ? data.endDate : (data.endDate as any as Timestamp)?.toDate?.().toISOString().split('T')[0] || undefined,
            });
          });
          setMyEvents(userEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        })
        .catch(err => {
          console.error("Error fetching events:", err);
          toast({ title: "Error", description: "Could not fetch your events.", variant: "destructive" });
        })
        .finally(() => setIsLoadingEvents(false));
    }
  }, [currentUser, authLoading, router, toast]);

  const resetForm = () => {
    setEventName(''); setDescription(''); setDate(''); setTime(''); setEndDate(''); setEndTime('');
    setLocationName(''); setAddress(''); setDistrict(''); setCity(''); setCategory(''); 
    setLanguage(''); setTargetDistricts([]); 
    setPosterEngFile(null); setPosterKaFile(null); setPosterEngUrl(''); setPosterKaUrl('');
    setRegistrationUrl(''); setPrice(''); setLatitude(''); setLongitude('');
    setEditingEvent(null);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventName(event.name);
    setDescription(event.description);
    setDate(event.date ? event.date.toString().split('T')[0] : ''); // Ensure string format
    setTime(event.time);
    setEndDate(event.endDate ? event.endDate.toString().split('T')[0] : ''); // Ensure string format
    setEndTime(event.endTime || '');
    setLocationName(event.locationName);
    setAddress(event.address);
    setDistrict(event.district);
    setCity(event.city);
    setCategory(event.category);
    setLanguage(event.language);
    setTargetDistricts(event.targetDistricts || []);
    setPosterEngUrl(event.imageUrl || '');
    setPosterKaUrl(event.posterKaUrl || '');
    setRegistrationUrl(event.registrationUrl || '');
    setPrice(event.price !== undefined ? event.price : '');
    setLatitude(event.latitude !== undefined ? event.latitude : '');
    setLongitude(event.longitude !== undefined ? event.longitude : '');
  };

  const handleCreateOrUpdateEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (!eventName || !description || !date || !time || !locationName || !address || !district || !city || !category || !language || latitude === '' || longitude === '') {
        toast({ title: "Missing Fields", description: "Please fill all required fields (*), including latitude and longitude.", variant: "destructive" });
        return;
    }
    if (!currentUser || !firestore) {
        toast({ title: "Not Authenticated or DB Error", description: "Please log in. Database service might be unavailable.", variant: "destructive" });
        if(!currentUser) router.push('/login?redirect_url=/dashboard');
        return;
    }
    setIsSubmitting(true);
    
    // TODO: Implement actual image upload to Firebase Storage and get URLs
    // For now, we'll use placeholder URLs or existing ones if editing.
    // let finalPosterEngUrl = posterEngUrl;
    // let finalPosterKaUrl = posterKaUrl;
    // if (posterEngFile) finalPosterEngUrl = `https://picsum.photos/seed/${Date.now()}/600/400`; // Placeholder
    // if (posterKaFile) finalPosterKaUrl = `https://picsum.photos/seed/${Date.now()+1}/600/400`; // Placeholder

    // Simulate image upload and get URL
    const uploadFile = async (file: File | null): Promise<string | undefined> => {
        if (!file) return undefined;
        // In a real app, upload to Firebase Storage here and return download URL
        // For mock, create an object URL (only works locally, not for persistence)
        // return URL.createObjectURL(file); 
        return `https://picsum.photos/seed/${file.name}-${Date.now()}/600/400`; // Mock URL
    };

    const finalPosterEngUrl = posterEngFile ? await uploadFile(posterEngFile) : (editingEvent?.imageUrl || `https://picsum.photos/seed/${eventName.replace(/\s+/g, '_')}/600/400`);
    const finalPosterKaUrl = posterKaFile ? await uploadFile(posterKaFile) : editingEvent?.posterKaUrl;


    const eventData: Omit<Event, 'id' | 'createdAt' | 'averageRating' | 'ratings' | 'distance'> & { createdAt?: any } = {
        name: eventName, 
        description, 
        date: date, // Firestore will convert to Timestamp if serverTimestamp() is not used for this field
        time, 
        endDate: endDate || undefined,
        endTime: endTime || undefined,
        locationName, address,
        district: district as KarnatakaDistrict, 
        city: city, 
        latitude: parseFloat(latitude as string), 
        longitude: parseFloat(longitude as string), 
        category: category as EventCategory, 
        language: language as LanguagePreference,
        targetDistricts,
        registrationUrl: registrationUrl || undefined,
        price: typeof price === 'number' && price >= 0 ? price : undefined,
        imageUrl: finalPosterEngUrl,
        posterKaUrl: finalPosterKaUrl,
        organizerId: currentUser.uid,
        organizerName: appUser?.name || currentUser.displayName || 'Organizer',
    };

    try {
      if (editingEvent) {
        // Update existing event
        const eventDocRef = doc(firestore, 'events', editingEvent.id);
        await updateDoc(eventDocRef, eventData); // Note: createdAt is not updated
        setMyEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...ev, ...eventData, id: editingEvent.id, createdAt: editingEvent.createdAt } : ev));
        toast({ title: 'Event Updated!', description: `${eventName} has been successfully updated.` });

      } else {
        // Create new event
        eventData.createdAt = serverTimestamp(); // Use server timestamp for new events
        const docRef = await addDoc(collection(firestore, 'events'), eventData);
        const newEvent: Event = { 
            ...eventData, 
            id: docRef.id, 
            createdAt: new Date().toISOString(), // For client-side immediate display
            // Omitting averageRating, ratings, distance for new event
        };
        setMyEvents(prev => [newEvent, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        toast({ title: 'Event Created!', description: `${eventName} has been successfully created.` });
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
    if (!firestore || !currentUser) return;
    // Optional: Add a confirmation dialog here
    const confirmation = window.confirm("Are you sure you want to delete this event?");
    if (!confirmation) return;

    setIsSubmitting(true); // Use general submitting state or a specific deleting state
    try {
        const eventDocRef = doc(firestore, 'events', eventId);
        // Verify ownership before deleting, though Firestore rules should also enforce this
        // For client-side check:
        const eventToDelete = myEvents.find(ev => ev.id === eventId);
        if (eventToDelete && eventToDelete.organizerId !== currentUser.uid) {
            toast({ title: "Unauthorized", description: "You can only delete your own events.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

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


  if (authLoading) { 
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  // Redirect handled by useEffect if !currentUser after authLoading is false

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Organizer Dashboard</h1>
         <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
                {editingEvent ? <Edit className="mr-2 h-6 w-6 text-accent" /> : <PlusCircle className="mr-2 h-6 w-6 text-accent" />} 
                {editingEvent ? 'Edit Event' : 'Create New Event'}
            </CardTitle>
            <CardDescription>Fill in the details for your event in Karnataka.</CardDescription>
            {editingEvent && <Button variant="outline" size="sm" onClick={resetForm} className="mt-2 w-fit">Cancel Edit</Button>}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrUpdateEvent} className="space-y-6">
              <div><Label htmlFor="eventName">Event Name *</Label><Input id="eventName" value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g., Karnataka Tech Fest" required disabled={isSubmitting}/></div>
              <div><Label htmlFor="description">Description *</Label><Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed description of the event..." required disabled={isSubmitting} rows={4}/></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="date">Start Date *</Label><Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required disabled={isSubmitting}/></div>
                <div><Label htmlFor="time">Start Time *</Label><Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required disabled={isSubmitting}/></div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="endDate">End Date (Optional)</Label><Input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={isSubmitting}/></div>
                <div><Label htmlFor="endTime">End Time (Optional)</Label><Input id="endTime" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} disabled={isSubmitting}/></div>
              </div>
              <div><Label htmlFor="locationName">Venue Name *</Label><Input id="locationName" value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="e.g., Kanteerava Stadium" required disabled={isSubmitting}/></div>
              <div><Label htmlFor="address">Full Address *</Label><Input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, Area, Landmark" required disabled={isSubmitting}/></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="district">District (Karnataka) *</Label>
                  <Select value={district} onValueChange={v => setDistrict(v as KarnatakaDistrict)} required disabled={isSubmitting}>
                    <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                    <SelectContent>{KARNATAKA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor="city">City/Town *</Label><Input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g., Bengaluru, Mysuru" required disabled={isSubmitting}/></div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="latitude">Latitude *</Label><Input id="latitude" type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="e.g., 12.9716" required disabled={isSubmitting}/></div>
                <div><Label htmlFor="longitude">Longitude *</Label><Input id="longitude" type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="e.g., 77.5946" required disabled={isSubmitting}/></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={v => setCategory(v as EventCategory)} required disabled={isSubmitting}>
                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>{EVENT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Event Language *</Label>
                  <Select value={language} onValueChange={v => setLanguage(v as LanguagePreference)} required disabled={isSubmitting}>
                    <SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger>
                    <SelectContent>{LANGUAGE_PREFERENCES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registrationUrl">Registration Link <LinkIcon className="inline h-4 w-4 ml-1"/></Label>
                  <Input id="registrationUrl" type="url" value={registrationUrl} onChange={e => setRegistrationUrl(e.target.value)} placeholder="https://example.com/register" disabled={isSubmitting}/>
                </div>
                <div>
                  <Label htmlFor="price">Price (INR, 0 or leave empty for free)</Label>
                  <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="e.g., 100" min="0" step="any" disabled={isSubmitting}/>
                </div>
              </div>

              <div>
                <Label>Target Districts for Notifications (Optional)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2 border rounded-md max-h-40 overflow-y-auto mt-1">
                    {KARNATAKA_DISTRICTS.map(d => (
                    <div key={d} className="flex items-center space-x-2">
                        <input type="checkbox" id={`target-${d.replace(/[^a-zA-Z0-9]/g, "")}`} checked={targetDistricts.includes(d)} 
                               onChange={() => setTargetDistricts(prev => prev.includes(d) ? prev.filter(dist => dist !== d) : [...prev, d])} 
                               className="form-checkbox h-4 w-4 text-primary rounded focus:ring-accent" disabled={isSubmitting}/>
                        <Label htmlFor={`target-${d.replace(/[^a-zA-Z0-9]/g, "")}`} className="text-sm font-normal cursor-pointer">{d}</Label>
                    </div>
                    ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="posterEngFile">Poster (Main - English) <UploadCloud className="inline h-4 w-4 ml-1"/></Label>
                    <Input id="posterEngFile" type="file" onChange={e => setPosterEngFile(e.target.files ? e.target.files[0] : null)} accept="image/*" disabled={isSubmitting}/>
                    {posterEngUrl && !posterEngFile && <Image src={posterEngUrl} alt="Current English Poster" width={100} height={60} className="mt-2 rounded object-cover" data-ai-hint="event poster small"/>}
                    {posterEngFile && <p className="text-xs text-muted-foreground mt-1">New: {posterEngFile.name}</p>}
                </div>
                 <div>
                    <Label htmlFor="posterKaFile">Poster (Kannada - Optional) <UploadCloud className="inline h-4 w-4 ml-1"/></Label>
                    <Input id="posterKaFile" type="file" onChange={e => setPosterKaFile(e.target.files ? e.target.files[0] : null)} accept="image/*" disabled={isSubmitting}/>
                    {posterKaUrl && !posterKaFile && <Image src={posterKaUrl} alt="Current Kannada Poster" width={100} height={60} className="mt-2 rounded object-cover" data-ai-hint="kannada poster small"/>}
                    {posterKaFile && <p className="text-xs text-muted-foreground mt-1">New: {posterKaFile.name}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-3 text-base" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (editingEvent ? <Save className="mr-2 h-5 w-5"/> :<PlusCircle className="mr-2 h-5 w-5" />)} 
                {editingEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-8">
            <Card className="shadow-xl rounded-lg">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center"><BarChart2 className="mr-2 h-5 w-5 text-accent" /> Event Analytics</CardTitle>
                    <CardDescription>View performance of your events. (Coming soon)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <BarChart2 className="mx-auto h-12 w-12 mb-2" />
                        <p>Analytics data will appear here.</p>
                    </div>
                </CardContent>
            </Card>
             <Card className="shadow-xl rounded-lg">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center"><BellRing className="mr-2 h-5 w-5 text-accent" /> Custom Notifications</CardTitle>
                    <CardDescription>Send updates to specific user groups or districts. (Coming soon)</CardDescription>
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

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-primary flex items-center"><Edit className="mr-2 h-6 w-6" /> Manage Your Events</h2>
        {isLoadingEvents ? (
             <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">Loading your events...</p></div>
        ) : myEvents.length > 0 ? (
            <div className="space-y-4">
                {myEvents.map(event => (
                    <Card key={event.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 hover:shadow-md transition-shadow rounded-lg">
                        <div className="flex-grow mb-3 sm:mb-0">
                            <h3 className="font-semibold text-lg text-foreground">{event.name}</h3>
                            <p className="text-sm text-muted-foreground">{event.district} - {new Date(event.date).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="flex space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)} disabled={isSubmitting}><Edit className="mr-1 h-3 w-3" /> Edit</Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)} disabled={isSubmitting}><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>
                            {/* <Button variant="outline" size="sm"><BarChart2 className="mr-1 h-3 w-3" /> Stats</Button> */}
                        </div>
                    </Card>
                ))}
            </div>
        ) : (
            <p className="text-muted-foreground text-center py-4">You haven&apos;t created any events yet. Use the form above to create your first event!</p>
        )}
      </div>
    </div>
  );
}

