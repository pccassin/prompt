import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });

export const metadata: Metadata = {
  title: 'Prompt - Professional Teleprompter',
  description:
    'A modern, web-based teleprompter application for professional presentations',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-b from-gray-900 to-black text-white`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
