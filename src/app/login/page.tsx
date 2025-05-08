
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, Mail, KeyRound, ArrowLeft, Unlock } from 'lucide-react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/authContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/';
  const { currentUser } = useAuth();

  if (currentUser) {
    router.replace(redirectUrl); // Redirect if already logged in
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({ title: 'Error', description: 'Authentication service not available.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Login Successful!', description: "You're now logged in." });
      router.push(redirectUrl);
    } catch (error: any) {
      console.error("Login error:", error);
      const errorCode = error.code;
      let errorMessage = "Failed to log in. Please check your credentials.";
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }
      toast({ title: 'Login Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !googleAuthProvider) {
      toast({ title: 'Error', description: 'Google Sign-In not available.', variant: 'destructive' });
      return;
    }
    setIsGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
      toast({ title: 'Google Sign-In Successful!', description: "You're now logged in." });
      router.push(redirectUrl);
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      let errorMessage = "Google Sign-In failed. Please try again.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Google Sign-In cancelled.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "An account already exists with this email address. Please sign in using the original method.";
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
      <Card className="w-full max-w-md shadow-xl rounded-lg">
        <CardHeader className="text-center">
          <Unlock className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-2 text-3xl font-bold tracking-tight text-foreground">Welcome Back!</CardTitle>
          <CardDescription className="mt-1 text-muted-foreground">Log in to access your Local Pulse account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="pl-10" disabled={isLoading || isGoogleLoading}/>
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
               <div className="relative mt-1">
                <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="pl-10" disabled={isLoading || isGoogleLoading}/>
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 py-3 text-base" disabled={isLoading || isGoogleLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />} Log In
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
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href={`/register?redirect_url=${encodeURIComponent(redirectUrl)}`} className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
