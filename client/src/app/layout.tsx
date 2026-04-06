import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import '@/app/globals.css';
import Providers from '@/components/ui/provider';

export const metadata: Metadata = {
  title: 'TaskFlow',
  description: 'Manage your tasks efficiently with TaskFlow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        {children}
        <Providers />
      </body>
    </html>
  );
}
