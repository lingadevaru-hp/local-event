
'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User as AppUser } from '@/types/event'; // Using our app's User type
import { auth, googleAuthProvider } from '@/lib/firebase'; // Import Firebase auth and provider
import { signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

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
  loginWithGoogle?: () => Promise<{ success: boolean; message: string; user?: AppUser }>; // Optional for now
  updateUserProfile: (updatedData: Partial<AppUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock a simple user store and OTP mechanism
const MOCK_USERS: Record<string, AppUser> = {
  "user@example.com": {
    id: "mockUserId123",
    email: "user@example.com",
    name: "Mock User",
    username: "mockuser",
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

  const mapFirebaseUserToAppUser = (firebaseUser: FirebaseUser, additionalData?: Partial<AppUser>): AppUser => {
    // Check if user exists in MOCK_USERS to retain any app-specific data not in FirebaseUser
    const existingMockUser = Object.values(MOCK_USERS).find(u => u.email === firebaseUser.email);
    
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous',
      username: firebaseUser.email?.split('@')[0] || `user${Date.now()}`,
      photoURL: firebaseUser.photoURL || undefined,
      languagePreference: existingMockUser?.languagePreference || 'English', // Default if not found
      createdAt: existingMockUser?.createdAt || firebaseUser.metadata.creationTime || new Date().toISOString(),
      // Merge additionalData and any other fields from existingMockUser if needed
      ...existingMockUser,
      ...additionalData,
    };
  };

  // Listen to Firebase auth state changes
  useEffect(() => {
    if (!auth) { // Firebase not initialized
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const appUser = mapFirebaseUserToAppUser(firebaseUser);
        setCurrentUser(appUser);
        localStorage.setItem('currentUser', JSON.stringify(appUser));
         // Ensure user exists in mock store or add them
        if (!MOCK_USERS[appUser.email.toLowerCase()]) {
            MOCK_USERS[appUser.email.toLowerCase()] = appUser;
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);


  // Load user from localStorage on initial mount if Firebase hasn't kicked in yet
  useEffect(() => {
    if(!currentUser && !loading) { // Only if not already set by onAuthStateChanged and initial loading is done
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser) as AppUser;
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
    }
  }, [currentUser, loading]);


  const requestOtp = useCallback(async (email: string): Promise<{ success: boolean; message: string }> => {
    setAuthActionLoading(true);
    return new Promise(resolve => {
      setTimeout(() => {
        if (!email || !email.includes('@')) {
            setAuthActionLoading(false);
            resolve({ success: false, message: "Invalid email format." });
            return;
        }
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        MOCK_OTP_STORE[email.toLowerCase()] = generatedOtp;
        console.log(`OTP for ${email}: ${generatedOtp}`);
        
        toast({
          title: "OTP Sent",
          description: `An OTP has been sent to ${email}. (Mock OTP: ${generatedOtp})`,
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
          delete MOCK_OTP_STORE[normalizedEmail];
          
          let userToLogin = Object.values(MOCK_USERS).find(u => u.email.toLowerCase() === normalizedEmail);
          if (!userToLogin) {
             userToLogin = {
                id: `user_otp_${Date.now()}`,
                email: normalizedEmail,
                name: normalizedEmail.split('@')[0],
                username: normalizedEmail.split('@')[0],
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
        const newUserId = `user_reg_${Date.now()}`;
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

  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; message: string; user?: AppUser }> => {
    if (!auth || !googleAuthProvider) {
      return { success: false, message: "Firebase not configured for Google Sign-In." };
    }
    setAuthActionLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const firebaseUser = result.user;
      const appUser = mapFirebaseUserToAppUser(firebaseUser);
      
      setCurrentUser(appUser);
      localStorage.setItem('currentUser', JSON.stringify(appUser));
      // Ensure user exists in mock store or add them (for app-specific data persistence if needed)
      if (!MOCK_USERS[appUser.email.toLowerCase()]) {
          MOCK_USERS[appUser.email.toLowerCase()] = appUser;
      } else { // If user exists, update with latest from Google
          MOCK_USERS[appUser.email.toLowerCase()] = {
            ...MOCK_USERS[appUser.email.toLowerCase()], // Keep existing app-specific data
            ...appUser // Override with Google data where applicable (name, photoURL)
          };
          setCurrentUser(MOCK_USERS[appUser.email.toLowerCase()]);
          localStorage.setItem('currentUser', JSON.stringify(MOCK_USERS[appUser.email.toLowerCase()]));
      }

      toast({ title: "Login Successful", description: `Welcome, ${appUser.name}!` });
      setAuthActionLoading(false);
      return { success: true, message: "Logged in with Google successfully.", user: appUser };
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({ title: "Google Sign-In Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
      setAuthActionLoading(false);
      return { success: false, message: error.message || "Failed to sign in with Google." };
    }
  }, [toast]);


  const logout = useCallback(async () => {
    setAuthActionLoading(true);
    if (auth) {
      await signOut(auth); // Sign out from Firebase
    }
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

  const updateUserProfile = useCallback((updatedData: Partial<AppUser>) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedData };
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      // Update mock store as well
      if (MOCK_USERS[newUser.email.toLowerCase()]) {
        MOCK_USERS[newUser.email.toLowerCase()] = newUser;
      }
      return newUser;
    });
  }, []);


  if (loading) { 
     if (typeof window !== 'undefined' && !['/login', '/register', '/'].includes(window.location.pathname) && !window.location.pathname.startsWith('/events/')) {
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
        loading: loading || authActionLoading,
        requestOtp, 
        verifyOtpAndLogin,
        registerUser, 
        logout,
        isLoggingInViaOtp,
        otpEmail,
        clearOtpState,
        loginWithGoogle,
        updateUserProfile,
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
