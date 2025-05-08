
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Edit3, UserCircle, ArrowLeft, LogOut, School, ThumbsUp, MapPin, Languages as LanguagesIcon } from 'lucide-react';
import { KARNATAKA_DISTRICTS, KARNATAKA_CITIES, LANGUAGE_PREFERENCES, USER_INTERESTS, type User as AppUser, type KarnatakaDistrict, type KarnatakaCity, type LanguagePreference, type UserInterest } from '@/types/event';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/authContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';


export default function ProfilePage() {
  const { currentUser, appUser, loading: authLoading, signOut, fetchAppUser, updateAppUser: updateAppUserInDb } = useAuth();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say' | ''>('');
  const [dob, setDob] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [district, setDistrict] = useState<KarnatakaDistrict | ''>('');
  const [city, setCity] = useState<KarnatakaCity | 'Other' | ''>('');
  const [customCity, setCustomCity] = useState('');
  const [languagePreference, setLanguagePreference] = useState<LanguagePreference | ''>('');
  const [collegeOrInstitution, setCollegeOrInstitution] = useState('');
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState(''); // For manually updating photo URL

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login?redirect_url=/profile'); 
      return;
    }

    if (currentUser && appUser) {
      setName(appUser.name || currentUser.displayName || '');
      setGender(appUser.gender || '');
      setDob(appUser.dob || '');
      setPhoneNumber(appUser.phoneNumber || currentUser.phoneNumber || ''); 
      setDistrict(appUser.district || '');
      setCity(appUser.customCity ? 'Other' : (appUser.city as KarnatakaCity | 'Other' | '') || '');
      setCustomCity(appUser.customCity || '');
      setLanguagePreference(appUser.languagePreference || 'English');
      setCollegeOrInstitution(appUser.collegeOrInstitution || '');
      setInterests(appUser.interests || []);
      setPhotoUrlInput(appUser.photoURL || currentUser.photoURL || '');
    } else if (currentUser && !appUser && !authLoading) { // Firebase user exists, but no app profile yet
        setName(currentUser.displayName || '');
        setPhoneNumber(currentUser.phoneNumber || '');
        setPhotoUrlInput(currentUser.photoURL || '');
        setLanguagePreference('English'); // Default
        // Consider fetching or creating a default profile here if needed
        // For now, user can fill it out.
    }
  }, [authLoading, currentUser, appUser, router]);


  const handleInterestChange = (interest: UserInterest) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSaveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
        toast({ title: "Not Authenticated", description: "Please log in to update your profile.", variant: "destructive" });
        return;
    }
    if (!name || !district || !languagePreference) {
        toast({ title: "Missing Required Fields", description: "Name, District, and Language Preference are required.", variant: "destructive"});
        return;
    }
    if (city === 'Other' && !customCity) {
        toast({ title: "Missing Required Fields", description: "Please specify your city/town if 'Other' is selected.", variant: "destructive"});
        return;
    }

    setIsSaving(true);
    
    const updatedAppUserData: Partial<AppUser> = {
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
      photoURL: photoUrlInput || currentUser.photoURL || undefined,
      // email is managed by Firebase Auth, id/uid and createdAt are set on creation
    };

    try {
      // Update Firebase Auth profile (displayName, photoURL)
      await updateFirebaseProfile(currentUser, { 
        displayName: name,
        photoURL: photoUrlInput || currentUser.photoURL // Only update if photoUrlInput has a value or existing URL
      });

      // Update Firestore app user profile
      await updateAppUserInDb(updatedAppUserData);
      
      toast({ title: 'Profile Updated!', description: 'Your profile information has been saved.' });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: 'Update Failed', description: 'Could not save your profile changes. Please try again.', variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      toast({ title: "Sign Out Failed", description: "Could not sign out. Please try again.", variant: "destructive" });
    }
  };

  if (authLoading || (!currentUser && !authLoading)) { // Show loader if auth is loading or if redirecting
    return <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  // This check should ideally be covered by the useEffect redirect, but as a safeguard:
  if (!currentUser) {
     return <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center"><p>Redirecting to login...</p><Loader2 className="ml-2 h-5 w-5 animate-spin"/></div>;
  }


  const displayEmail = currentUser.email || 'No email';
  const displayName = name || currentUser.displayName || 'User Profile';
  const displayPhotoUrl = photoUrlInput || appUser?.photoURL || currentUser.photoURL || `https://picsum.photos/seed/${currentUser.uid}/200/200`;

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
            <AvatarImage src={displayPhotoUrl} alt={displayName} data-ai-hint="profile large person"/>
            <AvatarFallback className="text-3xl">{displayName ? displayName.charAt(0).toUpperCase() : <UserCircle className="h-12 w-12" />}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-bold">{displayName}</CardTitle>
          <CardDescription>{displayEmail}</CardDescription>
          {!isEditing && (
            <Button variant="outline" size="sm" className="absolute top-4 right-4" onClick={() => setIsEditing(true)} disabled={isSaving}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {isEditing ? (
            <form onSubmit={handleSaveChanges} className="space-y-6">
              <div><Label htmlFor="edit-name">Full Name *</Label><Input id="edit-name" value={name} onChange={e => setName(e.target.value)} required disabled={isSaving}/></div>
              <div>
                <Label htmlFor="edit-photo-url">Photo URL</Label>
                <Input id="edit-photo-url" type="url" value={photoUrlInput} onChange={e => setPhotoUrlInput(e.target.value)} placeholder="https://example.com/image.png" disabled={isSaving}/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select value={gender} onValueChange={v => setGender(v as any)} disabled={isSaving}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent>
                  </Select>
                </div>
                 <div><Label htmlFor="edit-dob">Date of Birth</Label><Input id="edit-dob" type="date" value={dob} onChange={e => setDob(e.target.value)} disabled={isSaving}/></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="edit-phone">Phone Number</Label><Input id="edit-phone" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+91 XXXXX XXXXX" disabled={isSaving}/></div>
                 <div>
                  <Label htmlFor="edit-district">District (Karnataka) *</Label>
                  <Select value={district} onValueChange={v => { setDistrict(v as KarnatakaDistrict); setCity(''); setCustomCity(''); }} required disabled={isSaving}>
                    <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent>{KARNATAKA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-city">City/Town</Label>
                  <Select value={city} onValueChange={v => setCity(v as KarnatakaCity | 'Other')} disabled={isSaving || !district}>
                    <SelectTrigger><SelectValue placeholder="Select city/town" /></SelectTrigger>
                    <SelectContent>
                        {KARNATAKA_CITIES.map(c => <SelectItem key={`city-profile-edit-${c}`} value={c}>{c}</SelectItem>)}
                        <SelectItem key="city-profile-edit-other" value="Other">Other (Please specify)</SelectItem>
                    </SelectContent>
                  </Select>
                  {city === 'Other' && <Input type="text" placeholder="Enter your city/town" value={customCity} onChange={e => setCustomCity(e.target.value)} className="mt-2" disabled={isSaving}/>}
                </div>
                 <div>
                  <Label htmlFor="edit-language">Language Preference *</Label>
                  <Select value={languagePreference} onValueChange={v => setLanguagePreference(v as LanguagePreference)} required disabled={isSaving}>
                    <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                    <SelectContent>{LANGUAGE_PREFERENCES.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label htmlFor="edit-college">College/Institution</Label><Input id="edit-college" value={collegeOrInstitution} onChange={e => setCollegeOrInstitution(e.target.value)} placeholder="e.g., JSS College" disabled={isSaving}/></div>
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
            <div className="space-y-5">
              <ProfileDetailItem icon={User} label="Full Name" value={displayName} />
              <ProfileDetailItem icon={Mail} label="Email ID" value={displayEmail} />
              {appUser?.gender && <ProfileDetailItem label="Gender" value={appUser.gender} />}
              {appUser?.dob && <ProfileDetailItem label="Date of Birth" value={new Date(appUser.dob).toLocaleDateString('en-IN')} />}
              {appUser?.phoneNumber && <ProfileDetailItem label="Phone Number" value={appUser.phoneNumber} />}
              
              <div className="space-y-3 pt-3 border-t">
                <h3 className="text-md font-semibold text-primary mt-2">Location & Preferences</h3>
                {appUser?.district && <ProfileDetailItem icon={MapPin} label="District" value={appUser.district} />}
                {(appUser?.customCity || appUser?.city) && <ProfileDetailItem label="City/Town" value={appUser.customCity || appUser.city} />}
                {appUser?.languagePreference && <ProfileDetailItem icon={LanguagesIcon} label="Language Preference" value={appUser.languagePreference} />}
              </div>

              {appUser?.collegeOrInstitution && 
                <div className="space-y-3 pt-3 border-t">
                    <h3 className="text-md font-semibold text-primary mt-2">Education</h3>
                    <ProfileDetailItem icon={School} label="College/Institution" value={appUser.collegeOrInstitution} />
                </div>
              }

              {appUser?.interests && appUser.interests.length > 0 &&
                <div className="space-y-3 pt-3 border-t">
                    <h3 className="text-md font-semibold text-primary mt-2">Interests</h3>
                    <ProfileDetailItem icon={ThumbsUp} label="Interests" value={appUser.interests.join(', ')} />
                </div>
              }
              
              <ProfileDetailItem label="Member Since" value={currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : 'N/A'} />
              
              <Button variant="destructive" onClick={handleSignOut} className="w-full mt-6" disabled={isSaving}>
                <LogOut className="mr-2 h-4 w-4" /> Log Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileDetailItem({ label, value, icon: Icon }: { label: string, value?: string | null, icon?: React.ElementType }) {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) return null;
  return (
    <div className="flex items-start border-b pb-3 pt-1">
      {Icon && <Icon className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" />}
      <div className={Icon ? "" : "ml-8"}> {/* Indent if no icon */}
        <span className="font-medium text-muted-foreground block text-xs">{label}</span>
        <span className="text-foreground text-sm">{value}</span>
      </div>
    </div>
  );
}
