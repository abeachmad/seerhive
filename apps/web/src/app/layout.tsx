import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';
import { WalletDebug } from '@/components/WalletDebug';
import { TransactionHistory } from '@/components/TransactionHistory';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SeerHive - Social Prediction Markets',
  description: 'AI-assisted prediction markets on BNB Chain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          {children}
          <WalletDebug />
          <TransactionHistory />
        </Providers>
      </body>
    </html>
  );
}