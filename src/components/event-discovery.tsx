
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Event, EventCategory, DateRangeFilter, KarnatakaDistrict, PriceRangeFilter } from '@/types/event'; // Added PriceRangeFilter
import { EventFilters } from './event-filters';
import { EventList } from './event-list';
import { useToast } from '@/hooks/use-toast';
import { getCurrentLocation, type Location } from '@/services/geolocation';
import { Loader2 } from 'lucide-react';
import { calculateDistance } from '@/lib/utils';
import { KARNATAKA_DISTRICTS, EVENT_CATEGORIES as APP_EVENT_CATEGORIES, PRICE_RANGE_OPTIONS } from '@/types/event'; // Added PRICE_RANGE_OPTIONS
import { MOCK_EVENTS_DATA } from '@/lib/mockEvents';

export function EventDiscovery() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true); // Start with true
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeFilter>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<KarnatakaDistrict | 'All'>('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRangeFilter>('All'); // New filter state

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
        toast({
          title: 'Location Unavailable',
          description: 'Events will not be sorted by proximity. You can still browse all events.',
          variant: 'default',
          duration: 7000,
       });
      }
    } catch (error) {
      setLocationError('Error getting location. Events will not be sorted by proximity.');
      toast({
        title: 'Location Error',
        description: 'Events will not be sorted by proximity. You can still browse all events.',
        variant: 'destructive',
        duration: 7000,
     });
    } finally {
      setIsLoadingLocation(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUserLocation();
  }, [fetchUserLocation]);
  
  useEffect(() => {
    setIsLoadingEvents(true);
    // Simulate API call
    setTimeout(() => {
      let eventsWithDistance = MOCK_EVENTS_DATA;
      if (userLocation) {
        eventsWithDistance = MOCK_EVENTS_DATA.map(event => ({
          ...event,
          distance: calculateDistance(userLocation.lat, userLocation.lng, event.latitude, event.longitude)
        })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } else {
        eventsWithDistance = MOCK_EVENTS_DATA.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
        Object.values(event).some(value => 
          String(value).toLowerCase().includes(lowerSearchTerm)
        ) || (event.nameKa && event.nameKa.toLowerCase().includes(lowerSearchTerm))
        || (event.descriptionKa && event.descriptionKa.toLowerCase().includes(lowerSearchTerm))
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
            eventDate.setHours(0,0,0,0);

            if (selectedDateRange === "Today") {
                return eventDate.toDateString() === today.toDateString();
            }
            if (selectedDateRange === "This Weekend") {
                const currentDay = today.getDay();
                let saturday = new Date(today);
                saturday.setDate(today.getDate() + (6 - currentDay + 7) % 7);
                saturday.setHours(0,0,0,0);
                let sunday = new Date(saturday);
                sunday.setDate(saturday.getDate() + 1);
                sunday.setHours(23,59,59,999);
                return eventDate >= saturday && eventDate <= sunday;
            }
            if (selectedDateRange === "Next 7 Days") {
                const nextSevenDaysEnd = new Date(today);
                nextSevenDaysEnd.setDate(today.getDate() + 6);
                nextSevenDaysEnd.setHours(23,59,59,999);
                return eventDate >= today && eventDate <= nextSevenDaysEnd;
            }
            return true;
        });
    }

    // Price Range Filter
    if (selectedPriceRange !== 'All') {
      events = events.filter(event => {
        const price = event.price === undefined || event.price === null ? 0 : event.price;
        if (selectedPriceRange === 'Free') return price === 0;
        if (selectedPriceRange === '₹0-₹500') return price >= 0 && price <= 500;
        if (selectedPriceRange === '₹500+') return price > 500;
        return true;
      });
    }

    if (userLocation && !searchTerm) {
        events.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    } else if (!userLocation) {
        events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    setFilteredEvents(events);
  }, [searchTerm, selectedCategories, selectedDateRange, selectedDistrict, selectedPriceRange, allEvents, userLocation]);


  // Combined loading state for initial phase
  if (isLoadingLocation && isLoadingEvents) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Finding events in Karnataka...</p>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
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
        selectedPriceRange={selectedPriceRange} // Pass new prop
        setSelectedPriceRange={setSelectedPriceRange} // Pass new setter
        allEvents={allEvents} // For autocomplete
        setUserLocation={setUserLocation} // For "Near Me"
        fetchUserLocation={fetchUserLocation} // For "Near Me"
        isLoadingLocation={isLoadingLocation} // For "Near Me" button state
      />
      
      <EventList events={filteredEvents} isLoading={isLoadingEvents} />
    </div>
  );
}
