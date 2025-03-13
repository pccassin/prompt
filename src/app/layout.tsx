import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Prompt',
  description: 'A modern web-based teleprompter for professional presentations',
  icons: {
    icon: '/favicon.ico',
  },
  metadataBase: new URL('https://pccassin.github.io/prompt'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <Header />
        {children}
      </body>
    </html>
  );
}
