import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { APP_DISPLAY_NAME } from '@repo/common';
import { MuiProvider } from '@repo/web-components/providers/mui-provider';
import { StorageProvider } from '@repo/web-components/storage/storage-provider';
import { CookieDisclaimerWrapper } from '@repo/web/cookie-disclaimer-wrapper';
import { AuthSessionProvider } from '@repo/web/session-provider';
import type { Metadata } from 'next';
import { Lora, Open_Sans } from 'next/font/google';
import { auth } from './auth';
import { FooterWrapper } from './components/footer-wrapper';
import { HeaderWrapper } from './components/header-wrapper';
import { AppThemeProvider } from './components/theme-provider';
import './globals.css';

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
});

export const metadata: Metadata = {
  title: APP_DISPLAY_NAME,
  description: 'Same BnBs - Lower fees = Cheaper prices',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className={`${openSans.variable} ${lora.variable}`}>
      <body>
        <MuiProvider>
          <AppThemeProvider>
            <StorageProvider>
              <AuthSessionProvider session={session}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    bgcolor: 'mainBackground',
                  }}
                >
                  <HeaderWrapper />
                  <Box
                    component="main"
                    sx={{ bgcolor: 'mainBackground', flexGrow: 1 }}
                  >
                    <Container maxWidth={false} disableGutters>
                      {children}
                    </Container>
                  </Box>
                  <FooterWrapper />
                </Box>
                <CookieDisclaimerWrapper />
              </AuthSessionProvider>
            </StorageProvider>
          </AppThemeProvider>
        </MuiProvider>
      </body>
    </html>
  );
}
