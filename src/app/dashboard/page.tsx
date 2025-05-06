'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Edit, BarChart2, BellRing, UploadCloud } from 'lucide-react';
import { KARNATAKA_DISTRICTS, EVENT_CATEGORIES, LANGUAGE_PREFERENCES, type KarnatakaDistrict, type EventCategory, type LanguagePreference, type Event } from '@/types/event';

// Mock existing events for the dashboard view
const mockOrganizerEvents: Event[] = [
    { 
    id: 'org_event_1', name: 'Belagavi Tech Summit 2024', nameKa: 'ಬೆಳಗಾವಿ ಟೆಕ್ ಶೃಂಗಸಭೆ ೨೦೨೪',
    description: 'A premier tech conference in North Karnataka focusing on AI and IoT.', 
    date: '2024-11-10', time: '09:00 AM', 
    locationName: 'Visvesvaraya Technological University Auditorium', address: 'Jnana Sangama, VTU Main Rd, Visvesvaraya Technological University, Machhe, Belagavi, Karnataka 590018', 
    district: 'Belagavi (Belgaum)', city: 'Belagavi', latitude: 15.8497, longitude: 74.4977, 
    category: 'Tech Fests', language: 'English',
    imageUrl: 'https://picsum.photos/seed/techsummit/600/400', 
    createdAt: '2024-07-01', price: 500,
    targetDistricts: ['Belagavi (Belgaum)', 'Dharwad', 'Vijayapura (Bijapur)']
  },
];


export default function OrganizerDashboardPage() {
  const [eventName, setEventName] = useState('');
  const [eventNameKa, setEventNameKa] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [locationName, setLocationName] = useState(''); // e.g. Kanteerava Stadium
  const [district, setDistrict] = useState<KarnatakaDistrict | ''>('');
  const [category, setCategory] = useState<EventCategory | ''>('');
  const [language, setLanguage] = useState<LanguagePreference | ''>('');
  const [targetDistricts, setTargetDistricts] = useState<KarnatakaDistrict[]>([]);
  const [posterEng, setPosterEng] = useState<File | null>(null);
  const [posterKa, setPosterKa] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [myEvents, setMyEvents] = useState<Event[]>(mockOrganizerEvents);
  const { toast } = useToast();

  const handleTargetDistrictToggle = (d: KarnatakaDistrict) => {
    setTargetDistricts(prev => 
      prev.includes(d) ? prev.filter(dist => dist !== d) : [...prev, d]
    );
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !description || !date || !time || !locationName || !district || !category || !language) {
        toast({ title: "Missing Fields", description: "Please fill all required fields for the event.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    // Simulate API call to create event
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newEvent: Event = { // Simplified, add all fields as needed
        id: `evt_${Date.now()}`,
        name: eventName, nameKa: eventNameKa, description, date, time, locationName,
        district: district as KarnatakaDistrict, city: district as any, // City needs proper handling
        latitude: 0, longitude: 0, // Needs to be fetched or entered
        category: category as EventCategory, language: language as LanguagePreference,
        createdAt: new Date().toISOString(),
        targetDistricts,
        // imageUrl based on posterEng, posterKaUrl based on posterKa
    };
    setMyEvents(prev => [newEvent, ...prev]);

    toast({ title: 'Event Created!', description: `${eventName} has been successfully created.` });
    // Reset form
    setEventName(''); setEventNameKa(''); setDescription(''); setDate(''); setTime(''); setLocationName('');
    setDistrict(''); setCategory(''); setLanguage(''); setTargetDistricts([]); setPosterEng(null); setPosterKa(null);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Organizer Dashboard (ಆಯೋಜಕರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್)</h1>
        {/* Add quick stats or links here if needed */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Event Form */}
        <Card className="lg:col-span-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><PlusCircle className="mr-2 h-6 w-6 text-accent" /> Create New Event (ಹೊಸ ಕಾರ್ಯಕ್ರಮವನ್ನು ರಚಿಸಿ)</CardTitle>
            <CardDescription>Fill in the details for your event in Karnataka.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateEvent} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="eventName">Event Name (English) *</Label><Input id="eventName" value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g., Karnataka Tech Fest" required /></div>
                <div><Label htmlFor="eventNameKa">Event Name (ಕನ್ನಡ)</Label><Input id="eventNameKa" value={eventNameKa} onChange={e => setEventNameKa(e.target.value)} placeholder="ಉದಾ., ಕರ್ನಾಟಕ ಟೆಕ್ ಫೆಸ್ಟ್" /></div>
              </div>
              <div><Label htmlFor="description">Description *</Label><Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed description of the event..." required /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="date">Date *</Label><Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
                <div><Label htmlFor="time">Time *</Label><Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required /></div>
              </div>
              <div><Label htmlFor="locationName">Venue Name *</Label><Input id="locationName" value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="e.g., Kanteerava Stadium, JSS Auditorium" required /></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="district">District (Karnataka) *</Label>
                  <Select value={district} onValueChange={v => setDistrict(v as KarnatakaDistrict)} required>
                    <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                    <SelectContent>{KARNATAKA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={v => setCategory(v as EventCategory)} required>
                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>{EVENT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Event Language *</Label>
                  <Select value={language} onValueChange={v => setLanguage(v as LanguagePreference)} required>
                    <SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger>
                    <SelectContent>{LANGUAGE_PREFERENCES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Target Districts for Notifications (Optional)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 border rounded-md max-h-40 overflow-y-auto mt-1">
                    {KARNATAKA_DISTRICTS.map(d => (
                    <div key={d} className="flex items-center space-x-2">
                        <input type="checkbox" id={`target-${d}`} checked={targetDistricts.includes(d)} onChange={() => handleTargetDistrictToggle(d)} className="form-checkbox h-4 w-4 text-primary rounded"/>
                        <Label htmlFor={`target-${d}`} className="text-sm font-normal">{d}</Label>
                    </div>
                    ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="posterEng">Poster (English/Main) <UploadCloud className="inline h-4 w-4 ml-1"/></Label>
                    <Input id="posterEng" type="file" onChange={e => setPosterEng(e.target.files ? e.target.files[0] : null)} accept="image/*" />
                </div>
                 <div>
                    <Label htmlFor="posterKa">Poster (ಕನ್ನಡ) <UploadCloud className="inline h-4 w-4 ml-1"/></Label>
                    <Input id="posterKa" type="file" onChange={e => setPosterKa(e.target.files ? e.target.files[0] : null)} accept="image/*" />
                </div>
              </div>

              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />} Create Event
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* My Events & Analytics Section */}
        <div className="space-y-8">
            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center"><BarChart2 className="mr-2 h-5 w-5 text-accent" /> Event Analytics (ಕಾರ್ಯಕ್ರಮದ ಅಂಕಿಅಂಶಗಳು)</CardTitle>
                    <CardDescription>View performance of your events. (District-wise breakdown coming soon)</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Placeholder for analytics chart or stats */}
                    <div className="text-center py-8 text-muted-foreground">
                        <BarChart2 className="mx-auto h-12 w-12 mb-2" />
                        <p>Analytics data will appear here.</p>
                        <p className="text-sm"> (e.g., Registrations by district, Views)</p>
                    </div>
                </CardContent>
            </Card>
             <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center"><BellRing className="mr-2 h-5 w-5 text-accent" /> Custom Notifications (ಕಸ್ಟಮ್ ಅಧಿಸೂಚನೆಗಳು)</CardTitle>
                    <CardDescription>Send updates to specific user groups or districts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="notificationMsg">Notification Message</Label>
                            <Textarea id="notificationMsg" placeholder="Your message for users..." />
                        </div>
                        <div>
                            <Label>Target Audience (Placeholder)</Label>
                            <Select disabled><SelectTrigger><SelectValue placeholder="Select target group/district" /></SelectTrigger></Select>
                        </div>
                        <Button className="w-full" disabled>Send Notification (Coming Soon)</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* List of My Events */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4 text-primary flex items-center"><Edit className="mr-2 h-6 w-6" /> Manage Your Events (ನಿಮ್ಮ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ನಿರ್ವಹಿಸಿ)</h2>
        {myEvents.length > 0 ? (
            <div className="space-y-4">
                {myEvents.map(event => (
                    <Card key={event.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 hover:shadow-md transition-shadow">
                        <div>
                            <h3 className="font-semibold text-lg">{event.name} {event.nameKa && `(${event.nameKa})`}</h3>
                            <p className="text-sm text-muted-foreground">{event.district} - {new Date(event.date).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="mt-2 sm:mt-0 space-x-2">
                            <Button variant="outline" size="sm"><Edit className="mr-1 h-3 w-3" /> Edit</Button>
                            <Button variant="outline" size="sm"><BarChart2 className="mr-1 h-3 w-3" /> Stats</Button>
                        </div>
                    </Card>
                ))}
            </div>
        ) : (
            <p className="text-muted-foreground">You haven&apos;t created any events yet.</p>
        )}
      </div>
    </div>
  );
}
