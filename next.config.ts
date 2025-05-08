
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
      }
    ],
  },
  webpack: (config, { isServer, dev }) => {
    // Custom webpack config if needed
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
};

// If using next-pwa:
// const withPWA = require('next-pwa')({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development', 
// });
// export default withPWA(nextConfig);

export default nextConfig;
