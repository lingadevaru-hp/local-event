
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Read environment variables
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let googleAuthProvider: GoogleAuthProvider | null = null;

// Check for critical missing Firebase configuration values
const missingCriticalVars: string[] = [];
if (!apiKey) {
  missingCriticalVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
}
if (!authDomain) {
  missingCriticalVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
}
if (!projectId) {
  missingCriticalVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
}

if (missingCriticalVars.length > 0) {
  const errorMsg = `Firebase configuration error: Missing critical environment variables: ${missingCriticalVars.join(", ")}. Please ensure these are set in your .env.local file or server environment. Firebase features will be disabled.`;
  
  console.error("*****************************************************************");
  console.error("FIREBASE CONFIGURATION ERROR:");
  console.error(errorMsg);
  console.error("*****************************************************************");
  // Critical configuration is missing. Firebase services will remain null.
  // Do not throw, allow the app to load in a degraded state.
} else {
  const firebaseConfig: FirebaseOptions = {
    apiKey: apiKey, // Safe: Checked above
    authDomain: authDomain, // Safe: Checked above
    projectId: projectId, // Safe: Checked above
    storageBucket: storageBucket,
    messagingSenderId: messagingSenderId,
    appId: appId,
  };

  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    firestore = getFirestore(app);
    googleAuthProvider = new GoogleAuthProvider();
  } catch (e) {
    console.error("*****************************************************************");
    console.error("Error initializing Firebase services even with config present:");
    console.error(e);
    console.error("Firebase features might be partially or fully disabled.");
    console.error("*****************************************************************");
    // Reset to null if initialization fails for any other reason
    app = null;
    auth = null;
    firestore = null;
    googleAuthProvider = null;
  }
}

// Client-side warnings for non-critical but potentially useful variables (only if app was initialized)
if (app && typeof window !== 'undefined') {
  if (!storageBucket) {
    console.warn(
      "Firebase Storage Bucket (NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) is missing. File uploads might not work."
    );
  }
  if (!messagingSenderId) {
    console.warn(
      "Firebase Messaging Sender ID (NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) is missing. Push notifications might not work."
    );
  }
  if (!appId) {
    console.warn(
      "Firebase App ID (NEXT_PUBLIC_FIREBASE_APP_ID) is missing. Analytics or other services might be affected."
    );
  }
}

export { app, auth, firestore, googleAuthProvider };
