import type { Metadata } from 'next';
import { Inter, Noto_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingContact from '@/components/layout/FloatingContact';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BideyaBoost - Ton guide tunisien pour bien choisir ton avenir',
  description:
    'Optimize the orientation process for Tunisian students, bringing them closer to themselves and to reality.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoSansArabic.variable} font-sans min-h-screen flex flex-col transition-colors duration-300`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <LanguageProvider>
            <div className="bg-gradient-to-br from-[#243989] via-[#3A52A8] to-[#4E6BC7] min-h-screen">
              <Navbar />
              <main className="min-h-screen flex-1">{children}</main>
              <Footer />
              <FloatingContact />
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--card-bg, #fff)',
                  color: 'var(--text-primary, #111)',
                  border: '1px solid var(--card-border, #e5e7eb)',
                },
              }}
            />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
