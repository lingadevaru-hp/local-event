
'use client';

import { type EventCategory, type DateRangeFilter, type KarnatakaDistrict, type PriceRangeFilter, type Event } from '@/types/event';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ListFilter, Search, MapPin, X, Mic, LocateFixed, ChevronDown } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect, useRef } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Label as ShadcnLabel } from '@/components/ui/label';
import { PRICE_RANGE_OPTIONS } from '@/types/event';

interface EventFiltersProps {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  selectedCategories: EventCategory[];
  setSelectedCategories: Dispatch<SetStateAction<EventCategory[]>>;
  selectedDateRange: DateRangeFilter;
  setSelectedDateRange: Dispatch<SetStateAction<DateRangeFilter>>;
  availableDistricts: KarnatakaDistrict[];
  selectedDistrict: KarnatakaDistrict | 'All';
  setSelectedDistrict: Dispatch<SetStateAction<KarnatakaDistrict | 'All'>>;
  availableCategories: EventCategory[];
  selectedPriceRange: PriceRangeFilter; // New prop
  setSelectedPriceRange: Dispatch<SetStateAction<PriceRangeFilter>>; // New setter
  allEvents: Event[]; // For autocomplete
  setUserLocation: Dispatch<SetStateAction<{ lat: number; lng: number; } | null>>; // For Near Me
  fetchUserLocation: () => Promise<void>;
  isLoadingLocation: boolean;
}

const dateRangeOptions: DateRangeFilter[] = ["Today", "This Weekend", "Next 7 Days", "All"];

export function EventFilters({
  searchTerm,
  setSearchTerm,
  selectedCategories,
  setSelectedCategories,
  selectedDateRange,
  setSelectedDateRange,
  availableDistricts,
  selectedDistrict,
  setSelectedDistrict,
  availableCategories,
  selectedPriceRange,
  setSelectedPriceRange,
  allEvents,
  setUserLocation,
  fetchUserLocation,
  isLoadingLocation,
}: EventFiltersProps) {
  
  const [suggestions, setSuggestions] = useState<Event[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const filteredSuggestions = allEvents
        .filter(event => 
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5); // Limit suggestions
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, allEvents]);

  const handleSuggestionClick = (eventName: string) => {
    setSearchTerm(eventName);
    setShowSuggestions(false);
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser.');
      return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      setIsListening(false);
      recognition.stop();
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      alert(`Error in voice recognition: ${event.error}`);
      setIsListening(false);
      recognition.stop();
    };
    
    recognition.onend = () => {
        setIsListening(false);
    }
  };

  const handleNearMeClick = async () => {
    if (navigator.vibrate) navigator.vibrate(50);
    await fetchUserLocation(); // This will trigger a re-sort by distance in EventDiscovery
  };
  
  const handleVibrate = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };


  const FilterPill: React.FC<{
    label: string;
    options: string[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    icon?: React.ElementType;
  }> = ({ label, options, selectedValue, onValueChange, icon: Icon }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex-shrink-0 h-10 px-4 py-2 rounded-full text-sm shadow-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-150 ease-in-out"
          onClick={handleVibrate}
        >
          {Icon && <Icon className="mr-2 h-4 w-4 opacity-70" />}
          {selectedValue === 'All' || !selectedValue ? label : selectedValue}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-72">
        <ScrollArea className="h-full">
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={selectedValue} onValueChange={onValueChange}>
            <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option} value={option}>
                {option}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );


  return (
    <div className="mb-8 p-4 md:p-6 bg-card border-none rounded-xl shadow-lg w-full max-w-4xl mx-auto" suppressHydrationWarning>
      {/* Search Bar */}
      <div className="relative mb-4 md:mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          id="search"
          type="text"
          placeholder="Search events, places, categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
          // onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // Delay to allow click on suggestions
          className="w-full h-14 pl-12 pr-24 rounded-xl text-base shadow-md border-input focus:border-primary focus-visible:ring-primary focus-visible:ring-2 transition-shadow duration-200"
        />
        {searchTerm && (
          <Button variant="ghost" size="icon" className="absolute right-16 top-1/2 transform -translate-y-1/2 h-10 w-10" onClick={() => setSearchTerm('')}>
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-10 w-10 ${isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} 
          onClick={() => { handleVoiceSearch(); handleVibrate(); }}
          title="Search by voice"
        >
          <Mic className="h-5 w-5" />
        </Button>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {suggestions.map(event => (
              <div
                key={event.id}
                className="px-4 py-3 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
                onClick={() => { handleSuggestionClick(event.name); handleVibrate(); }}
              >
                <p className="font-medium">{event.name}</p>
                <p className="text-xs text-muted-foreground">{event.city}, {event.category}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters and Near Me Button */}
      <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
        <ScrollArea className="w-full md:w-auto pb-2 md:pb-0">
          <div className="flex space-x-2 md:space-x-3">
            <FilterPill label="District" options={availableDistricts} selectedValue={selectedDistrict} onValueChange={(val) => setSelectedDistrict(val as KarnatakaDistrict | 'All')} icon={MapPin}/>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-shrink-0 h-10 px-4 py-2 rounded-full text-sm shadow-sm hover:bg-muted" onClick={handleVibrate}>
                  <ListFilter className="mr-2 h-4 w-4 opacity-70"/>
                  Categories {selectedCategories.length > 0 ? `(${selectedCategories.length})` : ''}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 max-h-72">
                <ScrollArea className="h-full">
                  <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableCategories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => {
                        setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
                        handleVibrate();
                      }}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            <FilterPill label="Date" options={dateRangeOptions} selectedValue={selectedDateRange} onValueChange={(val) => setSelectedDateRange(val as DateRangeFilter)} icon={ListFilter}/>
            <FilterPill label="Price" options={PRICE_RANGE_OPTIONS} selectedValue={selectedPriceRange} onValueChange={(val) => setSelectedPriceRange(val as PriceRangeFilter)} icon={ListFilter}/>
          </div>
          <ScrollBar orientation="horizontal" className="md:hidden"/>
        </ScrollArea>
        
        <Button 
          variant="outline" 
          className="w-full md:w-auto h-10 px-4 py-2 rounded-full text-sm shadow-sm flex items-center justify-center hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          onClick={handleNearMeClick}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4 opacity-70" />}
          Near Me
        </Button>
      </div>
    </div>
  );
}
