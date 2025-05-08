
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/authContext'; // Using custom AuthContext, but ClerkProvider will handle primary auth
import { BottomNavigationBar } from '@/components/bottom-navigation-bar';
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
  openGraph: {
    type: "website",
    siteName: "Local Pulse Karnataka",
    title: { default: "Local Pulse Karnataka", template: "%s | Local Pulse KA" },
    description: "Discover local events in Karnataka.",
  },
  twitter: {
    card: "summary",
    title: { default: "Local Pulse Karnataka", template: "%s | Local Pulse KA" },
    description: "Discover local events in Karnataka.",
  },
  icons: [
    { rel: "apple-touch-icon", url: "/icons/icon-192x192.png" },
    { rel: "icon", url: "/icons/icon-192x192.png" },
  ],
};

export const viewport: Viewport = {
  themeColor: [ 
    { media: '(prefers-color-scheme: light)', color: 'hsl(240 5% 96%)' }, // Updated to new light theme background
    { media: '(prefers-color-scheme: dark)', color: 'hsl(240 6% 10%)' }, // Updated to new dark theme background
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
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
          <meta name="msapplication-TileColor" content="#007AFF" /> {/* Apple Blue */}
          <meta name="msapplication-tap-highlight" content="no" />
          
          <link rel="manifest" href="/manifest.json" />
          
          {/* Theme color for browser UI */}
          <meta name="theme-color" content="#F5F5F7" media="(prefers-color-scheme: light)" />
          <meta name="theme-color" content="#1D1D1F" media="(prefers-color-scheme: dark)" />

          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />

          <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" />
        </head>
        <body className="antialiased flex flex-col min-h-screen bg-background text-foreground">
          {/* AuthProvider might be redundant if Clerk handles all user state, review if needed later */}
          <AuthProvider> 
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1 pb-20 sm:pb-0 pt-4 px-2 md:px-4 lg:px-6"> {/* Added padding top and horizontal padding */}
                  {children}
                </main>
                <SiteFooter />
                <BottomNavigationBar />
              </div>
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
