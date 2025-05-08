
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Edit3, UserCircle, ArrowLeft, LogOut } from 'lucide-react';
import { KARNATAKA_DISTRICTS, KARNATAKA_CITIES, LANGUAGE_PREFERENCES, USER_INTERESTS, type User, type KarnatakaDistrict, type KarnatakaCity, type LanguagePreference, type UserInterest } from '@/types/event';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Mock data storage for user profiles (app-specific details)
// In a real app, this would be your backend database linked to Clerk user IDs.
let MOCK_APP_USER_DETAILS: Record<string, Partial<User>> = {};


export default function ProfilePage() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  
  const [appUserDetails, setAppUserDetails] = useState<Partial<User> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // For app-specific details loading
  const { toast } = useToast();

  // Form state for app-specific fields
  const [name, setName] = useState(''); // Clerk provides fullName, this can be for overriding or if not available
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say' | ''>('');
  const [dob, setDob] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // Clerk can manage phone, this could be separate
  const [district, setDistrict] = useState<KarnatakaDistrict | ''>('');
  const [city, setCity] = useState<KarnatakaCity | 'Other' | ''>('');
  const [customCity, setCustomCity] = useState('');
  const [languagePreference, setLanguagePreference] = useState<LanguagePreference | ''>('');
  const [collegeOrInstitution, setCollegeOrInstitution] = useState('');
  const [interests, setInterests] = useState<UserInterest[]>([]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/profile'); // Clerk handles /sign-in
      return;
    }

    if (isLoaded && isSignedIn && clerkUser) {
      setIsLoadingProfile(true);
      // Fetch or initialize app-specific details from our mock store
      let userDetails = MOCK_APP_USER_DETAILS[clerkUser.id];
      
      if (!userDetails) {
        // Initialize with some defaults if not found in mock store
        userDetails = {
          languagePreference: 'English', // Default
          // Other fields can be initialized as empty or from Clerk if applicable
        };
        MOCK_APP_USER_DETAILS[clerkUser.id] = userDetails;
      }

      setAppUserDetails(userDetails);
      
      // Initialize form fields
      setName(clerkUser.fullName || userDetails.name || '');
      setGender(userDetails.gender || '');
      setDob(userDetails.dob || '');
      // Clerk's phone might be clerkUser.phoneNumbers[0]?.phoneNumber
      setPhoneNumber(userDetails.phoneNumber || ''); 
      setDistrict(userDetails.district || '');
      setCity(userDetails.customCity ? 'Other' : (userDetails.city as KarnatakaCity | 'Other' | '') || '');
      setCustomCity(userDetails.customCity || '');
      setLanguagePreference(userDetails.languagePreference || 'English');
      setCollegeOrInstitution(userDetails.collegeOrInstitution || '');
      setInterests(userDetails.interests || []);
      setIsLoadingProfile(false);
    }
  }, [isLoaded, isSignedIn, clerkUser, router]);


  const handleInterestChange = (interest: UserInterest) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUserDetails || !clerkUser) return;
    if (!name || !district || !languagePreference) {
        toast({ title: "Missing Required Fields", description: "Name, District, and Language Preference are required.", variant: "destructive"});
        return;
    }
    if (city === 'Other' && !customCity) {
        toast({ title: "Missing Required Fields", description: "Please specify your city/town if 'Other' is selected.", variant: "destructive"});
        return;
    }

    setIsSaving(true);
    
    const updatedAppSpecificData: Partial<User> = {
      name, // This might update Clerk's name too if desired via Clerk SDK
      gender: gender || undefined,
      dob: dob || undefined,
      phoneNumber: phoneNumber || undefined,
      district: district as KarnatakaDistrict,
      city: city === 'Other' ? undefined : (city as KarnatakaCity | undefined),
      customCity: city === 'Other' ? (customCity || undefined) : undefined,
      languagePreference: languagePreference as LanguagePreference,
      collegeOrInstitution: collegeOrInstitution || undefined,
      interests: interests.length > 0 ? interests : undefined,
    };

    // Simulate saving to backend/mock store
    await new Promise(resolve => setTimeout(resolve, 1000));
    MOCK_APP_USER_DETAILS[clerkUser.id] = { ...MOCK_APP_USER_DETAILS[clerkUser.id], ...updatedAppSpecificData };
    setAppUserDetails(prev => ({...prev, ...updatedAppSpecificData})); 
    
    // If you want to update Clerk's user attributes (e.g. name, publicMetadata for interests)
    // you would use clerkUser.update() here.
    // Example: await clerkUser.update({ fullName: name, publicMetadata: { interests: interests } });

    toast({ title: 'Profile Updated!', description: 'Your profile information has been saved.' });
    setIsSaving(false);
    setIsEditing(false);
  };
  
  if (!isLoaded || isLoadingProfile || !clerkUser) { 
    return <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  const displayEmail = clerkUser.primaryEmailAddress?.emailAddress || 'No email';
  const displayName = name || clerkUser.fullName || 'User Profile';
  const displayPhotoUrl = clerkUser.imageUrl || appUserDetails?.photoURL;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
       <div className="mb-6">
        <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </div>
      <Card className="shadow-xl rounded-lg">
        <CardHeader className="text-center relative p-6">
          <Avatar className="mx-auto h-24 w-24 mb-4 border-2 border-primary">
            <AvatarImage src={displayPhotoUrl || `https://picsum.photos/seed/${clerkUser.id}/200/200`} alt={displayName} data-ai-hint="profile large person"/>
            <AvatarFallback className="text-3xl">{displayName ? displayName.charAt(0).toUpperCase() : <UserCircle className="h-12 w-12" />}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-bold">{displayName}</CardTitle>
          <CardDescription>{displayEmail}</CardDescription>
          {!isEditing && (
            <Button variant="outline" size="sm" className="absolute top-4 right-4" onClick={() => setIsEditing(true)} disabled={isSaving}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit App Details
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {isEditing ? (
            <form onSubmit={handleSaveChanges} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="edit-name">Full Name * (App Specific)</Label><Input id="edit-name" value={name} onChange={e => setName(e.target.value)} required disabled={isSaving}/></div>
                <div>
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select value={gender} onValueChange={v => setGender(v as any)} disabled={isSaving}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="edit-dob">Date of Birth</Label><Input id="edit-dob" type="date" value={dob} onChange={e => setDob(e.target.value)} disabled={isSaving}/></div>
                <div><Label htmlFor="edit-phone">Phone Number</Label><Input id="edit-phone" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+91 XXXXX XXXXX" disabled={isSaving}/></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-district">District (Karnataka) *</Label>
                  <Select value={district} onValueChange={v => { setDistrict(v as KarnatakaDistrict); setCity(''); setCustomCity(''); }} required disabled={isSaving}>
                    <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent>{KARNATAKA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-city">City/Town (Karnataka)</Label>
                  <Select value={city} onValueChange={v => setCity(v as KarnatakaCity | 'Other')} disabled={isSaving || !district}>
                    <SelectTrigger><SelectValue placeholder="Select city/town" /></SelectTrigger>
                    <SelectContent>
                        {KARNATAKA_CITIES.map(c => <SelectItem key={`city-profile-${c}`} value={c}>{c}</SelectItem>)}
                        <SelectItem key="city-profile-other" value="Other">Other (Please specify)</SelectItem>
                    </SelectContent>
                  </Select>
                  {city === 'Other' && <Input type="text" placeholder="Enter your city/town" value={customCity} onChange={e => setCustomCity(e.target.value)} className="mt-2" disabled={isSaving}/>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-language">Language Preference *</Label>
                  <Select value={languagePreference} onValueChange={v => setLanguagePreference(v as LanguagePreference)} required disabled={isSaving}>
                    <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                    <SelectContent>{LANGUAGE_PREFERENCES.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor="edit-college">College/Institution</Label><Input id="edit-college" value={collegeOrInstitution} onChange={e => setCollegeOrInstitution(e.target.value)} disabled={isSaving}/></div>
              </div>
              <div>
                <Label>Interests</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 border rounded-md max-h-40 overflow-y-auto mt-1">
                  {USER_INTERESTS.map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox id={`edit-interest-${interest.replace(/\s+/g, '-')}`} checked={interests.includes(interest)} onCheckedChange={() => handleInterestChange(interest)} disabled={isSaving}/>
                      <Label htmlFor={`edit-interest-${interest.replace(/\s+/g, '-')}`} className="text-sm font-normal cursor-pointer">{interest}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-sm">
              <ProfileDetail label="Full Name (from Clerk)" value={clerkUser.fullName || 'N/A'} />
              <ProfileDetail label="Email ID" value={displayEmail} />
              <ProfileDetail label="App-specific Name" value={name} />
              <ProfileDetail label="Gender" value={gender} />
              <ProfileDetail label="Date of Birth" value={dob ? new Date(dob).toLocaleDateString('en-IN') : undefined} />
              <ProfileDetail label="Phone Number" value={phoneNumber} />
              <ProfileDetail label="District" value={district} />
              <ProfileDetail label="City/Town" value={customCity || city} />
              <ProfileDetail label="Language Preference" value={languagePreference} />
              <ProfileDetail label="College/Institution" value={collegeOrInstitution} />
              <ProfileDetail label="Interests" value={interests?.join(', ')} />
              <ProfileDetail label="Member Since" value={clerkUser.createdAt ? new Date(clerkUser.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : 'N/A'} />
              <Button variant="destructive" onClick={() => signOut(() => router.push('/'))} className="w-full mt-6" disabled={isSaving}>
                <LogOut className="mr-2 h-4 w-4" /> Log Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileDetail({ label, value }: { label: string, value?: string | null }) {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) return null;
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-3 pt-1">
      <span className="font-medium text-muted-foreground mb-1 sm:mb-0">{label}:</span>
      <span className="text-foreground sm:text-right">{value}</span>
    </div>
  );
}
