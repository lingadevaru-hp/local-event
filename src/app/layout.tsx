
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ThemeProvider } from '@/components/providers';
// import { AuthProvider } from '@/contexts/authContext'; // ClerkProvider will handle auth
import { BottomNavigationBar } from '@/components/bottom-navigation-bar';
import { ClerkProvider } from '@clerk/nextjs';
import { SpeedInsightsWrapper } from '@/components/speed-insights-wrapper';


export const metadata: Metadata = {
  title: 'Local Pulse Karnataka - Discover Events',
  description: 'Find and review local events, Utsavas, college fests, and more across Karnataka. ನಿಮ್ಮ ಜಿಲ್ಲೆಯಲ್ಲಿ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಹುಡುಕಿ ಮತ್ತು ವಿಮರ್ಶಿಸಿ.',
  manifest: "/manifest.json",
  applicationName: "Local Pulse KA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
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
    images: [{ url: '/icons/icon-512x512.png' }],
  },
  twitter: {
    card: "summary_large_image",
    title: { default: "Local Pulse Karnataka", template: "%s | Local Pulse KA" },
    description: "Discover local events in Karnataka.",
    images: ['/icons/icon-512x512.png'],
  },
  icons: [
    { rel: "apple-touch-icon", sizes: "180x180", url: "/icons/apple-touch-icon.png" },
    { rel: "icon", type: "image/png", sizes: "32x32", url: "/icons/favicon-32x32.png" },
    { rel: "icon", type: "image/png", sizes: "16x16", url: "/icons/favicon-16x16.png" },
    { rel: "mask-icon", url: "/icons/safari-pinned-tab.svg", color: "#007AFF" },
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(var(--background))' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(var(--background))' },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // viewportFit: "cover", // For edge-to-edge on iOS
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: 'hsl(var(--primary))',
          colorText: 'hsl(var(--foreground))',
          colorBackground: 'hsl(var(--background))',
          colorInputBackground: 'hsl(var(--input))',
          colorInputText: 'hsl(var(--foreground))',
          borderRadius: '0.75rem',
        },
        elements: {
          card: 'shadow-xl rounded-2xl border-border bg-card/80 backdrop-blur-md glassmorphism',
          formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg py-2.5 text-base transition-transform hover:scale-105 active:scale-95 shadow-md',
          socialButtonsBlockButton: 'rounded-lg border-border/50',
          footerActionLink: 'text-primary hover:text-primary/90',
          formFieldInput: 'rounded-lg focus:border-primary focus:ring-primary/50',
          headerTitle: 'text-2xl font-semibold text-foreground',
          headerSubtitle: 'text-muted-foreground',
        }
      }}
    >
      <html lang="en" className={GeistSans.className} suppressHydrationWarning>
        <head>
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Local Pulse KA" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-config" content="/icons/browserconfig.xml" />
          <meta name="msapplication-TileColor" content="#007AFF" />
          <meta name="msapplication-tap-highlight" content="no" />
        </head>
        <body className="antialiased flex flex-col min-h-screen bg-background text-foreground font-sans">
          {/* AuthProvider is removed as ClerkProvider handles authentication state */}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1 pb-20 sm:pb-0 pt-4 px-2 md:px-4 lg:px-6">
                {children}
              </main>
              <SiteFooter />
              <BottomNavigationBar />
            </div>
            <Toaster />
          </ThemeProvider>
          <SpeedInsightsWrapper />
        </body>
      </html>
    </ClerkProvider>
  );
}
