
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

// Represents user profile data, potentially stored in Firestore
export interface User {
  id: string; // Firebase UID
  name: string;
  username: string; 
  email: string;
  photoURL?: string; // From Firebase Auth or custom upload
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  dob?: string; // Date of Birth ISO string YYYY-MM-DD
  phoneNumber?: string;
  district?: KarnatakaDistrict;
  city?: KarnatakaCity | string; // Allow string for 'Other' or custom cities
  customCity?: string; 
  languagePreference: LanguagePreference;
  collegeOrInstitution?: string;
  interests?: UserInterest[];
  createdAt: string; // ISO string
}

export interface Rating {
  id: string;
  userId: string;
  eventId: string;
  rating: number; // 1-5
  reviewText?: string;
  createdAt: string;
  updatedAt: string;
  user?: Partial<User>; // Optionally include user details from their profile for display
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
  name: string; 
  nameKa?: string; // Optional Kannada name
  description: string;
  descriptionKa?: string; // Optional Kannada description
  date: string; // ISO string for start date YYYY-MM-DD
  endDate?: string; // ISO string for end date, optional
  time: string; // Start time, e.g., "10:00 AM" / "HH:MM"
  endTime?: string; // End time, optional
  
  locationName: string; // e.g., Kanteerava Stadium
  address: string; // Full address string
  district: KarnatakaDistrict;
  city: KarnatakaCity | string; // Can be from KARNATAKA_CITIES or a custom string
  taluk?: string; 
  pinCode?: string; 
  latitude: number; // For map integration & distance calculation
  longitude: number; // For map integration & distance calculation
  googleMapsUrl?: string; // Optional direct link to Google Maps
  localLandmark?: string; 

  category: EventCategory;
  language: LanguagePreference; 
  culturalRelevance?: CulturalRelevanceTag[];

  imageUrl?: string; // Main poster URL
  posterKaUrl?: string; // Optional Kannada poster URL

  organizerId?: string; // Firebase UID of the event creator/organizer
  organizerName?: string; // Display name of the organizer

  price?: number; // In INR. 0 or undefined/null for free events
  registrationUrl?: string; // Link to external registration or internal form

  createdAt: string; // ISO string
  averageRating?: number; 
  ratings?: Rating[]; 
  distance?: number; // in km, calculated on frontend if user location is available
  
  targetDistricts?: KarnatakaDistrict[]; 
}

export type DateRangeFilter = "Today" | "This Weekend" | "Next 7 Days" | "All";

export interface WatchListItem {
  userId: string; // Firebase UID
  eventId: string;
  addedAt: string; // ISO string
}

export interface WatchListNotification {
  id: string;
  userId: string; // Firebase UID
  eventId: string;
  message: string; 
  type: "DATE_NEAR" | "PRICE_REDUCED" | "LOCATION_UPDATED"; // Add more specific types as needed
  createdAt: string; // ISO string
  isRead: boolean;
}
