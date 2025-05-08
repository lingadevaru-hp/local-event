
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Mail, KeyRound, User, MapPin, Languages, School, ThumbsUp, ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, firestore, googleAuthProvider } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { KARNATAKA_DISTRICTS, KARNATAKA_CITIES, LANGUAGE_PREFERENCES, USER_INTERESTS, type User as AppUserType, type KarnatakaDistrict, type LanguagePreference, type UserInterest, type KarnatakaCity } from '@/types/event';
import { useAuth } from '@/contexts/authContext';


export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState<KarnatakaDistrict | ''>('');
  const [city, setCity] = useState<KarnatakaCity | 'Other' | ''>('');
  const [customCity, setCustomCity] = useState('');
  const [languagePreference, setLanguagePreference] = useState<LanguagePreference | ''>('');
  const [collegeOrInstitution, setCollegeOrInstitution] = useState('');
  const [interests, setInterests] = useState<UserInterest[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/';
  const { currentUser, fetchAppUser } = useAuth();


  if (currentUser) {
    router.replace(redirectUrl); // Redirect if already logged in
     return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleInterestChange = (interest: UserInterest) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
      toast({ title: 'Error', description: 'Authentication or Database service not available.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
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

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore
      const userDocData: AppUserType = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: name,
        username: email.split('@')[0], // Basic username generation
        email: firebaseUser.email || email,
        district: district as KarnatakaDistrict,
        city: city === 'Other' ? (customCity || 'Other') : (city as KarnatakaCity), // Store customCity if 'Other'
        customCity: city === 'Other' ? customCity : undefined,
        languagePreference: languagePreference as LanguagePreference,
        collegeOrInstitution: collegeOrInstitution || undefined,
        interests: interests.length > 0 ? interests : undefined,
        createdAt: new Date().toISOString(),
        photoURL: firebaseUser.photoURL || undefined,
      };
      await setDoc(doc(firestore, 'users', firebaseUser.uid), userDocData);
      await fetchAppUser(firebaseUser.uid); // Refresh appUser in context

      toast({ title: 'Registration Successful!', description: "Welcome to Local Pulse!" });
      router.push(redirectUrl);
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "Failed to register. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please log in.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }
      toast({ title: 'Registration Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !googleAuthProvider || !firestore) {
      toast({ title: 'Error', description: 'Google Sign-In or Database not available.', variant: 'destructive' });
      return;
    }
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const firebaseUser = result.user;

      // Check if user already exists in Firestore, if not, create profile
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Create user document in Firestore for Google Sign-In user
         const userDocData: AppUserType = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || email.split('@')[0], // Use Google display name or derive from email
          username: firebaseUser.email?.split('@')[0] || `user_${firebaseUser.uid.substring(0,5)}`,
          email: firebaseUser.email!,
          // For Google Sign In, these fields might be empty initially.
          // User can update them in their profile page later.
          district: district as KarnatakaDistrict || undefined, 
          city: city === 'Other' ? (customCity || undefined) : (city as KarnatakaCity || undefined),
          customCity: city === 'Other' ? customCity : undefined,
          languagePreference: languagePreference as LanguagePreference || 'English', // Default
          collegeOrInstitution: collegeOrInstitution || undefined,
          interests: interests.length > 0 ? interests : undefined,
          createdAt: new Date().toISOString(),
          photoURL: firebaseUser.photoURL || undefined,
        };
        await setDoc(userDocRef, userDocData, { merge: true }); // merge in case some partial data exists
      }
      await fetchAppUser(firebaseUser.uid); // Refresh appUser in context

      toast({ title: 'Google Sign-In Successful!', description: "Welcome to Local Pulse!" });
      router.push(redirectUrl);
    } catch (error: any) {
       console.error("Google Sign-In error during registration:", error);
      let errorMessage = "Google Sign-In failed. Please try again.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Google Sign-In cancelled.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "An account already exists with this email. Please sign in using your original method or link accounts if supported.";
      }
      toast({ title: 'Google Sign-In Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsGoogleLoading(false);
    }
  };


  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 left-4">
        <Button variant="outline" asChild>
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </div>
      <Card className="w-full max-w-lg shadow-xl rounded-lg">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-2 text-3xl font-bold tracking-tight text-foreground">Create an Account</CardTitle>
          <CardDescription className="mt-1 text-muted-foreground">Join Local Pulse to discover and share events!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your Full Name" className="pl-10" disabled={isLoading || isGoogleLoading}/>
              </div>
            </div>
            <div>
              <Label htmlFor="email-register">Email address *</Label>
               <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input id="email-register" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="pl-10" disabled={isLoading || isGoogleLoading}/>
              </div>
            </div>
            <div>
              <Label htmlFor="password-register">Password *</Label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input id="password-register" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Create a Password" className="pl-10" disabled={isLoading || isGoogleLoading}/>
              </div>
            </div>
             <div>
              <Label htmlFor="confirm-password">Confirm Password *</Label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Confirm Your Password" className="pl-10" disabled={isLoading || isGoogleLoading}/>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="district">District (Karnataka) *</Label>
                  <Select value={district} onValueChange={v => { setDistrict(v as KarnatakaDistrict); setCity(''); setCustomCity(''); }} required disabled={isLoading || isGoogleLoading}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent>{KARNATAKA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city">City/Town</Label>
                  <Select value={city} onValueChange={v => setCity(v as KarnatakaCity | 'Other')} disabled={isLoading || isGoogleLoading || !district}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select city/town" /></SelectTrigger>
                    <SelectContent>
                        {KARNATAKA_CITIES.map(c => <SelectItem key={`city-${c}`} value={c}>{c}</SelectItem>)}
                        <SelectItem key="city-other" value="Other">Other (Please specify)</SelectItem>
                    </SelectContent>
                  </Select>
                  {city === 'Other' && <Input type="text" placeholder="Enter your city/town" value={customCity} onChange={e => setCustomCity(e.target.value)} className="mt-2" disabled={isLoading || isGoogleLoading}/>}
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language Preference *</Label>
                  <Select value={languagePreference} onValueChange={v => setLanguagePreference(v as LanguagePreference)} required disabled={isLoading || isGoogleLoading}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select language" /></SelectTrigger>
                    <SelectContent>{LANGUAGE_PREFERENCES.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                    <Label htmlFor="college">College/Institution</Label>
                    <div className="relative mt-1">
                        <School className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input id="college" value={collegeOrInstitution} onChange={e => setCollegeOrInstitution(e.target.value)} placeholder="e.g., JSS College" className="pl-10" disabled={isLoading || isGoogleLoading}/>
                    </div>
                </div>
              </div>
               <div>
                <Label>Interests</Label>
                 <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 border rounded-md max-h-40 overflow-y-auto">
                  {USER_INTERESTS.map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox id={`interest-${interest.replace(/\s+/g, '-')}`} checked={interests.includes(interest)} onCheckedChange={() => handleInterestChange(interest)} disabled={isLoading || isGoogleLoading}/>
                      <Label htmlFor={`interest-${interest.replace(/\s+/g, '-')}`} className="text-sm font-normal cursor-pointer">{interest}</Label>
                    </div>
                  ))}
                </div>
              </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 py-3 text-base" disabled={isLoading || isGoogleLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />} Create Account
            </Button>
          </form>

           <div className="my-6 flex items-center justify-center">
            <span className="w-full border-t"></span>
            <span className="mx-4 shrink-0 text-muted-foreground">OR</span>
            <span className="w-full border-t"></span>
          </div>
           <Button variant="outline" onClick={handleGoogleSignIn} className="w-full py-3 text-base" disabled={isLoading || isGoogleLoading}>
            {isGoogleLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 
            <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 398.8 0 256S110.3 0 244 0c77.3 0 143.3 30.4 191.2 79.5l-68.3 67.3C334.5 115.6 293.8 96 244 96c-66.6 0-120.8 53.3-120.8 119.2s54.2 119.2 120.8 119.2c70.9 0 106.3-33.3 109.7-54.9H244V209.3h159.3c3.4 14.4 5.2 29.7 5.2 45.5z"></path>
            </svg>
            } 
            Sign up with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link href={`/login?redirect_url=${encodeURIComponent(redirectUrl)}`} className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
