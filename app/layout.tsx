import React from 'react';
import type { Metadata } from 'next';
import { harmoniaSansPro } from './fonts';
import './globals.css';
import { ProgressProvider } from '@/app/context/ProgressContext';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { SessionProvider } from 'next-auth/react';
import { CallProvider } from '@/app/context/CallContext';
import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: {
    template: '%s - HelloDrew™',
    default: 'HelloDrew™ - Your AI Real Estate Assistant',
  },
  description:
    'Automate cold calling, schedule appointments, and follow up with leads 24/7 using AI. Boost your real estate business today.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={harmoniaSansPro.variable}>
      <body className="font-harmonia">
        <SessionProvider>
          <ProgressProvider>
            <CallProvider>
              <QueryProvider>
                <Providers>{children}</Providers>
                <Toaster />
              </QueryProvider>
            </CallProvider>
          </ProgressProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
