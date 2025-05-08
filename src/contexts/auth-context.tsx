'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User as AppUser } from '@/types/event'; // Using our app's User type

interface AuthContextType {
  currentUser: AppUser | null;
  loading: boolean;
  requestOtp: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyOtpAndLogin: (email: string, otp: string) => Promise<{ success: boolean; message: string; user?: AppUser }>;
  registerUser: (userData: Omit<AppUser, 'id' | 'createdAt' | 'photoURL'> & {password?: string}) => Promise<{ success: boolean; message: string; userId?: string }>;
  logout: () => Promise<void>;
  isLoggingInViaOtp: boolean; // To manage OTP input UI state
  otpEmail: string | null; // To store email during OTP flow
  clearOtpState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock a simple user store and OTP mechanism
const MOCK_USERS: Record<string, AppUser> = {
  "user@example.com": {
    id: "mockUserId123",
    email: "user@example.com",
    name: "Mock User",
    languagePreference: "English",
    createdAt: new Date().toISOString(),
  }
};
let MOCK_OTP_STORE: Record<string, string> = {}; // email: otp

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true); // Initial auth state loading
  const [authActionLoading, setAuthActionLoading] = useState(false); // For specific actions like login/register
  const [isLoggingInViaOtp, setIsLoggingInViaOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const { toast } = useToast();

  // Simulate checking auth state on load (e.g., from localStorage)
  useEffect(() => {
    setLoading(true);
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AppUser;
        // Basic validation
        if (parsedUser && parsedUser.id && parsedUser.email) {
          setCurrentUser(parsedUser);
        } else {
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const requestOtp = useCallback(async (email: string): Promise<{ success: boolean; message: string }> => {
    setAuthActionLoading(true);
    return new Promise(resolve => {
      setTimeout(() => {
        // In a real app, you'd call your backend to send an OTP
        if (!email || !email.includes('@')) {
            setAuthActionLoading(false);
            resolve({ success: false, message: "Invalid email format." });
            return;
        }
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        MOCK_OTP_STORE[email.toLowerCase()] = generatedOtp;
        console.log(`OTP for ${email}: ${generatedOtp}`); // For testing
        
        toast({
          title: "OTP Sent",
          description: `An OTP has been sent to ${email}. (Check console for mock OTP: ${generatedOtp})`,
        });
        setIsLoggingInViaOtp(true);
        setOtpEmail(email.toLowerCase());
        setAuthActionLoading(false);
        resolve({ success: true, message: "OTP sent successfully." });
      }, 1000);
    });
  }, [toast]);

  const verifyOtpAndLogin = useCallback(async (email: string, otp: string): Promise<{ success: boolean; message: string; user?: AppUser }> => {
    setAuthActionLoading(true);
    return new Promise(resolve => {
      setTimeout(() => {
        const normalizedEmail = email.toLowerCase();
        if (MOCK_OTP_STORE[normalizedEmail] && MOCK_OTP_STORE[normalizedEmail] === otp) {
          delete MOCK_OTP_STORE[normalizedEmail]; // OTP used
          
          // Find or create user (simplified)
          let userToLogin = Object.values(MOCK_USERS).find(u => u.email.toLowerCase() === normalizedEmail);
          if (!userToLogin) {
            // If user doesn't exist from a prior registration, create a basic one
            // Or, ideally, registration should happen first.
            // For this flow, let's assume registration is separate or handled differently.
            // If an OTP is verified for an email not in MOCK_USERS, it means they should register first.
            // For now, we will allow login if OTP is correct, assuming the user might exist.
            // A more robust system would check if user exists.
            // Let's create a dummy user if not found, for simplicity of OTP login demonstration
             userToLogin = {
                id: `user_${Date.now()}`,
                email: normalizedEmail,
                name: normalizedEmail.split('@')[0],
                languagePreference: "English",
                createdAt: new Date().toISOString(),
             };
             MOCK_USERS[normalizedEmail] = userToLogin;
          }
          
          setCurrentUser(userToLogin);
          localStorage.setItem('currentUser', JSON.stringify(userToLogin));
          setIsLoggingInViaOtp(false);
          setOtpEmail(null);
          setAuthActionLoading(false);
          resolve({ success: true, message: "Login successful!", user: userToLogin });
        } else {
          setAuthActionLoading(false);
          resolve({ success: false, message: "Invalid OTP. Please try again." });
        }
      }, 1000);
    });
  }, []);

  const registerUser = useCallback(async (userData: Omit<AppUser, 'id' | 'createdAt' | 'photoURL'>): Promise<{ success: boolean; message: string; userId?: string }> => {
    setAuthActionLoading(true);
    return new Promise(resolve => {
      setTimeout(() => {
        const normalizedEmail = userData.email.toLowerCase();
        if (MOCK_USERS[normalizedEmail]) {
          setAuthActionLoading(false);
          resolve({ success: false, message: "User with this email already exists." });
          return;
        }
        const newUserId = `user_${Date.now()}`;
        const newUser: AppUser = {
          id: newUserId,
          ...userData,
          createdAt: new Date().toISOString(),
        };
        MOCK_USERS[normalizedEmail] = newUser;
        console.log("Registered new user:", newUser);
        setAuthActionLoading(false);
        resolve({ success: true, message: "Registration successful! Please log in.", userId: newUserId });
      }, 1500);
    });
  }, []);

  const logout = useCallback(async () => {
    setAuthActionLoading(true);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setIsLoggingInViaOtp(false);
    setOtpEmail(null);
    setAuthActionLoading(false);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  }, [toast]);

  const clearOtpState = useCallback(() => {
    setIsLoggingInViaOtp(false);
    setOtpEmail(null);
  }, []);

  if (loading) { // Initial app load check
     if (typeof window !== 'undefined' && !['/login', '/register', '/'].includes(window.location.pathname)) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
     }
  }


  return (
    <AuthContext.Provider value={{ 
        currentUser, 
        loading: loading || authActionLoading, // Combined loading state for UI
        requestOtp, 
        verifyOtpAndLogin,
        registerUser, 
        logout,
        isLoggingInViaOtp,
        otpEmail,
        clearOtpState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
