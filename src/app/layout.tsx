import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Providers } from '@/components/providers';

// Removed incorrect GeistSans function call:
// const geistSans = GeistSans({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });
// GeistSans is an object, and we will use GeistSans.variable directly.

export const metadata: Metadata = {
  title: 'Local Pulse - Discover & Rate Local Events',
  description: 'Find and review events happening near you.',
  // icons: { // Removing favicon.ico to resolve build error, as per guidelines.
  //   icon: "/favicon.ico", 
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className={`antialiased`}> {/* Use GeistSans.variable on <html> or <body> to define the CSS var */}
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
