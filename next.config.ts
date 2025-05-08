
import type {NextConfig} from 'next';
import path from 'path';

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true, // Register the service worker
  skipWaiting: true, // Activate new service worker immediately
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development
  sw: 'sw.js', // Name of your service worker file
  // scope: '/', // Scope of the service worker
  // fallbacks: { // Optional: fallback for offline pages
  //   document: '/offline.html', // Path to your offline fallback HTML page
  // },
  // dynamicStartUrl: false, // Ensure start_url from manifest is used
  // publicExcludes: ['!noprecache/**'], // Exclude files from precaching if needed
});


const nextConfig: NextConfig = {
  reactStrictMode: true, // Recommended for development
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore build errors for faster iteration
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint errors during builds
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      { // For Firebase Storage images (user avatars, event posters)
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      { // For Google User Avatars
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
  },
  webpack: (config, { isServer, dev }) => {
    // Ensure firebase-messaging-sw.js is handled correctly if using Firebase Cloud Messaging
    // This might not be strictly necessary if public/firebase-messaging-sw.js is directly served.
    // config.resolve.alias['firebase/compat/app'] = path.resolve(__dirname, 'node_modules/firebase/compat/app');
    // config.resolve.alias['firebase/compat/messaging'] = path.resolve(__dirname, 'node_modules/firebase/compat/messaging');
    return config;
  },
  // Environment variables prefixed with NEXT_PUBLIC_ are exposed to the browser.
  // Ensure your .env.local includes these for Firebase:
  // NEXT_PUBLIC_FIREBASE_API_KEY
  // NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  // NEXT_PUBLIC_FIREBASE_PROJECT_ID
  // NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (if using Firebase Storage for images)
  // NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  // NEXT_PUBLIC_FIREBASE_APP_ID
  // NEXT_PUBLIC_FIREBASE_VAPID_KEY (For FCM push notifications)
  
  // To make env variables available for service worker generation (if needed for firebase-messaging-sw.js placeholder replacement)
  // publicRuntimeConfig: {
  //   NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  //   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  //   NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  //   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  //   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  //   NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // }
};


export default withPWA(nextConfig);
