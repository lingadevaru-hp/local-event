'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserCircle, Save, Edit3 } from 'lucide-react';
import { KARNATAKA_DISTRICTS, KARNATAKA_CITIES, LANGUAGE_PREFERENCES, USER_INTERESTS, type User, type KarnatakaDistrict, type KarnatakaCity, type LanguagePreference, type UserInterest } from '@/types/event';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock current user data - replace with actual fetch from auth context/API
const MOCK_USER_DATA: User = {
  id: 'devUser123',
  name: 'Ananya Kulkarni',
  username: 'AnanyaK',
  gender: 'Female',
  dob: '1995-08-15',
  email: 'ananya.k@example.com',
  phoneNumber: '+919876543210',
  district: 'Bengaluru Urban',
  city: 'Bengaluru',
  languagePreference: 'Kannada',
  collegeOrInstitution: 'PES University',
  interests: ['Tech Fests', 'Startup Meets', 'Music'],
  createdAt: '2023-05-10',
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form state for editing
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
    // Simulate fetching user data
    setIsLoading(true);
    setTimeout(() => {
      setUser(MOCK_USER_DATA);
      // Initialize form fields if user data is loaded
      setName(MOCK_USER_DATA.name);
      setGender(MOCK_USER_DATA.gender || '');
      setDob(MOCK_USER_DATA.dob || '');
      setPhoneNumber(MOCK_USER_DATA.phoneNumber || '');
      setDistrict(MOCK_USER_DATA.district || '');
      setCity(MOCK_USER_DATA.city || '');
      setCustomCity(MOCK_USER_DATA.customCity || '');
      setLanguagePreference(MOCK_USER_DATA.languagePreference);
      setCollegeOrInstitution(MOCK_USER_DATA.collegeOrInstitution || '');
      setInterests(MOCK_USER_DATA.interests || []);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleInterestChange = (interest: UserInterest) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call to update user profile
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const updatedUserData: User = {
      ...user!, // Assume user is not null here
      name,
      gender: gender || undefined,
      dob: dob || undefined,
      phoneNumber: phoneNumber || undefined,
      district: district || undefined,
      city: city === 'Other' ? undefined : (city || undefined),
      customCity: city === 'Other' ? (customCity || undefined) : undefined,
      languagePreference: languagePreference as LanguagePreference, // Assuming it's always set
      collegeOrInstitution: collegeOrInstitution || undefined,
      interests: interests.length > 0 ? interests : undefined,
    };
    setUser(updatedUserData); // Update local state
    MOCK_USER_DATA = updatedUserData; // Update mock source for demo persistence
    
    toast({ title: 'Profile Updated!', description: 'Your profile information has been saved.' });
    setIsLoading(false);
    setIsEditing(false);
  };
  
  if (isLoading && !user) {
    return <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return <div className="container mx-auto text-center py-10">Could not load user profile. Please try again.</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card className="shadow-xl">
        <CardHeader className="text-center relative">
          <Avatar className="mx-auto h-24 w-24 mb-4 border-2 border-primary">
            <AvatarImage src={`https://picsum.photos/seed/${user.username}/200/200`} alt={user.name} data-ai-hint="profile large person" />
            <AvatarFallback className="text-3xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
          {!isEditing && (
            <Button variant="outline" size="sm" className="absolute top-4 right-4" onClick={() => setIsEditing(true)}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSaveChanges} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="edit-name">Full Name *</Label><Input id="edit-name" value={name} onChange={e => setName(e.target.value)} required /></div>
                <div>
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select value={gender} onValueChange={v => setGender(v as any)}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="edit-dob">Date of Birth</Label><Input id="edit-dob" type="date" value={dob} onChange={e => setDob(e.target.value)} /></div>
                <div><Label htmlFor="edit-phone">Phone Number</Label><Input id="edit-phone" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+91 XXXXX XXXXX" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-district">District (Karnataka) *</Label>
                  <Select value={district} onValueChange={v => setDistrict(v as KarnatakaDistrict)} required>
                    <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent>{KARNATAKA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-city">City/Town (Karnataka)</Label>
                  <Select value={city} onValueChange={v => setCity(v as KarnatakaCity)} disabled={!district}>
                    <SelectTrigger><SelectValue placeholder="Select city/town" /></SelectTrigger>
                    <SelectContent>{KARNATAKA_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  {city === 'Other' && <Input type="text" placeholder="Enter your city/town" value={customCity} onChange={e => setCustomCity(e.target.value)} className="mt-2" />}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-language">Language Preference *</Label>
                  <Select value={languagePreference} onValueChange={v => setLanguagePreference(v as LanguagePreference)} required>
                    <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                    <SelectContent>{LANGUAGE_PREFERENCES.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor="edit-college">College/Institution</Label><Input id="edit-college" value={collegeOrInstitution} onChange={e => setCollegeOrInstitution(e.target.value)} /></div>
              </div>
              <div>
                <Label>Interests</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 border rounded-md max-h-40 overflow-y-auto mt-1">
                  {USER_INTERESTS.map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox id={`edit-interest-${interest.replace(/\s+/g, '-')}`} checked={interests.includes(interest)} onCheckedChange={() => handleInterestChange(interest)} />
                      <Label htmlFor={`edit-interest-${interest.replace(/\s+/g, '-')}`} className="text-sm font-normal">{interest}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>Cancel</Button>
                <Button type="submit" disabled={isLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-sm">
              <ProfileDetail label="Full Name" value={user.name} />
              <ProfileDetail label="Gender" value={user.gender} />
              <ProfileDetail label="Date of Birth" value={user.dob ? new Date(user.dob).toLocaleDateString('en-IN') : undefined} />
              <ProfileDetail label="Phone Number" value={user.phoneNumber} />
              <ProfileDetail label="District" value={user.district} />
              <ProfileDetail label="City/Town" value={user.customCity || user.city} />
              <ProfileDetail label="Language Preference" value={user.languagePreference} />
              <ProfileDetail label="College/Institution" value={user.collegeOrInstitution} />
              <ProfileDetail label="Interests" value={user.interests?.join(', ')} />
              <ProfileDetail label="Member Since" value={new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileDetail({ label, value }: { label: string, value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="font-medium text-muted-foreground">{label}:</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  );
}

