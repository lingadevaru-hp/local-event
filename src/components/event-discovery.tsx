
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Event, EventCategory, DateRangeFilter, KarnatakaDistrict } from '@/types/event';
import { EventFilters } from './event-filters';
import { EventList } from './event-list';
import { useToast } from '@/hooks/use-toast';
import { getCurrentLocation, type Location } from '@/services/geolocation';
import { Loader2 } from 'lucide-react';
import { calculateDistance } from '@/lib/utils';
import { KARNATAKA_DISTRICTS, EVENT_CATEGORIES as APP_EVENT_CATEGORIES } from '@/types/event';

const MOCK_EVENTS_KARNATAKA: Event[] = [
  { 
    id: '1', name: 'Kala Utsava Bengaluru', 
    description: 'A grand celebration of Karnataka\'s art and culture in the heart of Bengaluru.', 
    date: '2024-09-15', time: '10:00 AM', 
    locationName: 'Vidhana Soudha Grounds', address: 'Ambedkar Veedhi, Sampangi Rama Nagara, Bengaluru, Karnataka 560001', 
    district: 'Bengaluru Urban', city: 'Bengaluru', latitude: 12.9797, longitude: 77.5913, 
    category: 'Utsava', language: 'Bilingual', culturalRelevance: ['Rajyotsava'],
    imageUrl: 'https://picsum.photos/seed/utsava/600/400', 
    createdAt: '2024-02-01', averageRating: 4.7, price: 0,
    ratings: [{id: 'r1', userId: 'u1', eventId: '1', rating: 5, reviewText: 'Amazing Utsava!', createdAt: '2024-09-16', updatedAt: '2024-09-16', user: {id: 'u1', username: 'CultureVulture'}}],
    targetDistricts: ['Bengaluru Urban', 'Bengaluru Rural', 'Ramanagara']
  },
  { 
    id: '2', name: 'Mysuru Dasara Tech Hackathon',
    description: 'Innovate and build during the vibrant Mysuru Dasara festivities.', 
    date: '2024-10-05', time: '09:00 AM', endDate: '2024-10-06', endTime: '06:00 PM',
    locationName: 'JSS Science and Technology University', address: 'SJCE Campus, Mysuru, Karnataka 570006', 
    district: 'Mysuru (Mysore)', city: 'Mysuru', latitude: 12.314, longitude: 76.612, 
    category: 'Hackathons', language: 'English',
    imageUrl: 'https://picsum.photos/seed/hackathon/600/400', 
    createdAt: '2024-03-01', averageRating: 4.9, price: 100, registrationUrl: '#',
    ratings: [] 
  },
   { 
    id: '3', name: 'Yakshagana Sammelana Udupi',
    description: 'A grand gathering of Yakshagana artists and enthusiasts in Udupi.', 
    date: '2024-11-20', time: '06:00 PM', 
    locationName: 'Sri Krishna Mutt Complex', address: 'Temple Car St, Udupi, Karnataka 576101', 
    district: 'Udupi', city: 'Udupi', latitude: 13.342, longitude: 74.747, 
    category: 'Yakshagana', language: 'Kannada', culturalRelevance: ['Other Festival'],
    imageUrl: 'https://picsum.photos/seed/yakshagana/600/400', 
    createdAt: '2024-04-01', averageRating: 4.5, price: 50, 
    ratings: [] 
  },
   { 
    id: '4', name: 'Hubballi Startup Meet',
    description: 'Networking event for entrepreneurs and investors in North Karnataka.', 
    date: '2024-08-30', time: '02:00 PM', 
    locationName: 'Deshpande Foundation', address: 'Plot No. 1, Hubballi, Karnataka 580029', 
    district: 'Dharwad', city: 'Hubballi', latitude: 15.3647, longitude: 75.1239, 
    category: 'Startup Meets', language: 'English',
    imageUrl: 'https://picsum.photos/seed/startupmeet/600/400', 
    createdAt: '2024-05-01', ratings: [], averageRating: 4.2, price: 250
  },
];


export function EventDiscovery() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeFilter>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<KarnatakaDistrict | 'All'>('All');

  const { toast } = useToast();

  const fetchUserLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    try {
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation(location);
      } else {
        setLocationError('Could not determine your location. Events will not be sorted by proximity.');
      }
    } catch (error) {
      setLocationError('Error getting location. Events will not be sorted by proximity.');
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    fetchUserLocation();
  }, [fetchUserLocation]);
  
  useEffect(() => {
    setIsLoadingEvents(true);
    // Simulate API call
    setTimeout(() => {
      let eventsWithDistance = MOCK_EVENTS_KARNATAKA;
      if (userLocation) {
        eventsWithDistance = MOCK_EVENTS_KARNATAKA.map(event => ({
          ...event,
          distance: calculateDistance(userLocation.lat, userLocation.lng, event.latitude, event.longitude)
        })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } else {
        eventsWithDistance = MOCK_EVENTS_KARNATAKA.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      setAllEvents(eventsWithDistance);
      setFilteredEvents(eventsWithDistance);
      setIsLoadingEvents(false);
    }, 1000);
  }, [userLocation]);


  useEffect(() => {
    let events = [...allEvents];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      events = events.filter(event =>
        event.name.toLowerCase().includes(lowerSearchTerm) ||
        (event.nameKa && event.nameKa.toLowerCase().includes(lowerSearchTerm)) ||
        event.description.toLowerCase().includes(lowerSearchTerm) ||
        event.locationName.toLowerCase().includes(lowerSearchTerm) ||
        event.category.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (selectedCategories.length > 0) {
      events = events.filter(event => selectedCategories.includes(event.category as EventCategory));
    }
    
    if (selectedDistrict !== 'All') {
        events = events.filter(event => event.district === selectedDistrict);
    }

    if (selectedDateRange !== 'All') {
        const today = new Date();
        today.setHours(0,0,0,0); 

        events = events.filter(event => {
            const eventDate = new Date(event.date);
            if (selectedDateRange === "Today") {
                return eventDate.toDateString() === today.toDateString();
            }
            if (selectedDateRange === "This Weekend") {
                const currentDay = today.getDay(); // Sunday = 0, Saturday = 6
                const saturday = new Date(today);
                saturday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -1 : 6)); // Get this week's Saturday
                saturday.setHours(0,0,0,0);

                const sunday = new Date(saturday);
                sunday.setDate(saturday.getDate() + 1);
                sunday.setHours(23,59,59,999);
                
                // If today is past this week's Sunday, then "This Weekend" should refer to next weekend.
                // This logic can be complex, for now, it means current Sat/Sun.
                // A simpler approach for "This Weekend": events on the upcoming Saturday or Sunday.
                // For simplicity, this considers events from now until end of upcoming Sunday.
                const endOfThisWeekend = new Date(today);
                endOfThisWeekend.setDate(today.getDate() + (7 - currentDay) % 7); // Go to next Sunday
                 if (currentDay === 0) endOfThisWeekend.setDate(today.getDate()); // If today is Sunday, weekend ends today
                endOfThisWeekend.setHours(23,59,59,999);
                return eventDate >= today && eventDate <= endOfThisWeekend && (eventDate.getDay() === 0 || eventDate.getDay() === 6);
            }
            if (selectedDateRange === "Next 7 Days") {
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);
                nextWeek.setHours(23,59,59,999);
                return eventDate >= today && eventDate <= nextWeek;
            }
            return true;
        });
    }

    if (userLocation) {
        events.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    } else {
        events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    setFilteredEvents(events);
  }, [searchTerm, selectedCategories, selectedDateRange, selectedDistrict, allEvents, userLocation]);


  if (isLoadingLocation && isLoadingEvents) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Finding events in Karnataka...</p>
      </div>
    );
  }

  if (locationError && !userLocation && !isLoadingLocation) {
     toast({
        title: 'Location Unavailable',
        description: `${locationError} You can still browse all events.`,
        variant: 'default',
        duration: 5000,
     });
  }
  
  return (
    <div>
      <div className="mb-6 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold mb-1 tracking-tight text-primary">Local Events</h1>
        <p className="text-muted-foreground md:text-lg">Discover exciting events happening across Karnataka.</p>
      </div>
      
      <EventFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedDateRange={selectedDateRange}
        setSelectedDateRange={setSelectedDateRange}
        availableDistricts={KARNATAKA_DISTRICTS}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        availableCategories={APP_EVENT_CATEGORIES}
      />
      
      <EventList events={filteredEvents} isLoading={isLoadingEvents || (isLoadingLocation && !userLocation)} />
    </div>
  );
}
