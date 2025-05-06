export type KarnatakaDistrict = 
  | "Bagalkot" | "Ballari (Bellary)" | "Belagavi (Belgaum)" | "Bengaluru Rural" | "Bengaluru Urban"
  | "Bidar" | "Chamarajanagar" | "Chikkaballapur" | "Chikkamagaluru" | "Chitradurga"
  | "Dakshina Kannada" | "Davanagere" | "Dharwad" | "Gadag" | "Hassan" | "Haveri" | "Kalaburagi (Gulbarga)"
  | "Kodagu" | "Kolar" | "Koppal" | "Mandya" | "Mysuru (Mysore)" | "Raichur" | "Ramanagara"
  | "Shivamogga (Shimoga)" | "Tumakuru (Tumkur)" | "Udupi" | "Uttara Kannada" | "Vijayapura (Bijapur)" | "Yadgir" | "Vijayanagara";

export const KARNATAKA_DISTRICTS: KarnatakaDistrict[] = [
  "Bagalkot", "Ballari (Bellary)", "Belagavi (Belgaum)", "Bengaluru Rural", "Bengaluru Urban",
  "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
  "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi (Gulbarga)",
  "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru (Mysore)", "Raichur", "Ramanagara",
  "Shivamogga (Shimoga)", "Tumakuru (Tumkur)", "Udupi", "Uttara Kannada", "Vijayapura (Bijapur)", "Yadgir", "Vijayanagara"
];

// Example cities, in a real app this would be a more comprehensive list, possibly hierarchical under districts.
export type KarnatakaCity = 
  | "Bengaluru" | "Mysuru" | "Mangaluru" | "Hubballi" | "Dharwad" | "Belagavi" | "Tumakuru" | "Udupi" 
  | "Shivamogga" | "Davanagere" | "Ballari" | "Vijayapura" | "Kalaburagi" | "Raichur" | "Hassan" | "Kolar" | "Other";

export const KARNATAKA_CITIES: KarnatakaCity[] = [
  "Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Dharwad", "Belagavi", "Tumakuru", "Udupi", 
  "Shivamogga", "Davanagere", "Ballari", "Vijayapura", "Kalaburagi", "Raichur", "Hassan", "Kolar", "Other"
];

export type LanguagePreference = "Kannada" | "English" | "Bilingual";
export const LANGUAGE_PREFERENCES: LanguagePreference[] = ["Kannada", "English", "Bilingual"];

export type UserInterest = 
  | "Tech Fests" | "Yakshagana" | "Startup Meets" | "Hackathons" | "College Fests" 
  | "Kannada Kavighosti" | "Utsava" | "Jatre" | "Rangoli Competitions" | "Music" | "Sports" | "Arts" | "Food" | "Community";

export const USER_INTERESTS: UserInterest[] = [
  "Tech Fests", "Yakshagana", "Startup Meets", "Hackathons", "College Fests", 
  "Kannada Kavighosti", "Utsava", "Jatre", "Rangoli Competitions", "Music", "Sports", "Arts", "Food", "Community"
];

export interface User {
  id: string;
  name: string;
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  dob?: string; // Date of Birth ISO string
  email: string;
  phoneNumber?: string; // Optional, for OTP
  district?: KarnatakaDistrict;
  city?: KarnatakaCity; // Could be manual input if 'Other' district/city
  customCity?: string; // For manual city input
  languagePreference: LanguagePreference;
  collegeOrInstitution?: string;
  interests?: UserInterest[];
  createdAt: string;
  // username for display, derived or same as name for simplicity here
  username: string; 
}

export interface Rating {
  id: string;
  userId: string;
  eventId: string;
  rating: number; // 1-5
  reviewText?: string;
  createdAt: string;
  updatedAt: string;
  user?: Partial<User>; // Optionally include user details like name/username
}

export type EventCategory = 
  | "Utsava" | "Hackathons" | "College Fests" | "Startup Meets" | "Kannada Kavighosti"
  | "Tech Fests" | "Yakshagana" | "Jatre" | "Rangoli Competitions"
  | "Music" | "Workshop" | "Sport" | "Arts" | "Food" | "Community" | "Other";

export const EVENT_CATEGORIES: EventCategory[] = [
  "Utsava", "Hackathons", "College Fests", "Startup Meets", "Kannada Kavighosti",
  "Tech Fests", "Yakshagana", "Jatre", "Rangoli Competitions",
  "Music", "Workshop", "Sport", "Arts", "Food", "Community", "Other"
];

export type CulturalRelevanceTag = "Karaga" | "Jatre" | "Dasara" | "Rajyotsava" | "Hampi Utsava" | "Kambala" | "Other Festival";
export const CULTURAL_RELEVANCE_TAGS: CulturalRelevanceTag[] = ["Karaga", "Jatre", "Dasara", "Rajyotsava", "Hampi Utsava", "Kambala", "Other Festival"];


export interface Event {
  id: string;
  name: string; // Can be bilingual, main entry
  nameKa?: string; // Optional Kannada name
  description: string;
  descriptionKa?: string; // Optional Kannada description
  date: string; // ISO string for start date
  endDate?: string; // ISO string for end date, optional
  time: string; // Start time, e.g., "10:00 AM"
  endTime?: string; // End time, optional
  
  locationName: string; // e.g., Kanteerava Stadium, JSS Auditorium
  address: string; // Full address
  district: KarnatakaDistrict;
  city: KarnatakaCity; // Or specific city within district
  taluk?: string; // Optional
  pinCode?: string; // Optional
  latitude: number;
  longitude: number;
  googleMapsUrl?: string; // For directions
  localLandmark?: string; // For local directions

  category: EventCategory;
  language: LanguagePreference; // Language of the event itself
  culturalRelevance?: CulturalRelevanceTag[];

  imageUrl?: string; // Main poster
  posterKaUrl?: string; // Optional Kannada poster

  organizerId?: string; // Link to User ID of organizer
  organizerName?: string; // Or just organizer display name

  price?: number; // In INR. 0 or undefined for free events
  registrationUrl?: string; // Link to external registration or internal form

  createdAt: string;
  averageRating?: number; // Calculated
  ratings?: Rating[]; // List of ratings and reviews
  distance?: number; // in km, calculated on frontend for discovery
  
  targetDistricts?: KarnatakaDistrict[]; // For targeted notifications by organizers
}

export type DateRangeFilter = "Today" | "This Weekend" | "Next 7 Days" | "All";


// WatchList related types
export interface WatchListItem {
  userId: string;
  eventId: string;
  addedAt: string;
}

export interface WatchListNotification {
  id: string;
  userId: string;
  eventId: string;
  message: string; // e.g., "Event date is near", "Price reduced", "Location updated"
  type: "DATE_NEAR" | "PRICE_REDUCED" | "LOCATION_UPDATED";
  createdAt: string;
  isRead: boolean;
}
