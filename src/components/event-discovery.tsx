'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Event, EventCategory, DateRangeFilter } from '@/types/event';
import { EventFilters } from './event-filters';
import { EventList } from './event-list';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getCurrentLocation, type Location } from '@/services/geolocation';
import { Loader2, MapPinOff, RefreshCw } from 'lucide-react';
import { calculateDistance } from '@/lib/utils'; // Assuming utils.ts will have this

// Mock event data - replace with actual API calls
const MOCK_EVENTS: Event[] = [
  { id: '1', name: 'Summer Music Fest', description: 'An amazing outdoor music festival with local bands.', date: '2024-08-15', time: '02:00 PM', locationName: 'Central Park', address: '123 Park Ave, Cityville', latitude: 34.0522, longitude: -118.2437, category: 'Music', imageUrl: 'https://picsum.photos/seed/music/600/400', createdAt: '2024-01-01', averageRating: 4.5, ratings: [{id: 'r1', userId: 'u1', eventId: '1', rating: 5, reviewText: 'Awesome!', createdAt: '2024-01-01', updatedAt: '2024-01-01'}] },
  { id: '2', name: 'Tech Workshop', description: 'Learn the latest in web development.', date: '2024-07-20', time: '10:00 AM', locationName: 'Community Center', address: '456 Main St, Cityville', latitude: 34.0580, longitude: -118.2500, category: 'Workshop', imageUrl: 'https://picsum.photos/seed/tech/600/400', createdAt: '2024-01-01', averageRating: 4.2, ratings: [] },
  { id: '3', name: 'Art Expo', description: 'Exhibition of modern art.', date: '2024-09-01', time: '11:00 AM', locationName: 'City Art Gallery', address: '789 Gallery Rd, Cityville', latitude: 34.0400, longitude: -118.2300, category: 'Arts', imageUrl: 'https://picsum.photos/seed/art/600/400', createdAt: '2024-01-01', averageRating: 3.8, ratings: [] },
  { id: '4', name: 'Food Truck Rally', description: 'A variety of delicious food trucks.', date: '2024-07-25', time: '05:00 PM', locationName: 'Downtown Square', address: '101 Square Pl, Cityville', latitude: 34.0550, longitude: -118.2450, category: 'Food', imageUrl: 'https://picsum.photos/seed/food/600/400', createdAt: '2024-01-01', averageRating: 4.8, ratings: [] },
  { id: '5', name: 'Charity Run 5K', description: 'Run for a cause!', date: '2024-08-03', time: '08:00 AM', locationName: 'Riverfront Park', address: '202 River Rd, Cityville', latitude: 34.0600, longitude: -118.2550, category: 'Sport', createdAt: '2024-01-01', averageRating: 4.0, ratings: [] },
  { id: '6', name: 'Farmers Market', description: 'Fresh local produce and goods.', date: '2024-07-27', time: '09:00 AM', locationName: 'Old Town Square', address: '303 Market St, Cityville', latitude: 34.0450, longitude: -118.2350, category: 'Community', imageUrl: 'https://picsum.photos/seed/market/600/400', createdAt: '2024-01-01' },
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

  const { toast } = useToast();

  const fetchUserLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    try {
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation(location);
        toast({ title: 'Location Found!', description: `Showing events near your location.` });
      } else {
        setLocationError('Could not determine your location. Please enable location services or enter a location manually.');
        toast({ title: 'Location Error', description: 'Could not determine your location.', variant: 'destructive' });
      }
    } catch (error) {
      setLocationError('Error getting location. Please try again or enter a location manually.');
      toast({ title: 'Location Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsLoadingLocation(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUserLocation();
  }, [fetchUserLocation]);
  
  // Simulate fetching events (replace with actual API call)
  useEffect(() => {
    setIsLoadingEvents(true);
    // Simulate API delay
    setTimeout(() => {
      let eventsWithDistance = MOCK_EVENTS;
      if (userLocation) {
        eventsWithDistance = MOCK_EVENTS.map(event => ({
          ...event,
          distance: calculateDistance(userLocation.lat, userLocation.lng, event.latitude, event.longitude)
        })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      }
      setAllEvents(eventsWithDistance);
      setFilteredEvents(eventsWithDistance);
      setIsLoadingEvents(false);
    }, 1000);
  }, [userLocation]);


  useEffect(() => {
    let events = [...allEvents];

    // Filter by search term
    if (searchTerm) {
      events = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      events = events.filter(event => selectedCategories.includes(event.category as EventCategory));
    }
    
    // Filter by date range
    if (selectedDateRange !== 'All') {
        const today = new Date();
        today.setHours(0,0,0,0); // Start of today

        events = events.filter(event => {
            const eventDate = new Date(event.date);
            if (selectedDateRange === "Today") {
                return eventDate.toDateString() === today.toDateString();
            }
            if (selectedDateRange === "This Weekend") {
                const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
                const endOfWeek = new Date(today);
                endOfWeek.setDate(today.getDate() + (6 - dayOfWeek) + 1); // End of Sunday
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


    setFilteredEvents(events);
  }, [searchTerm, selectedCategories, selectedDateRange, allEvents]);


  if (isLoadingLocation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Getting your location...</p>
      </div>
    );
  }

  if (locationError && !userLocation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <MapPinOff className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Location Access Denied</h2>
        <p className="text-muted-foreground mb-4 max-w-md">{locationError}</p>
        <Button onClick={fetchUserLocation}>
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
        {/* TODO: Add manual location input */}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 tracking-tight">Discover Local Events</h1>
      <p className="text-muted-foreground mb-6">Find exciting events happening near you.</p>
      
      <EventFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedDateRange={selectedDateRange}
        setSelectedDateRange={setSelectedDateRange}
      />
      
      <EventList events={filteredEvents} isLoading={isLoadingEvents} />
      {/* TODO: Add pagination or infinite scroll */}
    </div>
  );
}
