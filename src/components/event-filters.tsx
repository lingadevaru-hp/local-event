'use client';

import { EVENT_CATEGORIES, type EventCategory, type DateRangeFilter, type KarnatakaDistrict, KARNATAKA_DISTRICTS } from '@/types/event';
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
import { ListFilter, Search, MapPin } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';


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
  // TODO: Add city and taluk filters when data is available
  // selectedCity: string;
  // setSelectedCity: Dispatch<SetStateAction<string>>;
  // selectedTaluk: string;
  // setSelectedTaluk: Dispatch<SetStateAction<string>>;
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
}: EventFiltersProps) {
  
  const handleCategoryToggle = (category: EventCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  return (
    <div className="mb-8 p-4 bg-card border rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="lg:col-span-1">
          <Label htmlFor="search">Search Events</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="ಕಾರ್ಯಕ್ರಮ, ಸ್ಥಳ, ವರ್ಗ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label>District (ಜಿಲ್ಲೆ)</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between mt-1">
                {selectedDistrict === 'All' ? "Select District" : selectedDistrict} <MapPin className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-72">
              <ScrollArea className="h-full">
                <DropdownMenuLabel>Filter by District</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={selectedDistrict} onValueChange={(value) => setSelectedDistrict(value as KarnatakaDistrict | 'All')}>
                    <DropdownMenuRadioItem value="All">All Districts</DropdownMenuRadioItem>
                    {availableDistricts.map((district) => (
                    <DropdownMenuRadioItem key={district} value={district}>
                        {district}
                    </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div>
          <Label>Category (ವರ್ಗ)</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between mt-1">
                {selectedCategories.length > 0 ? `${selectedCategories.length} selected` : "Select Categories"} <ListFilter className="ml-2 h-4 w-4" />
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
                    onCheckedChange={() => handleCategoryToggle(category)}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <Label>Date Range (ದಿನಾಂಕ)</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between mt-1">
                {selectedDateRange} <ListFilter className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={selectedDateRange} onValueChange={(value) => setSelectedDateRange(value as DateRangeFilter)}>
                {dateRangeOptions.map((range) => (
                    <DropdownMenuRadioItem key={range} value={range}>
                    {range}
                    </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// Basic Label component if not already globally available or part of a UI library
function Label({ htmlFor, children, className }: { htmlFor?: string, children: React.ReactNode, className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn("block text-sm font-medium text-foreground mb-1", className)}>
      {children}
    </label>
  );
}

function cn(...inputs: Array<string | undefined | null | false | Record<string, boolean>>): string {
  return inputs.filter(Boolean).join(' ');
}
