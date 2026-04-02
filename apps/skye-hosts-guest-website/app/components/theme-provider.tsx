'use client';

import type { PaletteOptions } from '@mui/material/styles';
import { AppThemeProvider as SharedAppThemeProvider } from '@repo/web/app-theme-provider';
import type { ReactNode } from 'react';
import {
  deepSkyeBlue,
  driftwoodSand,
  heatherPurple,
  highlandMossGreen,
  iconDefault,
  iconOnDark,
  rowanBerry,
  rowanBerryLight,
  seaGlassTeal,
  successGreen,
  warmStone,
  whiskyGold,
  white,
} from '../theme/palette';

const highlandPalette: PaletteOptions = {
  primary: { main: deepSkyeBlue },
  secondary: { main: highlandMossGreen },
  success: { main: successGreen },
  background: { default: white, paper: white },
  brand: { primary: deepSkyeBlue, accent: seaGlassTeal },
  header: { linkUnderline: highlandMossGreen },
  footer: { background: deepSkyeBlue },
  mainBackground: white,
  custom: {
    heatherPurple,
    warmStone,
    driftwoodSand,
    seaGlassTeal,
    whiskyGold,
    successGreen,
    rowanBerry,
    rowanBerryLight,
    iconDefault,
    iconOnDark,
  },
};

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <SharedAppThemeProvider
      fontBody='"Open Sans", sans-serif'
      fontHeading='"Montserrat", sans-serif'
      palette={highlandPalette}
    >
      {children}
    </SharedAppThemeProvider>
  );
}
