
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, ArrowLeft } from 'lucide-react';
import { KARNATAKA_DISTRICTS, KARNATAKA_CITIES, LANGUAGE_PREFERENCES, USER_INTERESTS, type KarnatakaDistrict, type KarnatakaCity, type LanguagePreference, type UserInterest, type User as AppUser } from '@/types/event';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say' | ''>('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [district, setDistrict] = useState<KarnatakaDistrict | ''>('');
  const [city, setCity] = useState<KarnatakaCity | 'Other' | ''>(''); // Allow 'Other'
  const [customCity, setCustomCity] = useState('');
  const [languagePreference, setLanguagePreference] = useState<LanguagePreference | ''>('');
  const [collegeOrInstitution, setCollegeOrInstitution] = useState('');
  const [interests, setInterests] = useState<UserInterest[]>([]);

  const { toast } = useToast();
  const { registerUser, currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push('/profile'); 
    }
  }, [currentUser, router]);

  const handleInterestChange = (interest: UserInterest) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !district || !languagePreference) {
      toast({ title: 'Missing Information', description: 'Please fill all required fields (*).', variant: 'destructive' });
      return;
    }
    if (city === 'Other' && !customCity) {
      toast({ title: 'Missing Information', description: 'Please specify your city/town.', variant: 'destructive' });
      return;
    }


    const userData: Omit<AppUser, 'id' | 'createdAt' | 'photoURL'> = {
        name,
        email,
        username: email.split('@')[0] || `user${Date.now()}`, // Simple username generation
        gender: gender || undefined,
        dob: dob || undefined,
        phoneNumber: phoneNumber || undefined,
        district: district as KarnatakaDistrict, // Cast as it's required
        city: city === 'Other' ? undefined : (city as KarnatakaCity) || undefined,
        customCity: city === 'Other' ? customCity || undefined : undefined,
        languagePreference: languagePreference as LanguagePreference, // Cast as it's required
        collegeOrInstitution: collegeOrInstitution || undefined,
        interests: interests.length > 0 ? interests : undefined,
    };
    
    const { success, message } = await registerUser(userData);

    if (success) {
      toast({ title: 'Registration Successful', description: `${message} Please log in using OTP.` });
      router.push('/login'); 
    } else {
      toast({ title: 'Registration Failed', description: message, variant: 'destructive' });
    }
  };
  

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>Join Local Pulse Karnataka to discover and rate events!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={(value) => setGender(value as any)} disabled={loading}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} disabled={loading} />
              </div>
               <div className="space-y-1.5">
                <Label htmlFor="email">Email ID *</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input id="phoneNumber" type="tel" placeholder="+91 XXXXX XXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={loading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="district">District (Karnataka) *</Label>
                <Select value={district} onValueChange={(value) => { setDistrict(value as KarnatakaDistrict); setCity(''); setCustomCity(''); }} required disabled={loading}>
                  <SelectTrigger><SelectValue placeholder="Select your district" /></SelectTrigger>
                  <SelectContent>
                    {KARNATAKA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city">City/Town (Karnataka)</Label>
                <Select value={city} onValueChange={(value) => setCity(value as KarnatakaCity | 'Other')} disabled={loading || !district}>
                  <SelectTrigger><SelectValue placeholder="Select your city/town" /></SelectTrigger>
                  <SelectContent>
                    {KARNATAKA_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                     <SelectItem key="city-other" value="Other">Other (Please specify)</SelectItem>
                  </SelectContent>
                </Select>
                 {city === 'Other' && (
                  <Input type="text" placeholder="Enter your city/town" value={customCity} onChange={(e) => setCustomCity(e.target.value)} className="mt-2" disabled={loading} />
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="languagePreference">Language Preference *</Label>
                <Select value={languagePreference} onValueChange={(value) => setLanguagePreference(value as LanguagePreference)} required disabled={loading}>
                  <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_PREFERENCES.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="collegeOrInstitution">College/Institution Name (Optional)</Label>
              <Input id="collegeOrInstitution" type="text" placeholder="Your college or institution" value={collegeOrInstitution} onChange={(e) => setCollegeOrInstitution(e.target.value)} disabled={loading} />
            </div>
            
            <div className="space-y-1.5">
              <Label>Interests (Optional)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 border rounded-md max-h-40 overflow-y-auto">
                {USER_INTERESTS.map(interest => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={`interest-${interest.replace(/\s+/g, '-')}`}
                      checked={interests.includes(interest)}
                      onCheckedChange={() => handleInterestChange(interest)}
                      disabled={loading}
                    />
                    <Label htmlFor={`interest-${interest.replace(/\s+/g, '-')}`} className="text-sm font-normal">{interest}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
              {loading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <UserPlus className="mr-2 h-4 w-4" /> )}
              Register
            </Button>
          </form>
          
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-3 pt-6">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline" tabIndex={loading ? -1 : undefined}>
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

function Separator() { 
  return <div className="w-full border-t my-2"></div>;
}
