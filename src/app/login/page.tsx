'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, KeyRound, LogInIcon, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const { toast } = useToast();
  const { 
    requestOtp, 
    verifyOtpAndLogin, 
    currentUser, 
    loading, 
    isLoggingInViaOtp, 
    otpEmail: emailForOtp, // Renamed to avoid conflict with local email state
    clearOtpState 
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.push('/profile'); // Or /dashboard, or wherever appropriate after login
    }
  }, [currentUser, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        toast({ title: "Email Required", description: "Please enter your email address.", variant: "destructive"});
        return;
    }
    const { success, message } = await requestOtp(email);
    if (!success) {
      toast({ title: 'OTP Request Failed', description: message, variant: 'destructive' });
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForOtp) { // Should not happen if UI is correct
        toast({ title: "Error", description: "Email not set for OTP verification.", variant: "destructive"});
        clearOtpState();
        return;
    }
    if (!otp || otp.length !== 6) {
        toast({ title: "Invalid OTP", description: "Please enter a valid 6-digit OTP.", variant: "destructive"});
        return;
    }
    const { success, message, user } = await verifyOtpAndLogin(emailForOtp, otp);
    if (success && user) {
      toast({ title: 'Login Successful', description: `Welcome back, ${user.name || user.email}!` });
      // router.push is handled by useEffect
    } else {
      toast({ title: 'Login Failed', description: message, variant: 'destructive' });
    }
  };

  const handleBackToEmail = () => {
    clearOtpState();
    setEmail(''); // Optionally clear email or keep it
    setOtp('');
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LogInIcon className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">
            {isLoggingInViaOtp ? "Enter OTP" : "Login to Local Pulse"}
          </CardTitle>
          <CardDescription>
            {isLoggingInViaOtp 
              ? `An OTP has been sent to ${emailForOtp}.` 
              : "Enter your email to receive an OTP."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isLoggingInViaOtp ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                 <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 tracking-widest text-center"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Verify OTP & Login"
                )}
              </Button>
              <Button variant="link" onClick={handleBackToEmail} className="w-full text-sm" disabled={loading}>
                Back to email input
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-3 pt-6">
           <Button variant="outline" className="w-full" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline" tabIndex={loading ? -1 : undefined}>
              Sign up
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
