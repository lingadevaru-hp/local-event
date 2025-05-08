
'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User as FirebaseUser } from 'firebase/auth';
// Import Firebase services which might be null if config is missing
import { auth as firebaseAuthModule, googleAuthProvider as firebaseGoogleAuthProvider } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Firebase auth service is available
    if (!firebaseAuthModule) {
      console.warn("Firebase Auth is not initialized due to missing configuration. Authentication will be disabled.");
      setCurrentUser(null); // Ensure currentUser is null
      setLoading(false);    // Critical: set loading to false as onAuthStateChanged won't run
      return; 
    }

    const unsubscribe = onAuthStateChanged(firebaseAuthModule, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []); // useEffect runs once on mount

  const signInWithGoogle = async () => {
    if (!firebaseAuthModule || !firebaseGoogleAuthProvider) {
      console.error("Firebase Auth or GoogleAuthProvider not initialized. Cannot sign in with Google.");
      // Optionally, show a toast to the user
      return;
    }
    try {
      setLoading(true);
      await signInWithPopup(firebaseAuthModule, firebaseGoogleAuthProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      // Optionally, show a toast notification for the error
    } finally {
      // onAuthStateChanged will set loading to false upon successful sign-in or if user state changes.
      // If signInWithPopup fails before onAuthStateChanged triggers, ensure loading is reset.
      // However, onAuthStateChanged should typically handle the final loading state.
      // For simplicity, let onAuthStateChanged manage loading after popup. If it errors out, it won't change.
      // Consider specific error handling that might require setLoading(false) here.
    }
  };

  const logout = async () => {
    if (!firebaseAuthModule) {
      console.error("Firebase Auth not initialized. Cannot log out.");
      return;
    }
    try {
      setLoading(true);
      await signOut(firebaseAuthModule);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      // onAuthStateChanged will set loading to false
    }
  };

  // Full page loader logic: only show if Firebase is configured and auth state is actually loading
  if (loading && firebaseAuthModule) { 
     if (typeof window !== 'undefined' && !['/login', '/register', '/'].includes(window.location.pathname)) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
     }
  }


  return (
    <AuthContext.Provider value={{ currentUser, loading, signInWithGoogle, logout }}>
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
