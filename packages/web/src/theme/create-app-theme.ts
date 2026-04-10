"use client";

import { createTheme, type PaletteOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    fontFamilyHeading: string;
  }
  interface TypographyVariantsOptions {
    fontFamilyHeading?: string;
  }
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
    custom: {
      heatherPurple: string;
      warmStone: string;
      driftwoodSand: string;
      seaGlassTeal: string;
      whiskyGold: string;
      successGreen: string;
      rowanBerry: string;
      rowanBerryLight: string;
      grey950: string;
      iconDefault: string;
      iconOnDark: string;
    };
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
    custom?: {
      heatherPurple?: string;
      warmStone?: string;
      driftwoodSand?: string;
      seaGlassTeal?: string;
      whiskyGold?: string;
      successGreen?: string;
      rowanBerry?: string;
      rowanBerryLight?: string;
      grey950?: string;
      iconDefault?: string;
      iconOnDark?: string;
    };
  }
}

const defaultPalette: PaletteOptions = {
  brand: {
    primary: "#1976d2",
    accent: "#1eb9d6",
  },
  header: {
    background: "#ffffff",
    linkText: "#333333",
    linkTextHover: "#000000",
    linkUnderline: "#1eb9d6",
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
  const { up } = createTheme().breakpoints;

  return createTheme({
    palette: {
      ...defaultPalette,
      ...palette,
      brand: { ...defaultPalette.brand, ...palette?.brand },
      header: { ...defaultPalette.header, ...palette?.header },
      footer: { ...defaultPalette.footer, ...palette?.footer },
      custom: { ...defaultPalette.custom, ...palette?.custom },
    },
    shape: {
      borderRadius: 4,
    },
    typography: {
      fontFamily: fontBody,
      fontFamilyHeading: fontHeading,
      h1: {
        fontFamily: fontHeading,
        fontStyle: "normal",
        fontSize: "1.75rem", // 28px
        lineHeight: 1.5,
        [up("md")]: { fontSize: "2.25rem", lineHeight: 1.5 }, // 36px / 54px
        [up("lg")]: { fontSize: "2.75rem", lineHeight: 1.5 }, // 44px / 66px
        [up("xl")]: { fontSize: "3rem", lineHeight: 1.5 }, // 48px / 72px
      },
      h2: {
        fontFamily: fontHeading,
        fontStyle: "normal",
        fontSize: "1.25rem", // 20px
        lineHeight: 1.5,
        [up("md")]: { fontSize: "1.625rem", lineHeight: 1.5 }, // 26px / 39px
        [up("lg")]: { fontSize: "1.75rem", lineHeight: 1.5 }, // 28px / 42px
      },
      h3: {
        fontFamily: fontHeading,
        fontStyle: "normal",
        fontSize: "1.125rem", // 18px
        lineHeight: 1.5,
        [up("md")]: { fontSize: "1.375rem", lineHeight: 1.5 }, // 22px / 33px
        [up("lg")]: { fontSize: "1.5rem", lineHeight: 1.5 }, // 24px / 36px
        [up("xl")]: { fontSize: "1.625rem", lineHeight: 1.5 }, // 26px / 39px
      },
      h4: {
        fontFamily: fontHeading,
        fontStyle: "normal",
        fontSize: "1.0625rem", // 17px
        lineHeight: 1.5,
        [up("md")]: { fontSize: "1.25rem", lineHeight: 1.5 }, // 20px / 30px
        [up("lg")]: { fontSize: "1.3125rem", lineHeight: 1.524 }, // 21px / 32px
        [up("xl")]: { fontSize: "1.4375rem", lineHeight: 1.522 }, // 23px / 35px
      },
      h5: {
        fontFamily: fontHeading,
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: "1rem", // 16px
        lineHeight: 1.5,
        [up("md")]: { fontSize: "1.125rem", lineHeight: 1.5 }, // 18px / 27px
        [up("lg")]: { fontSize: "1.1875rem", lineHeight: 1.474 }, // 19px / 28px
      },
      h6: {
        fontFamily: fontHeading,
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: "0.9375rem", // 15px
        lineHeight: 1.533, // 23px / 15px
        [up("lg")]: { fontSize: "1rem", lineHeight: 1.5 }, // 16px / 24px
      },
      subtitle1: {
        fontSize: "1.1875rem", // 19px
        lineHeight: 1.526, // 29px / 19px
        fontWeight: 600,
      },
      subtitle2: {
        fontSize: "1.0625rem", // 17px
        lineHeight: 1.529, // 26px / 17px
        fontWeight: 600,
      },
      body1: {
        fontSize: "0.9375rem", // 15px
        lineHeight: 1.467, // 22px / 15px
        fontWeight: 400,
        [up("md")]: { fontSize: "1rem", lineHeight: 1.5 }, // 16px / 24px
      },
      body2: {
        fontSize: "1rem", // 16px
        lineHeight: 1.5, // 24px / 16px
        fontWeight: 400,
      },
    },
    components: {
      MuiTypography: {
        styleOverrides: {
          root: { fontStyle: "normal" },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none" as const, fontFamily: fontHeading },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            marginLeft: 0,
            marginRight: 0,
          },
        },
      },
    },
  });
}
