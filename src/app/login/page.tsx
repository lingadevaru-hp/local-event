
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogInIcon } from 'lucide-react';
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const { toast } = useToast();
  const { signInWithGoogle, currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && currentUser) {
      router.push('/dashboard'); 
    }
  }, [currentUser, authLoading, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);
    // TODO: Implement Firebase email/password sign-in
    // For now, using mock logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (email === 'user@example.com' && password === 'password123') {
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      // router.push('/dashboard'); // Handled by useEffect
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    }
    setIsEmailLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: 'Signed In',
        description: 'Successfully signed in with Google.',
      });
      // router.push('/dashboard'); // Handled by useEffect
    } catch (error) {
      toast({
        title: 'Google Sign-In Failed',
        description: 'Could not sign in with Google. Please try again.',
        variant: 'destructive',
      });
      console.error(error);
    }
  };
  
  const pageOverallLoading = isEmailLoading || authLoading;

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LogInIcon className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>Enter your credentials or use Google to sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={pageOverallLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={pageOverallLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={pageOverallLoading}>
              {isEmailLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogInIcon className="mr-2 h-4 w-4" />
              )}
              Sign In with Email
            </Button>
          </form>
          <Separator />
          <Button variant="outline" className="w-full mt-4" onClick={handleGoogleSignIn} disabled={pageOverallLoading}>
            {authLoading && !isEmailLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <Link href="/forgot-password"> 
            <Button variant="link" className="text-sm" disabled={pageOverallLoading}>
              Forgot your password?
            </Button>
          </Link>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline" tabIndex={pageOverallLoading ? -1 : undefined}>
              Sign up
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
