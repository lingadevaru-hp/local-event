
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, enablePersistence } from 'firebase/firestore';
import { getMessaging, type Messaging } from 'firebase/messaging';

console.log('Firebase module loading...');

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
// Add other critical Firebase vars if they become essential for app startup

if (missingCriticalVars.length > 0) {
  const errorMsg = `Firebase configuration error: Missing critical environment variables: ${missingCriticalVars.join(", ")}. Please ensure these are set in your .env.local file or server environment. Firebase will NOT be initialized. This will likely break features relying on Firebase (e.g., database, auth, messaging).`;
  console.error("*****************************************************************");
  console.error("CRITICAL FIREBASE CONFIGURATION ERROR:");
  console.error(errorMsg);
  console.error("To fix: ");
  console.error("1. Create or check your '.env.local' file in the project root.");
  console.error("2. Add the missing variables with their correct values from your Firebase project console.");
  console.error("3. Restart your Next.js development server (e.g., 'npm run dev').");
  console.error("See '.env.local.example' for a template of required variables.");
  console.error("*****************************************************************");
} else {
  try {
    if (!getApps().length) {
      console.log("Initializing new Firebase app...");
      app = initializeApp(firebaseConfig);
    } else {
      console.log("Getting existing Firebase app...");
      app = getApp();
    }
    console.log("Firebase app instance:", app ? "OK" : "Failed");

    if (app) {
      auth = getAuth(app);
      console.log("Firebase Auth initialized:", auth ? "OK" : "Failed");

      firestore = getFirestore(app);
      console.log("Firebase Firestore initialized:", firestore ? "OK" : "Failed");

      if (firestore && typeof window !== 'undefined') {
        enablePersistence(firestore)
          .then(() => console.log("Firebase Firestore persistence enabled."))
          .catch((err) => {
            if (err.code === 'failed-precondition') {
              console.warn('Firebase persistence failed: Firestore persistence can only be enabled in one tab at a time.');
            } else if (err.code === 'unimplemented') {
              console.warn('Firebase persistence failed: The current browser does not support all of the features required to enable persistence.');
            } else {
              console.error('Firebase persistence error:', err);
            }
          });
      }

      googleAuthProvider = new GoogleAuthProvider();
      console.log("Google Auth Provider initialized:", googleAuthProvider ? "OK" : "Failed");

      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) {
        try {
            messaging = getMessaging(app);
            console.log("Firebase Messaging initialized:", messaging ? "OK" : "Failed");
        } catch (e) {
            console.warn("Firebase Messaging could not be initialized. Push notifications might not work.", e);
        }
      } else if (!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) {
        console.log("Firebase Messaging Sender ID (NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) is not set. FCM will not be initialized.");
      }
    }
  } catch (e: any) {
    console.error("*****************************************************************");
    console.error("Error initializing Firebase services:");
    console.error("Message:", e.message);
    console.error("Stack:", e.stack);
    console.error("This is a critical error. Firebase features will be partially or fully disabled.");
    console.error("Common causes: Incorrect Firebase config values in .env.local, network issues, or Firebase project setup problems.");
    console.error("*****************************************************************");
    app = null;
    auth = null;
    firestore = null;
    googleAuthProvider = null;
    messaging = null;
  }
}

// Log status of non-critical optional variables if app was initialized
if (app && typeof window !== 'undefined') {
  if (!storageBucket) {
    console.warn("Firebase Storage Bucket (NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) is missing. File uploads will not work if this feature is used.");
  }
  if (!appId) {
    console.warn("Firebase App ID (NEXT_PUBLIC_FIREBASE_APP_ID) is missing. Analytics or other app-ID-dependent services might be affected.");
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
    console.log("Firebase Measurement ID (NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) is not set. Firebase Analytics might not be fully functional.");
  }
}

console.log("Firebase module loaded. Firestore available:", !!firestore);

export { app, auth, firestore, googleAuthProvider, messaging };
