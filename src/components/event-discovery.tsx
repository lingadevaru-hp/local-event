'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Event, EventCategory, DateRangeFilter, KarnatakaDistrict, KarnatakaCity } from '@/types/event';
import { EventFilters } from './event-filters';
import { EventList } from './event-list';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getCurrentLocation, type Location } from '@/services/geolocation';
import { Loader2, MapPinOff, RefreshCw } from 'lucide-react';
import { calculateDistance } from '@/lib/utils';
import { KARNATAKA_DISTRICTS, EVENT_CATEGORIES as APP_EVENT_CATEGORIES } from '@/types/event';

// Mock event data - replace with actual API calls
// Updated to include Karnataka-specific fields
const MOCK_EVENTS_KARNATAKA: Event[] = [
  { 
    id: '1', name: 'Kala Utsava Bengaluru', nameKa: 'ಕಲಾ ಉತ್ಸವ ಬೆಂಗಳೂರು', 
    description: 'A grand celebration of Karnataka\'s art and culture in the heart of Bengaluru.', 
    date: '2024-09-15', time: '10:00 AM', 
    locationName: 'Vidhana Soudha Grounds', address: 'Ambedkar Veedhi, Sampangi Rama Nagara, Bengaluru, Karnataka 560001', 
    district: 'Bengaluru Urban', city: 'Bengaluru', latitude: 12.9797, longitude: 77.5913, 
    category: 'Utsava', language: 'Bilingual', culturalRelevance: ['Rajyotsava'],
    imageUrl: 'https://picsum.photos/seed/utsava/600/400', 
    posterKaUrl: 'https://picsum.photos/seed/utsavaKA/600/400',
    createdAt: '2024-02-01', averageRating: 4.7, price: 0,
    ratings: [{id: 'r1', userId: 'u1', eventId: '1', rating: 5, reviewText: 'Amazing Utsava!', createdAt: '2024-09-16', updatedAt: '2024-09-16', user: {id: 'u1', username: 'CultureVulture'}}],
    targetDistricts: ['Bengaluru Urban', 'Bengaluru Rural', 'Ramanagara']
  },
  { 
    id: '2', name: 'Mysuru Dasara Tech Hackathon', nameKa: 'ಮೈಸೂರು ದಸರಾ ಟೆಕ್ ಹ್ಯಾಕಥಾನ್',
    description: 'Innovate and build during the vibrant Mysuru Dasara festivities. Themes related to local challenges.', 
    date: '2024-10-05', time: '09:00 AM', endDate: '2024-10-06', endTime: '06:00 PM',
    locationName: 'JSS Science and Technology University', address: 'SJCE Campus, Mysuru, Karnataka 570006', 
    district: 'Mysuru (Mysore)', city: 'Mysuru', latitude: 12.314, longitude: 76.612, 
    category: 'Hackathons', language: 'English',
    imageUrl: 'https://picsum.photos/seed/hackathon/600/400', 
    createdAt: '2024-03-01', averageRating: 4.9, price: 100, registrationUrl: '#',
    ratings: [] 
  },
  { 
    id: '3', name: 'Yakshagana Sammelana Udupi', nameKa: 'ಯಕ್ಷಗಾನ ಸಮ್ಮೇಳನ ಉಡುಪಿ',
    description: 'A grand gathering of Yakshagana artists and enthusiasts in Udupi.', 
    date: '2024-11-20', time: '06:00 PM', 
    locationName: 'Sri Krishna Mutt Complex', address: 'Temple Car St, Sri Krishna Temple Complex, Thenkpete, Maruthi Veethika, Udupi, Karnataka 576101', 
    district: 'Udupi', city: 'Udupi', latitude: 13.342, longitude: 74.747, 
    category: 'Yakshagana', language: 'Kannada', culturalRelevance: ['Other Festival'],
    imageUrl: 'https://picsum.photos/seed/yakshagana/600/400', 
    createdAt: '2024-04-01', averageRating: 4.5, price: 50, 
    ratings: [] 
  },
   { 
    id: '4', name: 'Hubballi Startup Meet', nameKa: 'ಹುಬ್ಬಳ್ಳಿ ಸ್ಟಾರ್ಟ್‌ಅಪ್ ಮೀಟ್',
    description: 'Networking event for entrepreneurs and investors in North Karnataka.', 
    date: '2024-08-30', time: '02:00 PM', 
    locationName: 'Deshpande Foundation', address: 'Plot No. 1, Technology Avenue, Hubballi, Karnataka 580029', 
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
  // Taluk/City filtering can be added similarly if data becomes available.
  // For now, district is the primary geographic filter.

  const { toast } = useToast();

  const fetchUserLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    try {
      const location = await getCurrentLocation(); // This is currently mocked to return a fixed location
      if (location) {
        setUserLocation(location);
        // toast({ title: 'Location Found!', description: `Showing events near your location.` });
      } else {
        // For Karnataka app, if location fails, we can default to a central Karnataka city or show all.
        // Here, we'll just note the error and proceed without location-based sorting.
        setLocationError('Could not determine your location. Events will not be sorted by proximity.');
        // toast({ title: 'Location Optional', description: 'Could not determine your location. Displaying all Karnataka events.', variant: 'default' });
      }
    } catch (error) {
      setLocationError('Error getting location. Events will not be sorted by proximity.');
      // toast({ title: 'Location Error', description: (error as Error).message, variant: 'default' });
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    fetchUserLocation();
  }, [fetchUserLocation]);
  
  // Simulate fetching events (replace with actual API call)
  useEffect(() => {
    setIsLoadingEvents(true);
    setTimeout(() => {
      let eventsWithDistance = MOCK_EVENTS_KARNATAKA;
      if (userLocation) {
        eventsWithDistance = MOCK_EVENTS_KARNATAKA.map(event => ({
          ...event,
          distance: calculateDistance(userLocation.lat, userLocation.lng, event.latitude, event.longitude)
        })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } else {
         // If no user location, sort by date or name as a fallback
        eventsWithDistance = MOCK_EVENTS_KARNATAKA.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      setAllEvents(eventsWithDistance);
      setFilteredEvents(eventsWithDistance); // Initially show all (or sorted by proximity if location available)
      setIsLoadingEvents(false);
    }, 1000);
  }, [userLocation]);


  useEffect(() => {
    let events = [...allEvents];

    // Filter by search term (name, description, locationName, category in Kannada or English)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      events = events.filter(event =>
        event.name.toLowerCase().includes(lowerSearchTerm) ||
        (event.nameKa && event.nameKa.toLowerCase().includes(lowerSearchTerm)) ||
        event.description.toLowerCase().includes(lowerSearchTerm) ||
        (event.descriptionKa && event.descriptionKa.toLowerCase().includes(lowerSearchTerm)) ||
        event.locationName.toLowerCase().includes(lowerSearchTerm) ||
        event.category.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      events = events.filter(event => selectedCategories.includes(event.category as EventCategory));
    }
    
    // Filter by district
    if (selectedDistrict !== 'All') {
        events = events.filter(event => event.district === selectedDistrict);
    }

    // Filter by date range
    if (selectedDateRange !== 'All') {
        const today = new Date();
        today.setHours(0,0,0,0); 

        events = events.filter(event => {
            const eventDate = new Date(event.date);
            if (selectedDateRange === "Today") {
                return eventDate.toDateString() === today.toDateString();
            }
            if (selectedDateRange === "This Weekend") {
                const dayOfWeek = today.getDay(); 
                const endOfWeek = new Date(today);
                endOfWeek.setDate(today.getDate() + (6 - dayOfWeek) + 1); 
                endOfWeek.setHours(23,59,59,999);
                return eventDate >= today && eventDate <= endOfWeek;
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

    // If userLocation is available, re-sort by distance after filtering
    // otherwise, ensure consistent sort order (e.g., by date)
    if (userLocation) {
        events.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    } else {
        events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    setFilteredEvents(events);
  }, [searchTerm, selectedCategories, selectedDateRange, selectedDistrict, allEvents, userLocation]);


  if (isLoadingLocation && isLoadingEvents) { // Show loader if both are loading initially
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Finding events in Karnataka...</p>
      </div>
    );
  }

  if (locationError && !userLocation && !isLoadingLocation) { // Display location error if persistent and not loading
     // User can still use the app, location sorting is just off
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
        <h1 className="text-3xl md:text-4xl font-bold mb-1 tracking-tight text-primary">ಸ್ಥಳೀಯ ಕಾರ್ಯಕ್ರಮಗಳು</h1>
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
      {/* TODO: Add pagination or infinite scroll */}
      {/* TODO: Push notification subscription UI element? (Later stage) */}
      {/* TODO: WatchList UI integration (Later stage) */}
    </div>
  );
}
