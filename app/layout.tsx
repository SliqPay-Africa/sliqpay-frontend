import './globals.css';
import type { Metadata } from 'next';
import { UserProvider } from '@/contexts/UserContext';
import { MagicProvider } from '@/components/providers/MagicProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Web3Provider } from '@/components/Web3Provider';
import { Toaster } from '@/components/ui/toaster';


export const metadata: Metadata = {
  title: 'SliqPay - Seamless Bill Payments',
  description: 'Modern fintech solution for airtime, data, electricity, and cable TV payments',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Web3Provider>
          <QueryProvider>
            <MagicProvider>
              <UserProvider>
                {children}
                <Toaster />
              </UserProvider>
            </MagicProvider>
          </QueryProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
