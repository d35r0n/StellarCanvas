import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { WalletProvider } from '@/providers/wallet-provider';
import { EventProvider } from '@/providers/event-provider';
import { ContractProvider } from '@/providers/contract-provider';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'StellarCanvas',
  description: 'Collaborative on-chain pixel canvas on Stellar Soroban',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <WalletProvider>
          <ContractProvider>
            <EventProvider>
              <div className="motion-safe:animate-in motion-safe:fade-in contents motion-safe:duration-300">
                {children}
              </div>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  className:
                    'border border-white/10 bg-white/[0.03] backdrop-blur-xl text-sm',
                }}
              />
            </EventProvider>
          </ContractProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
