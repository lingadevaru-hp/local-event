import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Local Pulse Karnataka - Discover Events in Your District',
  description: 'Find and review local events, Utsavas, college fests, and more across Karnataka. Filter by district, city, and language.',
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#3498db", // Calming Blue
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className={`antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
