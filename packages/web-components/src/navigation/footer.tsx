'use client';

import { Box, Link, Stack, Typography } from '@mui/material';
import { APP_DISPLAY_NAME_SHORT } from '@repo/common';

import { CONTENT_MAX_WIDTH, contentPaddingX } from '../layout/layout-constants';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterProps {
  links?: FooterLink[];
  copyrightText?: string;
}

export function Footer({
  links = [
    { label: 'About us', href: '/about-us' },
    { label: 'Terms of service', href: '/terms-and-conditions' },
    { label: 'Privacy policy', href: '/privacy-policy' },
    { label: 'Contact', href: '/contact' },
  ],
  copyrightText = `© ${APP_DISPLAY_NAME_SHORT} ${new Date().getFullYear()}`,
}: FooterProps) {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'footer.background',
        color: 'footer.text',
        mt: '50px',
        py: 4,
      }}
    >
      <Box
        sx={{
          maxWidth: CONTENT_MAX_WIDTH,
          mx: 'auto',
          px: contentPaddingX,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <Box>
          <Typography
            variant="subtitle1"
            sx={(theme) => ({
              fontFamily: theme.typography.fontFamilyHeading,
              fontWeight: 700,
              mb: 1.5,
            })}
          >
            Help
          </Typography>
          <Stack spacing={0.5}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                sx={(theme) => ({
                  color: theme.palette.footer.linkText,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontFamily: (theme.typography.h1 as { fontFamily?: string })
                    .fontFamily,
                  '&:hover': {
                    color: theme.palette.footer.linkTextHover,
                    textDecoration: 'underline',
                  },
                })}
              >
                {link.label}
              </Link>
            ))}
          </Stack>
        </Box>
        <Typography variant="body2" sx={{ color: 'footer.copyright' }}>
          {copyrightText}
        </Typography>
      </Box>
    </Box>
  );
}
