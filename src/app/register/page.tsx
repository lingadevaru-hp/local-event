
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
import { Loader2, UserPlus } from 'lucide-react';
import { KARNATAKA_DISTRICTS, KARNATAKA_CITIES, LANGUAGE_PREFERENCES, USER_INTERESTS, type KarnatakaDistrict, type KarnatakaCity, type LanguagePreference, type UserInterest } from '@/types/event';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      <path d="M1 1h22v22H1z" fill="none"/>
    </svg>
  );

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say' | ''>('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [district, setDistrict] = useState<KarnatakaDistrict | ''>('');
  const [city, setCity] = useState<KarnatakaCity | ''>('');
  const [customCity, setCustomCity] = useState('');
  const [languagePreference, setLanguagePreference] = useState<LanguagePreference | ''>('');
  const [collegeOrInstitution, setCollegeOrInstitution] = useState('');
  const [interests, setInterests] = useState<UserInterest[]>([]);

  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const { toast } = useToast();
  const { signInWithGoogle, currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && currentUser) {
      router.push('/dashboard'); // Or a profile completion page
    }
  }, [currentUser, authLoading, router]);

  const handleInterestChange = (interest: UserInterest) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Password Mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (!district || !languagePreference) {
      toast({ title: 'Missing Information', description: 'Please select district and language preference.', variant: 'destructive' });
      return;
    }
    setIsEmailLoading(true);
    // TODO: Implement Firebase email/password registration & Firestore profile creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Registration data (Email/Password):", { name, email /* ... other fields */ });
    toast({ title: 'Registration Successful', description: `Welcome, ${name}! Please log in.` });
    router.push('/login'); 
    setIsEmailLoading(false);
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      // User will be available in `currentUser` from context
      // Firestore profile creation for new Google users should happen here or in AuthProvider
      toast({ title: 'Signed Up with Google', description: 'Welcome! Your account has been created.' });
      // router.push('/dashboard'); // Handled by useEffect
    } catch (error) {
      toast({ title: 'Google Sign-Up Failed', description: 'Could not sign up. Please try again.', variant: 'destructive' });
      console.error(error);
    }
  };

  const pageOverallLoading = isEmailLoading || authLoading;

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>Join Local Pulse Karnataka to discover and rate events!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {/* Form fields... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required disabled={pageOverallLoading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={(value) => setGender(value as any)} disabled={pageOverallLoading}>
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
                <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} disabled={pageOverallLoading} />
              </div>
               <div className="space-y-1.5">
                <Label htmlFor="email">Email ID *</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={pageOverallLoading} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input id="phoneNumber" type="tel" placeholder="+91 XXXXX XXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={pageOverallLoading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="district">District (Karnataka) *</Label>
                <Select value={district} onValueChange={(value) => setDistrict(value as KarnatakaDistrict)} required disabled={pageOverallLoading}>
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
                <Select value={city} onValueChange={(value) => setCity(value as KarnatakaCity)} disabled={pageOverallLoading || !district}>
                  <SelectTrigger><SelectValue placeholder="Select your city/town" /></SelectTrigger>
                  <SelectContent>
                    {KARNATAKA_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                 {city === 'Other' && (
                  <Input type="text" placeholder="Enter your city/town" value={customCity} onChange={(e) => setCustomCity(e.target.value)} className="mt-2" disabled={pageOverallLoading} />
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="languagePreference">Language Preference *</Label>
                <Select value={languagePreference} onValueChange={(value) => setLanguagePreference(value as LanguagePreference)} required disabled={pageOverallLoading}>
                  <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_PREFERENCES.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="collegeOrInstitution">College/Institution Name (Optional)</Label>
              <Input id="collegeOrInstitution" type="text" placeholder="Your college or institution" value={collegeOrInstitution} onChange={(e) => setCollegeOrInstitution(e.target.value)} disabled={pageOverallLoading} />
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
                      disabled={pageOverallLoading}
                    />
                    <Label htmlFor={`interest-${interest.replace(/\s+/g, '-')}`} className="text-sm font-normal">{interest}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} disabled={pageOverallLoading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} disabled={pageOverallLoading} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={pageOverallLoading}>
              {isEmailLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <UserPlus className="mr-2 h-4 w-4" /> )}
              Sign Up with Email
            </Button>
          </form>
          
          <Separator />
          <Button variant="outline" className="w-full mt-4" onClick={handleGoogleSignUp} disabled={pageOverallLoading}>
            {authLoading && !isEmailLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Sign up with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <Separator />
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline" tabIndex={pageOverallLoading ? -1 : undefined}>
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

function Separator() { 
  return <div className="w-full border-t my-4"></div>;
}
