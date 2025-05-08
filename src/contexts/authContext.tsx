
'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase'; // Assuming firebase.ts exports auth
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { User as AppUser, KarnatakaDistrict, LanguagePreference, UserInterest } from '@/types/event'; // Your app-specific User type
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  appUser: AppUser | null; // App-specific user profile
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  fetchAppUser: (uid: string) => Promise<void>; // To refresh appUser data
  updateAppUser: (data: Partial<AppUser>) => Promise<void>; // To update appUser data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAppUser = async (uid: string) => {
    if (!firestore) {
      console.warn("Firestore not initialized, cannot fetch app user.");
      setAppUser(null); // Or handle as an error state
      return;
    }
    try {
      const userDocRef = doc(firestore, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setAppUser(userDocSnap.data() as AppUser);
      } else {
        // User document doesn't exist, maybe create a default one or set to null
        console.log(`No app user profile found for UID: ${uid}. A default might be created on profile page.`);
        setAppUser(null); 
      }
    } catch (err) {
      console.error("Error fetching app user data:", err);
      setError(err as Error);
      setAppUser(null);
    }
  };
  
 const updateAppUser = async (data: Partial<AppUser>) => {
    if (!currentUser || !firestore) {
      console.error("No current user or Firestore not initialized for updating app user.");
      throw new Error("User not authenticated or database unavailable.");
    }
    try {
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      await setDoc(userDocRef, data, { merge: true }); // Merge to update or create
      // After updating, refresh the appUser state
      await fetchAppUser(currentUser.uid);
      console.log("App user profile updated successfully.");
    } catch (err) {
      console.error("Error updating app user profile:", err);
      throw err; // Rethrow to be caught by the caller
    }
  };


  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth not initialized. Auth state cannot be monitored.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchAppUser(user.uid);
      } else {
        setAppUser(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Auth state change error:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    if (!auth) {
      console.warn("Firebase Auth not initialized. Cannot sign out.");
      return;
    }
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setAppUser(null);
    } catch (err) {
      console.error("Sign out error:", err);
      setError(err as Error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, appUser, loading, error, signOut, fetchAppUser, updateAppUser }}>
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
