
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Edit3, UserCircle } from 'lucide-react'; // Added UserCircle
import { KARNATAKA_DISTRICTS, KARNATAKA_CITIES, LANGUAGE_PREFERENCES, USER_INTERESTS, type User, type KarnatakaDistrict, type KarnatakaCity, type LanguagePreference, type UserInterest } from '@/types/event';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
// import { doc, getDoc, setDoc } from 'firebase/firestore'; // Firestore imports for profile data
// import { firestore } from '@/lib/firebase'; // Firestore instance

const createInitialUserDataFromAuth = (firebaseUser: import('firebase/auth').User): User => {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || '',
    username: firebaseUser.displayName?.replace(/\s+/g, '').toLowerCase() || firebaseUser.email?.split('@')[0] || 'user',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || undefined,
    languagePreference: 'English', // Default
    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
  };
};


export default function ProfilePage() {
  const { currentUser, loading: authLoading } = useAuth();
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
  const [city, setCity] = useState<KarnatakaCity | ''>('');
  const [customCity, setCustomCity] = useState('');
  const [languagePreference, setLanguagePreference] = useState<LanguagePreference | ''>('');
  const [collegeOrInstitution, setCollegeOrInstitution] = useState('');
  const [interests, setInterests] = useState<UserInterest[]>([]);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
      return;
    }

    if (currentUser && !userProfile) { // Fetch or initialize profile only once
      const fetchUserProfile = async () => {
        setIsLoadingProfile(true);
        // TODO: Implement actual Firestore fetch
        // const userDocRef = doc(firestore, 'users', currentUser.uid);
        // const userDocSnap = await getDoc(userDocRef);

        let profileData: User;
        // if (userDocSnap.exists()) {
        //   profileData = userDocSnap.data() as User;
        //   // Ensure core auth fields are up-to-date
        //   profileData.name = currentUser.displayName || profileData.name;
        //   profileData.email = currentUser.email || profileData.email;
        //   profileData.photoURL = currentUser.photoURL || profileData.photoURL;
        // } else {
          // New user or no profile in Firestore yet, create from auth
          profileData = createInitialUserDataFromAuth(currentUser);
          // Optionally, save this initial profile to Firestore immediately
          // await setDoc(userDocRef, profileData); 
        // }
        
        // Mocking profile data fetch for now
        await new Promise(resolve => setTimeout(resolve, 500));
        profileData = createInitialUserDataFromAuth(currentUser); 
        // Add some mock details if desired for new users for testing
        // profileData.district = 'Bengaluru Urban'; 
        // profileData.languagePreference = 'English';

        setUserProfile(profileData);
        
        // Initialize form fields
        setName(profileData.name);
        setGender(profileData.gender || '');
        setDob(profileData.dob || '');
        setPhoneNumber(profileData.phoneNumber || '');
        setDistrict(profileData.district || '');
        setCity(profileData.city || '');
        setCustomCity(profileData.customCity || '');
        setLanguagePreference(profileData.languagePreference || 'English');
        setCollegeOrInstitution(profileData.collegeOrInstitution || '');
        setInterests(profileData.interests || []);
        setIsLoadingProfile(false);
      };
      fetchUserProfile();
    } else if (!currentUser && !authLoading) { // Ensure profile loader stops if user logs out
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

    setIsSaving(true);
    
    const updatedUserData: User = {
      ...userProfile,
      name,
      gender: gender || undefined,
      dob: dob || undefined,
      phoneNumber: phoneNumber || undefined,
      district: district || undefined,
      city: city === 'Other' ? undefined : (city || undefined),
      customCity: city === 'Other' ? (customCity || undefined) : undefined,
      languagePreference: languagePreference as LanguagePreference,
      collegeOrInstitution: collegeOrInstitution || undefined,
      interests: interests.length > 0 ? interests : undefined,
      // Ensure core auth fields are preserved or updated if changed via Firebase Auth directly
      photoURL: currentUser.photoURL || userProfile.photoURL, 
    };

    // TODO: Implement actual Firestore save
    // const userDocRef = doc(firestore, 'users', currentUser.uid);
    // await setDoc(userDocRef, updatedUserData, { merge: true });
    console.log("Saving user data (mock):", updatedUserData);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setUserProfile(updatedUserData); 
    
    toast({ title: 'Profile Updated!', description: 'Your profile information has been saved.' });
    setIsSaving(false);
    setIsEditing(false);
  };
  
  if (authLoading || isLoadingProfile || !userProfile) { 
    return <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card className="shadow-xl">
        <CardHeader className="text-center relative">
          <Avatar className="mx-auto h-24 w-24 mb-4 border-2 border-primary">
            <AvatarImage src={userProfile.photoURL || `https://picsum.photos/seed/${userProfile.username}/200/200`} alt={userProfile.name} data-ai-hint="profile large person"/>
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
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSaveChanges} className="space-y-6">
              {/* Form fields as before, ensuring `disabled={isSaving}` */}
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
                  <Select value={district} onValueChange={v => setDistrict(v as KarnatakaDistrict)} required disabled={isSaving}>
                    <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent>{KARNATAKA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-city">City/Town (Karnataka)</Label>
                  <Select value={city} onValueChange={v => setCity(v as KarnatakaCity)} disabled={isSaving || !district}>
                    <SelectTrigger><SelectValue placeholder="Select city/town" /></SelectTrigger>
                    <SelectContent>{KARNATAKA_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 border rounded-md max-h-40 overflow-y-auto mt-1">
                  {USER_INTERESTS.map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox id={`edit-interest-${interest.replace(/\s+/g, '-')}`} checked={interests.includes(interest)} onCheckedChange={() => handleInterestChange(interest)} disabled={isSaving}/>
                      <Label htmlFor={`edit-interest-${interest.replace(/\s+/g, '-')}`} className="text-sm font-normal">{interest}</Label>
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
              <ProfileDetail label="Gender" value={userProfile.gender} />
              <ProfileDetail label="Date of Birth" value={userProfile.dob ? new Date(userProfile.dob).toLocaleDateString('en-IN') : undefined} />
              <ProfileDetail label="Phone Number" value={userProfile.phoneNumber} />
              <ProfileDetail label="District" value={userProfile.district} />
              <ProfileDetail label="City/Town" value={userProfile.customCity || userProfile.city} />
              <ProfileDetail label="Language Preference" value={userProfile.languagePreference} />
              <ProfileDetail label="College/Institution" value={userProfile.collegeOrInstitution} />
              <ProfileDetail label="Interests" value={userProfile.interests?.join(', ')} />
              <ProfileDetail label="Member Since" value={new Date(userProfile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileDetail({ label, value }: { label: string, value?: string }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="font-medium text-muted-foreground">{label}:</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  );
}
