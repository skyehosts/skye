import { MuiProvider } from '@repo/web-components/providers/mui-provider';
import { AuthSessionProvider } from '@repo/web/session-provider';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'Skye Glamping',
  description: 'Luxury glamping on the Isle of Skye',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <MuiProvider>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </MuiProvider>
      </body>
    </html>
  );
}
