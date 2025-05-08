
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getMessaging, type Messaging } from 'firebase/messaging'; // Import Firebase Messaging

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
let messaging: Messaging | null = null;

const firebaseConfig: FirebaseOptions = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
};

const missingCriticalVars: string[] = [];
if (!apiKey) missingCriticalVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
if (!authDomain) missingCriticalVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
if (!projectId) missingCriticalVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");

if (missingCriticalVars.length > 0) {
  const errorMsg = `Firebase configuration error: Missing critical environment variables: ${missingCriticalVars.join(", ")}. Please ensure these are set in your .env.local file or server environment. Firebase will not be initialized.`;
  console.error("*****************************************************************");
  console.error("FIREBASE CONFIGURATION ERROR:");
  console.error(errorMsg);
  console.error("*****************************************************************");
  // Potentially throw an error or handle this state appropriately if Firebase is critical
  // For now, services will remain null.
} else {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    if (app) {
      auth = getAuth(app);
      firestore = getFirestore(app);
      googleAuthProvider = new GoogleAuthProvider();
      if (typeof window !== 'undefined') { // Messaging is client-side only
        try {
            messaging = getMessaging(app);
        } catch (e) {
            console.warn("Firebase Messaging could not be initialized. Push notifications might not work.", e);
        }
      }
    }
  } catch (e) {
    console.error("*****************************************************************");
    console.error("Error initializing Firebase services:");
    console.error(e);
    console.error("Firebase features might be partially or fully disabled.");
    console.error("*****************************************************************");
    app = null;
    auth = null;
    firestore = null;
    googleAuthProvider = null;
    messaging = null;
  }
}

// Client-side warnings for non-critical but potentially useful variables
if (app && typeof window !== 'undefined') {
  if (!storageBucket) {
    console.warn("Firebase Storage Bucket (NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) is missing. File uploads might not work.");
  }
  if (!messagingSenderId) {
    console.warn("Firebase Messaging Sender ID (NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) is missing. Push notifications setup may be incomplete.");
  }
  if (!appId) {
    console.warn("Firebase App ID (NEXT_PUBLIC_FIREBASE_APP_ID) is missing. Analytics or other services might be affected.");
  }
}

export { app, auth, firestore, googleAuthProvider, messaging };
