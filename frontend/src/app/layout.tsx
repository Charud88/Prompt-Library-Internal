import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { WarningBanner } from "@/components/layout/WarningBanner";
import { BRAND_CONFIG } from "@/config/brand.config";
import { BrowseProvider } from "@/lib/BrowseContext";
import { BookmarkProvider } from "@/lib/BookmarkContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${BRAND_CONFIG.name} | ${BRAND_CONFIG.app_name}`,
  description: BRAND_CONFIG.slogan,
};

import { PageTransition } from "@/components/shared/PageTransition";
import { InfiniteGrid } from "@/components/ui/the-infinite-grid";
import { QueryProvider } from "@/components/providers/QueryProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: 'var(--background)', color: 'var(--foreground)' }}
      >
        <QueryProvider>
          <ThemeProvider>
            <BrowseProvider>
              <BookmarkProvider>
                <div className="relative isolate flex flex-col min-h-screen">
                  <InfiniteGrid className="fixed inset-0 -z-10 opacity-[0.4]" />

                  <header className="fixed top-0 left-0 w-full z-[60]" style={{ background: 'var(--surface)' }}>
                    <WarningBanner />
                    <Navbar />
                  </header>
                  <div className="flex flex-1 pt-20 relative">
                    <Sidebar />
                    <main className="flex-1 w-full p-4 md:p-6 lg:p-8 overflow-x-hidden">
                      <PageTransition>{children}</PageTransition>
                    </main>
                  </div>
                </div>
              </BookmarkProvider>
            </BrowseProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
