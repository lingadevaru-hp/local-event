
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
  | "Shivamogga" | "Davanagere" | "Ballari" | "Vijayapura" | "Kalaburagi" | "Raichur" | "Hassan" | "Kolar";

export const KARNATAKA_CITIES: KarnatakaCity[] = [
  "Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Dharwad", "Belagavi", "Tumakuru", "Udupi", 
  "Shivamogga", "Davanagere", "Ballari", "Vijayapura", "Kalaburagi", "Raichur", "Hassan", "Kolar"
];


export type LanguagePreference = "Kannada" | "English" | "Bilingual";
export const LANGUAGE_PREFERENCES: LanguagePreference[] = ["Kannada", "English", "Bilingual"];

export type UserInterest = 
  | "Tech Fests" | "Yakshagana" | "Startup Meets" | "Hackathons" | "College Fests" 
  | "Kannada Kavighosti" | "Utsava" | "Jatre" | "Rangoli Competitions" | "Music" | "Sports" | "Arts" | "Food" | "Community"
  | "Literature" | "Tourism";

export const USER_INTERESTS: UserInterest[] = [
  "Tech Fests", "Yakshagana", "Startup Meets", "Hackathons", "College Fests", 
  "Kannada Kavighosti", "Utsava", "Jatre", "Rangoli Competitions", "Music", "Sports", "Arts", "Food", "Community",
  "Literature", "Tourism"
];

export interface User {
  id: string;
  name: string;
  username: string; 
  email: string;
  photoURL?: string;
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  dob?: string;
  phoneNumber?: string;
  district?: KarnatakaDistrict;
  city?: KarnatakaCity | string;
  customCity?: string; 
  languagePreference: LanguagePreference;
  collegeOrInstitution?: string;
  interests?: UserInterest[];
  createdAt: string;
  uid?: string;
}

export interface Rating {
  id: string;
  userId: string;
  eventId: string;
  rating: number;
  reviewText?: string;
  createdAt: string;
  updatedAt: string;
  user?: Partial<User>;
}

export type EventCategory = 
  | "Utsava" | "Hackathons" | "College Fests" | "Startup Meets" | "Kannada Kavighosti"
  | "Tech Fests" | "Yakshagana" | "Jatre" | "Rangoli Competitions"
  | "Music" | "Workshop" | "Sport" | "Arts" | "Food" | "Community" 
  | "Literature" | "Tourism" | "Heritage Walk" | "Drama/Theatre" | "Exhibition" | "Conference" | "Seminar" | "Other";


export const EVENT_CATEGORIES: EventCategory[] = [
  "Utsava", "Hackathons", "College Fests", "Startup Meets", "Kannada Kavighosti",
  "Tech Fests", "Yakshagana", "Jatre", "Rangoli Competitions",
  "Music", "Workshop", "Sport", "Arts", "Food", "Community", 
  "Literature", "Tourism", "Heritage Walk", "Drama/Theatre", "Exhibition", "Conference", "Seminar", "Other"
];

export type CulturalRelevanceTag = "Karaga" | "Jatre" | "Dasara" | "Rajyotsava" | "Hampi Utsava" | "Kambala" | "Other Festival";
export const CULTURAL_RELEVANCE_TAGS: CulturalRelevanceTag[] = ["Karaga", "Jatre", "Dasara", "Rajyotsava", "Hampi Utsava", "Kambala", "Other Festival"];

export interface Event {
  id: string;
  name: string; 
  nameKa?: string;
  description: string;
  descriptionKa?: string;
  date: string; 
  endDate?: string;
  time: string;
  endTime?: string;
  
  locationName: string;
  address: string;
  district: KarnatakaDistrict;
  city: KarnatakaCity | string;
  taluk?: string; 
  pinCode?: string; 
  latitude: number;
  longitude: number;
  googleMapsUrl?: string;
  localLandmark?: string; 

  category: EventCategory;
  language: LanguagePreference; 
  culturalRelevance?: CulturalRelevanceTag[];

  imageUrl?: string;
  posterKaUrl?: string;

  organizerId?: string;
  organizerName?: string;

  price?: number;
  registrationUrl?: string;

  createdAt: string;
  averageRating?: number; 
  ratings?: Rating[]; 
  distance?: number;
  
  targetDistricts?: KarnatakaDistrict[]; 
  attendees?: string[]; // Array of user IDs who signed up
}

export type DateRangeFilter = "Today" | "This Weekend" | "Next 7 Days" | "All";
export type PriceRangeFilter = "Free" | "₹0-₹500" | "₹500+" | "All";

export const PRICE_RANGE_OPTIONS: PriceRangeFilter[] = ["Free", "₹0-₹500", "₹500+", "All"];


export interface WatchListItem {
  userId: string;
  eventId: string;
  addedAt: string;
}

export interface WatchListNotification {
  id: string;
  userId: string;
  eventId: string;
  message: string; 
  type: "DATE_NEAR" | "PRICE_REDUCED" | "LOCATION_UPDATED";
  createdAt: string;
  isRead: boolean;
}
