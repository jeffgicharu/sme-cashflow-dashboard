import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'SME Cash Flow Dashboard',
    template: '%s | SME Cash Flow',
  },
  description:
    'Track your M-Pesa business finances with ease. Monitor income, expenses, categorize transactions, and predict cash flow gaps for your Kenyan SME.',
  keywords: [
    'M-Pesa',
    'cash flow',
    'SME',
    'Kenya',
    'business finance',
    'expense tracking',
    'income tracking',
    'financial dashboard',
    'small business',
    'money management',
  ],
  authors: [{ name: 'SME Cash Flow' }],
  creator: 'SME Cash Flow',
  publisher: 'SME Cash Flow',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    siteName: 'SME Cash Flow Dashboard',
    title: 'SME Cash Flow Dashboard',
    description:
      'Track your M-Pesa business finances with ease. Monitor income, expenses, and predict cash flow gaps.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SME Cash Flow Dashboard',
    description:
      'Track your M-Pesa business finances with ease. Monitor income, expenses, and predict cash flow gaps.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SME Cash Flow',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#10B981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
