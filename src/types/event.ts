export interface User {
  id: string;
  username: string;
  email?: string;
  // password_hash is a backend concern, not exposed to frontend
  createdAt: string; 
}

export interface Rating {
  id: string;
  userId: string;
  eventId: string;
  rating: number; // 1-5
  reviewText?: string;
  createdAt: string;
  updatedAt: string;
  user?: User; // Optionally include user details
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string; // ISO string for start date
  endDate?: string; // ISO string for end date, optional
  time: string; // Start time, e.g., "10:00 AM"
  endTime?: string; // End time, optional
  locationName: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  imageUrl?: string;
  createdAt: string;
  averageRating?: number; // Calculated
  ratings?: Rating[]; // List of ratings and reviews
  distance?: number; // in km, calculated on frontend
}

export type EventCategory = "Music" | "Workshop" | "Sport" | "Arts" | "Food" | "Community" | "Other";

export const EVENT_CATEGORIES: EventCategory[] = ["Music", "Workshop", "Sport", "Arts", "Food", "Community", "Other"];

export type DateRangeFilter = "Today" | "This Weekend" | "Next 7 Days" | "All";
