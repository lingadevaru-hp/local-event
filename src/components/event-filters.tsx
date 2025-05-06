'use client';

import { EVENT_CATEGORIES, type EventCategory, type DateRangeFilter } from '@/types/event';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ListFilter, Search } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

interface EventFiltersProps {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  selectedCategories: EventCategory[];
  setSelectedCategories: Dispatch<SetStateAction<EventCategory[]>>;
  selectedDateRange: DateRangeFilter;
  setSelectedDateRange: Dispatch<SetStateAction<DateRangeFilter>>;
}

const dateRangeOptions: DateRangeFilter[] = ["Today", "This Weekend", "Next 7 Days", "All"];

export function EventFilters({
  searchTerm,
  setSearchTerm,
  selectedCategories,
  setSelectedCategories,
  selectedDateRange,
  setSelectedDateRange,
}: EventFiltersProps) {
  
  const handleCategoryToggle = (category: EventCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  return (
    <div className="mb-8 p-4 bg-card border rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-1">
          <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">
            Search Events
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Search by keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Category
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedCategories.length > 0 ? `${selectedCategories.length} selected` : "Select Categories"} <ListFilter className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {EVENT_CATEGORIES.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Date Range
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {selectedDateRange} <ListFilter className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {dateRangeOptions.map((range) => (
                <DropdownMenuCheckboxItem
                  key={range}
                  checked={selectedDateRange === range}
                  onCheckedChange={() => setSelectedDateRange(range)}
                >
                  {range}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
