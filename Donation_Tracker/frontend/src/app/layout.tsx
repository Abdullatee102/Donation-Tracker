import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';

const Web3Provider = dynamic(
  () => import('@/components/ReownAppKitProvider').then((mod) => mod.Web3Provider),
  { ssr: false }
);

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-main',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BotDonationTracker | Bohr Smart Contract ETH & BOT Tracker',
  description:
    'BotDonationTracker: Track live BOT and ETH donations on smart contracts using live blockchain data.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}

