
    import './globals.css';
    import { Inter } from 'next/font/google';
    import React from 'react';
    import { Toaster } from 'react-hot-toast';
    import { ReduxProviderWrapper } from '../components/ReduxProviderWrapper'; // <-- Impor komponen wrapper

    const inter = Inter({ subsets: ['latin'] });

    export const metadata = {
      title: 'SIMS PPOB App',
      description: 'Aplikasi SIMS PPOB untuk registrasi dan login',
    };

    export default function RootLayout({
      children,
    }: {
      children: React.ReactNode;
    }) {
      return (
        <html lang="en">
          <body className={inter.className}>
            <ReduxProviderWrapper>
              <Toaster position="top-right" reverseOrder={false} />
              {children}
            </ReduxProviderWrapper>
          </body>
        </html>
      );
    }
    