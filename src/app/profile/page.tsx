
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Edit3, UserCircle, ArrowLeft } from 'lucide-react';
import { KARNATAKA_DISTRICTS, KARNATAKA_CITIES, LANGUAGE_PREFERENCES, USER_INTERESTS, type User, type KarnatakaDistrict, type KarnatakaCity, type LanguagePreference, type UserInterest } from '@/types/event';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Mock data storage for user profiles (replace with backend in real app)
let MOCK_USER_PROFILES: Record<string, User> = {};


export default function ProfilePage() {
  const { currentUser, loading: authLoading, logout, updateUserProfile: authUpdateUserProfile } = useAuth();
  const router = useRouter();
  
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say' | ''>('');
  const [dob, setDob] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [district, setDistrict] = useState<KarnatakaDistrict | ''>('');
  const [city, setCity] = useState<KarnatakaCity | 'Other' | ''>(''); // Allow 'Other'
  const [customCity, setCustomCity] = useState('');
  const [languagePreference, setLanguagePreference] = useState<LanguagePreference | ''>('');
  const [collegeOrInstitution, setCollegeOrInstitution] = useState('');
  const [interests, setInterests] = useState<UserInterest[]>([]);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login?redirect=/profile');
      return;
    }

    if (currentUser && !userProfile) { 
      const fetchUserProfile = async () => {
        setIsLoadingProfile(true);
        // Simulate fetching profile from our mock store or use currentUser directly
        let profileData = MOCK_USER_PROFILES[currentUser.id] || currentUser;
        
        // If not in mock store, add it (could happen if user logged in via OTP without prior full registration)
        if (!MOCK_USER_PROFILES[currentUser.id]) {
            MOCK_USER_PROFILES[currentUser.id] = profileData;
        }

        setUserProfile(profileData);
        
        // Initialize form fields
        setName(profileData.name || ''); // currentUser.name is from AuthContext
        setGender(profileData.gender || '');
        setDob(profileData.dob || '');
        setPhoneNumber(profileData.phoneNumber || '');
        setDistrict(profileData.district || '');
        setCity(profileData.customCity ? 'Other' : (profileData.city as KarnatakaCity | 'Other' | '') || '');
        setCustomCity(profileData.customCity || '');
        setLanguagePreference(profileData.languagePreference || 'English');
        setCollegeOrInstitution(profileData.collegeOrInstitution || '');
        setInterests(profileData.interests || []);
        setIsLoadingProfile(false);
      };
      fetchUserProfile();
    } else if (!currentUser && !authLoading) { 
        setIsLoadingProfile(false);
    }
  }, [currentUser, authLoading, router, userProfile]);


  const handleInterestChange = (interest: UserInterest) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !currentUser) return;
    if (!name || !district || !languagePreference) {
        toast({ title: "Missing Required Fields", description: "Name, District, and Language Preference are required.", variant: "destructive"});
        return;
    }
    if (city === 'Other' && !customCity) {
        toast({ title: "Missing Required Fields", description: "Please specify your city/town if 'Other' is selected.", variant: "destructive"});
        return;
    }


    setIsSaving(true);
    
    const updatedUserData: User = {
      ...userProfile, // Keep existing fields like id, email, createdAt
      name,
      gender: gender || undefined,
      dob: dob || undefined,
      phoneNumber: phoneNumber || undefined,
      district: district as KarnatakaDistrict,
      city: city === 'Other' ? undefined : (city as KarnatakaCity | undefined),
      customCity: city === 'Other' ? (customCity || undefined) : undefined,
      languagePreference: languagePreference as LanguagePreference,
      collegeOrInstitution: collegeOrInstitution || undefined,
      interests: interests.length > 0 ? interests : undefined,
      // photoURL from Auth context might be from Google, etc. Retain it.
      photoURL: currentUser.photoURL || userProfile.photoURL, 
    };

    // Simulate saving to backend/mock store
    await new Promise(resolve => setTimeout(resolve, 1000));
    MOCK_USER_PROFILES[currentUser.id] = updatedUserData;
    setUserProfile(updatedUserData); 
    // Update user in AuthContext and localStorage
    authUpdateUserProfile(updatedUserData);
    
    toast({ title: 'Profile Updated!', description: 'Your profile information has been saved.' });
    setIsSaving(false);
    setIsEditing(false);
  };
  
  if (authLoading || isLoadingProfile || !userProfile) { 
    return <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

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
            <AvatarImage src={userProfile.photoURL || `https://picsum.photos/seed/${userProfile.id}/200/200`} alt={userProfile.name || 'User'} data-ai-hint="profile large person"/>
            <AvatarFallback className="text-3xl">{userProfile.name ? userProfile.name.charAt(0).toUpperCase() : <UserCircle className="h-12 w-12" />}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-bold">{userProfile.name || 'User Profile'}</CardTitle>
          <CardDescription>{userProfile.email}</CardDescription>
          {!isEditing && (
            <Button variant="outline" size="sm" className="absolute top-4 right-4" onClick={() => setIsEditing(true)} disabled={isSaving}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {isEditing ? (
            <form onSubmit={handleSaveChanges} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="edit-name">Full Name *</Label><Input id="edit-name" value={name} onChange={e => setName(e.target.value)} required disabled={isSaving}/></div>
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
                        {KARNATAKA_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
              <ProfileDetail label="Full Name" value={userProfile.name} />
              <ProfileDetail label="Email ID" value={userProfile.email} />
              <ProfileDetail label="Gender" value={userProfile.gender} />
              <ProfileDetail label="Date of Birth" value={userProfile.dob ? new Date(userProfile.dob).toLocaleDateString('en-IN') : undefined} />
              <ProfileDetail label="Phone Number" value={userProfile.phoneNumber} />
              <ProfileDetail label="District" value={userProfile.district} />
              <ProfileDetail label="City/Town" value={userProfile.customCity || userProfile.city} />
              <ProfileDetail label="Language Preference" value={userProfile.languagePreference} />
              <ProfileDetail label="College/Institution" value={userProfile.collegeOrInstitution} />
              <ProfileDetail label="Interests" value={userProfile.interests?.join(', ')} />
              <ProfileDetail label="Member Since" value={new Date(userProfile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })} />
              <Button variant="destructive" onClick={logout} className="w-full mt-6" disabled={isSaving}>
                Log Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileDetail({ label, value }: { label: string, value?: string }) {
  if (value === undefined || value === null || value.trim() === '') return null;
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-3 pt-1">
      <span className="font-medium text-muted-foreground mb-1 sm:mb-0">{label}:</span>
      <span className="text-foreground sm:text-right">{value}</span>
    </div>
  );
}
