
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ThemeProvider } from '@/components/providers'; // Updated Providers to ThemeProvider
import { AuthProvider } from '@/contexts/authContext'; // New Firebase Auth Provider
import { BottomNavigationBar } from '@/components/bottom-navigation-bar'; // New Bottom Navigation
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Local Pulse Karnataka - Discover Events in Your District',
  description: 'Find and review local events, Utsavas, college fests, and more across Karnataka. Filter by district, city, and language.',
  manifest: "/manifest.json",
  applicationName: "Local Pulse KA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Local Pulse KA",
  },
  formatDetection: {
    telephone: false,
  },
  // Open Graph data
  openGraph: {
    type: "website",
    siteName: "Local Pulse Karnataka",
    title: { default: "Local Pulse Karnataka", template: "%s | Local Pulse KA" },
    description: "Discover local events in Karnataka.",
  },
  // Twitter data
  twitter: {
    card: "summary",
    title: { default: "Local Pulse Karnataka", template: "%s | Local Pulse KA" },
    description: "Discover local events in Karnataka.",
  },
  // Icons for PWA
  icons: [
    { rel: "apple-touch-icon", url: "/icons/icon-192x192.png" },
    { rel: "icon", url: "/icons/icon-192x192.png" },
  ],
};

export const viewport: Viewport = {
  themeColor: [ 
    { media: '(prefers-color-scheme: light)', color: 'hsl(0 0% 100%)' }, // White for light mode
    { media: '(prefers-color-scheme: dark)', color: 'hsl(222.2 84% 4.9%)' }, // Dark for dark mode
  ],
  // PWA specific viewport settings
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Consider if users should be able to zoom
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
        <head>
          {/* Standard PWA meta tags */}
          <meta name="application-name" content="Local Pulse KA" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Local Pulse KA" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-config" content="/icons/browserconfig.xml" />
          <meta name="msapplication-TileColor" content="#3498db" />
          <meta name="msapplication-tap-highlight" content="no" />
          
          {/* Link to manifest.json */}
          <link rel="manifest" href="/manifest.json" />
          
          {/* Theme color for browser UI */}
          <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
          <meta name="theme-color" content="#0A0A0A" media="(prefers-color-scheme: dark)" />


          {/* Apple touch icons */}
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" /> {/* Using 192 as closest for 180 */}
          <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" /> {/* Using 192 as closest for 167 */}

          {/* Other icons */}
          <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" /> {/* Example, adjust to actual icon sizes */}
          <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" /> {/* Example, adjust to actual icon sizes */}

        </head>
        <body className="antialiased flex flex-col min-h-screen">
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1 pb-16 sm:pb-0">{children}</main> {/* Padding bottom for bottom nav on mobile */}
                <SiteFooter />
                <BottomNavigationBar /> {/* Add bottom navigation */}
              </div>
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
