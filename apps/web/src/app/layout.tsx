import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { PageTransitionLoader } from '@/components/PageTransitionLoader';
import { FloatingAiChatTrigger } from '@/components/layout/FloatingAiChatTrigger';

export const metadata: Metadata = {
  title: 'AVIQORA Airways — Global Airline Booking Platform',
  description: 'International corporate airline platform for real-time flight search, interactive seat map selection, and digital PNR ticket management.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AVIQORA Airways',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a1128',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <AuthProvider>
                <Suspense fallback={null}>
                  <PageTransitionLoader />
                </Suspense>
                {children}
                <FloatingAiChatTrigger />
              </AuthProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

