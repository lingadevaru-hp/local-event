
import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Read environment variables
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock_firebase_api_key";
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock_firebase_auth_domain";
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock_firebase_project_id";
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let googleAuthProvider: GoogleAuthProvider | null = null;

// Check for critical missing Firebase configuration values - only log if they are placeholders and not actual values
const missingCriticalVars: string[] = [];
if (apiKey === "mock_firebase_api_key") {
  missingCriticalVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
}
if (authDomain === "mock_firebase_auth_domain") {
  missingCriticalVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
}
if (projectId === "mock_firebase_project_id") {
  missingCriticalVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
}

if (missingCriticalVars.length > 0 && (apiKey.startsWith("mock_") || authDomain.startsWith("mock_") || projectId.startsWith("mock_") )) {
  const errorMsg = `Firebase configuration notice: Using mock values for critical environment variables: ${missingCriticalVars.join(", ")}. Please ensure these are set in your .env.local file or server environment for full Firebase functionality. Firebase features might be limited.`;
  
  console.warn("*****************************************************************");
  console.warn("FIREBASE CONFIGURATION NOTICE:");
  console.warn(errorMsg);
  console.warn("*****************************************************************");
}

const firebaseConfig: FirebaseOptions = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
};

try {
  // Only initialize if not using mock values for essential fields or if already initialized
  if (!getApps().length && !(apiKey.startsWith("mock_") || authDomain.startsWith("mock_") || projectId.startsWith("mock_"))){
     app = initializeApp(firebaseConfig);
  } else if (getApps().length) {
     app = getApp();
  }


  if (app) {
    auth = getAuth(app);
    firestore = getFirestore(app);
    googleAuthProvider = new GoogleAuthProvider();
  } else {
    console.warn("Firebase app not initialized due to missing or mock critical config. Firebase services (Auth, Firestore) will be unavailable.");
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
