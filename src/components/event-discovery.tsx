
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
import { MOCK_EVENTS_DATA } from '@/lib/mockEvents'; // Import mock events

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
      let eventsWithDistance = MOCK_EVENTS_DATA; // Use imported mock data
      if (userLocation) {
        eventsWithDistance = MOCK_EVENTS_DATA.map(event => ({
          ...event,
          distance: calculateDistance(userLocation.lat, userLocation.lng, event.latitude, event.longitude)
        })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } else {
        // Sort by date if no location
        eventsWithDistance = MOCK_EVENTS_DATA.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      setAllEvents(eventsWithDistance);
      setFilteredEvents(eventsWithDistance); // Initially show all (or distance-sorted)
      setIsLoadingEvents(false);
    }, 1000);
  }, [userLocation]);


  useEffect(() => {
    let events = [...allEvents];

    // Search Term Filter (more comprehensive)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      events = events.filter(event =>
        event.name.toLowerCase().includes(lowerSearchTerm) ||
        (event.nameKa && event.nameKa.toLowerCase().includes(lowerSearchTerm)) ||
        event.description.toLowerCase().includes(lowerSearchTerm) ||
        (event.descriptionKa && event.descriptionKa.toLowerCase().includes(lowerSearchTerm)) ||
        event.locationName.toLowerCase().includes(lowerSearchTerm) ||
        event.city.toLowerCase().includes(lowerSearchTerm) ||
        event.district.toLowerCase().includes(lowerSearchTerm) ||
        (event.taluk && event.taluk.toLowerCase().includes(lowerSearchTerm)) ||
        event.category.toLowerCase().includes(lowerSearchTerm) ||
        (event.organizerName && event.organizerName.toLowerCase().includes(lowerSearchTerm)) ||
        (event.culturalRelevance && event.culturalRelevance.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
      );
    }

    // Category Filter
    if (selectedCategories.length > 0) {
      events = events.filter(event => selectedCategories.includes(event.category as EventCategory));
    }
    
    // District Filter
    if (selectedDistrict !== 'All') {
        events = events.filter(event => event.district === selectedDistrict);
    }

    // Date Range Filter
    if (selectedDateRange !== 'All') {
        const today = new Date();
        today.setHours(0,0,0,0); 

        events = events.filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0,0,0,0); // Normalize event date

            if (selectedDateRange === "Today") {
                return eventDate.toDateString() === today.toDateString();
            }
            if (selectedDateRange === "This Weekend") {
                const currentDay = today.getDay(); // Sunday = 0, ... Saturday = 6
                // Find the upcoming Saturday
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
                nextSevenDaysEnd.setDate(today.getDate() + 6); // today + 6 more days = 7 days total
                nextSevenDaysEnd.setHours(23,59,59,999);
                return eventDate >= today && eventDate <= nextSevenDaysEnd;
            }
            return true; // Should not reach here if date range is specific
        });
    }

    // Sort by distance if user location is available and no specific search term sort needed
    // If a search term is active, relevance might be more important than distance for some terms.
    // For now, keep distance sort if location is available.
    if (userLocation && !searchTerm) { // Only sort by distance if no search term or specific sort applied by search
        events.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    } else if (!userLocation) { // Default sort by date if no location
        events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    // If searchTerm is present, events are already filtered, further sorting might be complex based on relevance.
    // Current filtering logic keeps the distance sort if location is available.

    setFilteredEvents(events);
  }, [searchTerm, selectedCategories, selectedDateRange, selectedDistrict, allEvents, userLocation]);


  if (isLoadingLocation && isLoadingEvents) { // Show loader if both location and initial events are loading
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Finding events in Karnataka...</p>
      </div>
    );
  }

  if (locationError && !userLocation && !isLoadingLocation) { // Show toast only once after location attempt
     toast({
        title: 'Location Unavailable',
        description: `${locationError} You can still browse all events.`,
        variant: 'default',
        duration: 7000, // Increased duration
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
      
      {/* Show loader for events if location is determined but events are still loading */}
      <EventList events={filteredEvents} isLoading={isLoadingEvents || (isLoadingLocation && !userLocation)} />
    </div>
  );
}
