
import type {NextConfig} from 'next';
// import path from 'path'; // Not strictly needed for this config

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true, // Register the service worker
  skipWaiting: true, // Activate new service worker immediately
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development
  sw: 'sw.js', // Name of your custom service worker file in /public
  // scope: '/', // Default scope is fine for most apps
  // fallbacks: { // Optional: next-pwa can manage fallbacks, but custom sw.js handles it
  //   document: '/offline.html', // Path to your offline fallback HTML page
  // },
  // dynamicStartUrl: false, // Ensure start_url from manifest is used. Default true. Set to false if you have issues with start_url.
  // publicExcludes: ['!noprecache/**'], // Exclude files from precaching if needed.
  // swSrc: 'src/service-worker.ts', // If you want to use a TS service worker that gets compiled by next-pwa with Workbox.
                                  // Since sw: 'sw.js' is used, it implies a custom, pre-built SW.
});


const nextConfig: NextConfig = {
  reactStrictMode: true, 
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
      { 
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      { 
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
  },
  webpack: (config, { isServer, dev }) => {
    // Any custom webpack config if needed
    return config;
  },
  // Environment variables prefixed with NEXT_PUBLIC_ are exposed to the browser.
  // Make sure .env.local includes these for Firebase.
  // These are NOT automatically available to a static public/sw.js file.
  // A build script or alternative method is needed to inject them into sw.js.
};


export default withPWA(nextConfig);
