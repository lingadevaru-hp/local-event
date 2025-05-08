
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit3, UserCircle, ArrowLeft, Save } from 'lucide-react';
import { KARNATAKA_DISTRICTS, KARNATAKA_CITIES, LANGUAGE_PREFERENCES, USER_INTERESTS, type User, type KarnatakaDistrict, type KarnatakaCity, type LanguagePreference, type UserInterest } from '@/types/event';
// import { useAuth } from '@/contexts/authContext'; // Removed, use Clerk
import { useUser as useClerkUser, UserProfile as ClerkUserProfile } from '@clerk/nextjs'; // Added Clerk's useUser
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MOCK_USER_DATA } from '@/lib/mockEvents'; // Using mock data for now

let MOCK_USER_DATA_MUTABLE = { ...MOCK_USER_DATA }; // Make it mutable

export default function ProfilePage() {
  // const { currentUser, loading: authLoading, updateUserProfile } = useAuth(); // Removed
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useClerkUser();
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say' | ''>('');
  const [dob, setDob] = useState('');
  const [district, setDistrict] = useState<KarnatakaDistrict | ''>('');
  const [city, setCity] = useState<KarnatakaCity | string>('');
  const [customCity, setCustomCity] = useState('');
  const [languagePreference, setLanguagePreference] = useState<LanguagePreference | ''>('');
  const [collegeOrInstitution, setCollegeOrInstitution] = useState('');
  const [interests, setInterests] = useState<UserInterest[]>([]);


  useEffect(() => {
    if (clerkLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/profile'); // Redirect to Clerk sign-in
    } else if (clerkLoaded && isSignedIn && clerkUser) {
      // Map Clerk user data to your User type or use Clerk's profile component
      // For now, continue with mock data logic, but ideally fetch/map from Clerk
      const userDataFromClerkOrBackend: User = {
        id: clerkUser.id,
        name: clerkUser.fullName || '',
        username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] || '',
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        photoURL: clerkUser.imageUrl || MOCK_USER_DATA_MUTABLE.photoURL,
        // These fields would typically come from your backend or Clerk metadata
        gender: MOCK_USER_DATA_MUTABLE.gender,
        dob: MOCK_USER_DATA_MUTABLE.dob,
        district: MOCK_USER_DATA_MUTABLE.district,
        city: MOCK_USER_DATA_MUTABLE.city,
        customCity: MOCK_USER_DATA_MUTABLE.customCity,
        languagePreference: MOCK_USER_DATA_MUTABLE.languagePreference,
        collegeOrInstitution: MOCK_USER_DATA_MUTABLE.collegeOrInstitution,
        interests: MOCK_USER_DATA_MUTABLE.interests,
        createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
      };
      setUser(userDataFromClerkOrBackend);
      setName(userDataFromClerkOrBackend.name);
      setEmail(userDataFromClerkOrBackend.email);
      setGender(userDataFromClerkOrBackend.gender || '');
      setDob(userDataFromClerkOrBackend.dob || '');
      setDistrict(userDataFromClerkOrBackend.district || '');
      setCity(userDataFromClerkOrBackend.city || '');
      setCustomCity(userDataFromClerkOrBackend.customCity || '');
      setLanguagePreference(userDataFromClerkOrBackend.languagePreference || '');
      setCollegeOrInstitution(userDataFromClerkOrBackend.collegeOrInstitution || '');
      setInterests(userDataFromClerkOrBackend.interests || []);
      setIsLoading(false);
    }
  }, [clerkLoaded, isSignedIn, clerkUser, router]);

  const handleInterestChange = (interest: UserInterest) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    const updatedUserData: User = {
      ...user,
      name,
      email, // Email might not be editable via this form if managed by Clerk primary email
      gender: gender as User['gender'],
      dob,
      district: district as KarnatakaDistrict,
      city: city as (KarnatakaCity | string),
      customCity: city === 'Other' ? customCity : '',
      languagePreference: languagePreference as LanguagePreference,
      collegeOrInstitution,
      interests,
    };

    // Simulate update, ideally this would update Clerk metadata or your backend
    // await updateUserProfile(updatedUserData); // Removed
    console.log("Simulating profile update with:", updatedUserData);
    // For demo persistence with mock data:
    MOCK_USER_DATA_MUTABLE = updatedUserData; 
    setUser(updatedUserData); // Update local state
    
    toast({ title: 'Profile Updated!', description: 'Your profile information has been saved.' });
    setIsEditing(false);
    setIsLoading(false);
  };
  
  if (isLoading || !clerkLoaded) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
     // This case should be handled by the redirect in useEffect, but as a fallback:
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p>Please sign in to view your profile.</p>
            <Button asChild className="mt-4"><Link href="/sign-in">Sign In</Link></Button>
        </div>
    );
  }
  
  // If using Clerk's built-in profile UI:
  // return <ClerkUserProfile path="/profile" routing="path" />;

  // Custom profile UI:
  if (!user) {
    return <div className="container mx-auto px-4 py-8">User data not found.</div>;
  }


  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
       <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center">
          <UserCircle className="mr-3 h-8 w-8" /> Your Profile
        </h1>
        <Button variant="outline" asChild>
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Home</Link>
        </Button>
      </div>

      <Card className="shadow-xl rounded-2xl bg-card/70 glassmorphism border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.id}/100/100`} alt={user.name} data-ai-hint="user avatar" />
              <AvatarFallback className="text-2xl bg-muted">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="rounded-lg">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
        </CardHeader>
        
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><Label htmlFor="name">Full Name</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} required className="bg-background/70 rounded-lg" /></div>
                <div><Label htmlFor="email">Email (Cannot Change Here)</Label><Input id="email" value={email} disabled className="bg-muted/50 rounded-lg" /></div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={v => setGender(v as User['gender'])} >
                    <SelectTrigger className="bg-background/70 rounded-lg"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                    <SelectContent className="bg-popover glassmorphism">
                      {['Male', 'Female', 'Other', 'Prefer not to say'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor="dob">Date of Birth</Label><Input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)} className="bg-background/70 rounded-lg" /></div>
              </div>

              <div className="border-t border-border/50 pt-6 mt-6">
                <h3 className="text-lg font-medium text-primary mb-4">Location & Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="district">District (Karnataka)</Label>
                        <Select value={district} onValueChange={v => setDistrict(v as KarnatakaDistrict)}>
                            <SelectTrigger className="bg-background/70 rounded-lg"><SelectValue placeholder="Select District" /></SelectTrigger>
                            <SelectContent className="bg-popover glassmorphism">{KARNATAKA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="city">City (Karnataka)</Label>
                        <Select value={city} onValueChange={v => { setCity(v); if(v !== 'Other') setCustomCity(''); }}>
                            <SelectTrigger className="bg-background/70 rounded-lg"><SelectValue placeholder="Select City" /></SelectTrigger>
                            <SelectContent className="bg-popover glassmorphism">
                            {KARNATAKA_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            <SelectItem value="Other">Other (Please specify)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {city === 'Other' && (
                        <div className="md:col-span-2"><Label htmlFor="customCity">Specify City</Label><Input id="customCity" value={customCity} onChange={e => setCustomCity(e.target.value)} className="bg-background/70 rounded-lg" /></div>
                    )}
                    <div>
                        <Label htmlFor="languagePreference">Language Preference</Label>
                        <Select value={languagePreference} onValueChange={v => setLanguagePreference(v as LanguagePreference)}>
                            <SelectTrigger className="bg-background/70 rounded-lg"><SelectValue placeholder="Select Language" /></SelectTrigger>
                            <SelectContent className="bg-popover glassmorphism">{LANGUAGE_PREFERENCES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
              </div>
              
              <div className="border-t border-border/50 pt-6 mt-6">
                <h3 className="text-lg font-medium text-primary mb-4">Academics & Interests</h3>
                <div><Label htmlFor="college">College/Institution</Label><Input id="college" value={collegeOrInstitution} onChange={e => setCollegeOrInstitution(e.target.value)} placeholder="e.g., Bangalore University" className="bg-background/70 rounded-lg" /></div>
                <div className="mt-4">
                  <Label>Interests</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                    {USER_INTERESTS.map(interest => (
                      <Button key={interest} type="button" variant={interests.includes(interest) ? 'default' : 'outline'} onClick={() => handleInterestChange(interest)} className="text-xs justify-start rounded-md">
                        {interest}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-6 flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading} className="rounded-lg">Cancel</Button>
                <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white rounded-lg">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes
                </Button>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="pt-6 space-y-3">
            <InfoRow label="Gender" value={user.gender || 'Not specified'} />
            <InfoRow label="Date of Birth" value={user.dob ? new Date(user.dob).toLocaleDateString('en-IN') : 'Not specified'} />
            <InfoRow label="District" value={user.district || 'Not specified'} />
            <InfoRow label="City" value={user.city === 'Other' ? user.customCity : user.city || 'Not specified'} />
            <InfoRow label="Language Preference" value={user.languagePreference || 'Not specified'} />
            <InfoRow label="College/Institution" value={user.collegeOrInstitution || 'Not specified'} />
            <InfoRow label="Interests" value={user.interests?.join(', ') || 'Not specified'} />
          </CardContent>
        )}
      </Card>
    </div>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-2 border-b border-border/30 last:border-b-0">
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-medium text-foreground text-right">{value}</span>
  </div>
);

