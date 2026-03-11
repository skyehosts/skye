'use client';

import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export interface HeaderLink {
  label: string;
  href: string;
}

export interface HeaderProps {
  isAuthenticated: boolean;
  isLoading?: boolean;
  onLogout?: () => void;
  logoHref?: string;
  links?: HeaderLink[];
  authLinks?: {
    login: HeaderLink;
    signUp: HeaderLink;
  };
}

function LogoSvg() {
  return (
    <svg
      width="120"
      height="32"
      viewBox="0 0 120 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="6" fill="#1976d2" />
      <path
        d="M8 22L16 10L24 22"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 22L16 16L20 22"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="40"
        y="22"
        fontFamily="sans-serif"
        fontSize="18"
        fontWeight="700"
        fill="#1976d2"
      >
        skyehosts
      </text>
    </svg>
  );
}

const navLinkSx = (
  theme: import('@mui/material/styles').Theme,
  isActive: boolean,
) =>
  ({
    textDecoration: 'none',
    color: isActive
      ? theme.palette.header.linkTextHover
      : theme.palette.header.linkText,
    fontSize: '1rem',
    fontFamily: theme.typography.fontFamily,
    fontWeight: 500,
    px: 1.5,
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: isActive ? '100%' : 0,
      height: '3px',
      backgroundColor: theme.palette.header.linkUnderline,
      transition: 'width 0.2s ease',
    },
    '&:hover': {
      color: theme.palette.header.linkTextHover,
      textDecoration: 'none',
    },
  }) as const;

export function Header({
  isAuthenticated,
  isLoading = false,
  onLogout,
  logoHref = '/',
  links = [],
  authLinks = {
    login: { label: 'Log in', href: '/login' },
    signUp: { label: 'Sign up', href: '/sign-up' },
  },
}: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const allMobileLinks = [
    ...links,
    ...(!isAuthenticated && !isLoading
      ? [authLinks.login, authLinks.signUp]
      : []),
  ];

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ bgcolor: 'header.background' }}
    >
      <Toolbar disableGutters sx={{ px: 2, alignItems: 'stretch' }}>
        <Link
          href={logoHref}
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            flexShrink: 0,
            mr: 3,
          }}
        >
          <LogoSvg />
        </Link>

        {/* Desktop navigation links (left-aligned) */}
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="stretch"
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          {links.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                sx={(theme) => navLinkSx(theme, isActive)}
              >
                {link.label}
              </Link>
            );
          })}
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        {/* Desktop auth links (right-aligned) */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="stretch"
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          {isLoading ? (
            <CircularProgress size={24} />
          ) : isAuthenticated ? (
            <Typography
              component="button"
              onClick={onLogout}
              sx={(theme) => ({
                ...navLinkSx(theme, false),
                border: 'none',
                background: 'none',
                cursor: 'pointer',
              })}
            >
              Log out
            </Typography>
          ) : (
            <>
              <Link
                href={authLinks.login.href}
                sx={(theme) =>
                  navLinkSx(theme, pathname === authLinks.login.href)
                }
              >
                {authLinks.login.label}
              </Link>
              <Link
                href={authLinks.signUp.href}
                sx={(theme) =>
                  navLinkSx(theme, pathname === authLinks.signUp.href)
                }
              >
                {authLinks.signUp.label}
              </Link>
            </>
          )}
        </Stack>

        {/* Mobile hamburger */}
        <IconButton
          edge="end"
          aria-label="open menu"
          onClick={handleDrawerToggle}
          sx={{ display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Mobile drawer */}
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{ display: { md: 'none' } }}
          slotProps={{
            paper: { sx: { width: 280 } },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 1,
            }}
          >
            <IconButton onClick={handleDrawerToggle} aria-label="close menu">
              <CloseIcon />
            </IconButton>
          </Box>

          <List>
            {allMobileLinks.map((link) => (
              <ListItem key={link.href} disablePadding>
                <ListItemButton
                  component="a"
                  href={link.href}
                  onClick={handleDrawerToggle}
                >
                  <ListItemText primary={link.label} />
                </ListItemButton>
              </ListItem>
            ))}

            {isLoading ? (
              <ListItem sx={{ justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </ListItem>
            ) : (
              isAuthenticated && (
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      handleDrawerToggle();
                      onLogout?.();
                    }}
                  >
                    <ListItemText primary="Log out" />
                  </ListItemButton>
                </ListItem>
              )
            )}
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}
