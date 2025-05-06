import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
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
    ],
  },
  // PWA configuration - basic setup
  // For full PWA capabilities with offline support, a service worker is needed.
  // next-pwa package can simplify this: https://www.npmjs.com/package/next-pwa
  // This is a minimal setup to enable manifest.json and basic PWA hints.
  // For actual offline support and more advanced features, consider `next-pwa`.
  
  // Note: Next.js 15 has built-in experimental PWA support. 
  // If using Next.js < 15, `next-pwa` is the common solution.
  // Assuming a future or experimental setup, or `next-pwa` would handle this.
  // For now, just ensuring the manifest path is known.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Example of how you might configure a service worker if not using a plugin
      // This is illustrative and would need a `sw.js` file in `public`
      // config.entry = async () => {
      //   const originalEntry = await (config.entry as () => Promise<any>)();
      //   if (originalEntry['main.js'] && !originalEntry['main.js'].includes('./src/sw.js')) {
      //     originalEntry['main.js'].push('./src/sw.js'); // This path needs adjustment
      //   }
      //   return originalEntry;
      // };
    }
    return config;
  },
  // Ensure public directory is served for manifest.json and icons
  // This is usually default behavior, but explicitly noting.
};


// If using next-pwa, the config would look more like this:
// const withPWA = require('next-pwa')({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development' 
// });
// export default withPWA(nextConfig);

export default nextConfig;
