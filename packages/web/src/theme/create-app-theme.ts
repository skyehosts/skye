"use client";

import { createTheme, type PaletteOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    brand: {
      primary: string;
      accent: string;
    };
    header: {
      background: string;
      linkText: string;
      linkTextHover: string;
      linkUnderline: string;
    };
    footer: {
      background: string;
      text: string;
      linkText: string;
      linkTextHover: string;
      copyright: string;
    };
    mainBackground: string;
  }
  interface PaletteOptions {
    brand?: {
      primary?: string;
      accent?: string;
    };
    header?: {
      background?: string;
      linkText?: string;
      linkTextHover?: string;
      linkUnderline?: string;
    };
    footer?: {
      background?: string;
      text?: string;
      linkText?: string;
      linkTextHover?: string;
      copyright?: string;
    };
    mainBackground?: string;
  }
}

const defaultPalette: PaletteOptions = {
  brand: {
    primary: "#1976d2",
    accent: "#00bcd4",
  },
  header: {
    background: "#ffffff",
    linkText: "#333333",
    linkTextHover: "#000000",
    linkUnderline: "#00bcd4",
  },
  footer: {
    background: "#0f2105",
    text: "#ffffff",
    linkText: "#cccccc",
    linkTextHover: "#ffffff",
    copyright: "#999999",
  },
  mainBackground: "#f5f5f5",
};

export interface AppThemeOptions {
  fontBody: string;
  fontHeading: string;
  palette?: PaletteOptions;
}

export function createAppTheme({
  fontBody,
  fontHeading,
  palette,
}: AppThemeOptions) {
  return createTheme({
    palette: {
      ...defaultPalette,
      ...palette,
      brand: { ...defaultPalette.brand, ...palette?.brand },
      header: { ...defaultPalette.header, ...palette?.header },
      footer: { ...defaultPalette.footer, ...palette?.footer },
    },
    shape: {
      borderRadius: 4,
    },
    typography: {
      fontFamily: fontBody,
      h1: { fontFamily: fontHeading, fontStyle: "normal" },
      h2: { fontFamily: fontHeading, fontStyle: "normal" },
      h3: { fontFamily: fontHeading, fontStyle: "normal" },
      h4: { fontFamily: fontHeading, fontStyle: "normal" },
      h5: { fontFamily: fontHeading, fontStyle: "normal" },
      h6: { fontFamily: fontHeading, fontStyle: "normal" },
    },
    components: {
      MuiTypography: {
        styleOverrides: {
          root: { fontStyle: "normal" },
        },
      },
    },
  });
}
