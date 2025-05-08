'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShieldQuestion } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <ShieldQuestion className="mx-auto h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-2xl font-bold">Password Recovery</CardTitle>
          <CardDescription>
            Login is primarily handled via One-Time Passwords (OTP) sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            If you are having trouble logging in, please try requesting a new OTP on the login page.
            For other account issues, please contact support (details to be provided).
          </p>
          <Button asChild variant="outline" className="w-full mb-4">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Link>
          </Button>
          <Button asChild variant="default" className="w-full">
            <Link href="/">
               Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
