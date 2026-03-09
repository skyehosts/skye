'use client';

import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
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
} from '@mui/material';
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

const MAX_WIDTH = 1200;

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
      elevation={1}
      sx={{ backgroundColor: 'white' }}
    >
      <Toolbar
        sx={{
          maxWidth: MAX_WIDTH,
          width: '100%',
          mx: 'auto',
          px: { xs: 2, sm: 3 },
        }}
      >
        <Link
          href={logoHref}
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <LogoSvg />
        </Link>

        <Box sx={{ flexGrow: 1 }} />

        {/* Desktop navigation */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          {links.map((link) => (
            <Button key={link.href} href={link.href} color="inherit">
              {link.label}
            </Button>
          ))}

          {isLoading ? (
            <CircularProgress size={24} />
          ) : isAuthenticated ? (
            <Button variant="outlined" onClick={onLogout}>
              Log out
            </Button>
          ) : (
            <>
              <Button href={authLinks.login.href} color="inherit">
                {authLinks.login.label}
              </Button>
              <Button href={authLinks.signUp.href} variant="contained">
                {authLinks.signUp.label}
              </Button>
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
