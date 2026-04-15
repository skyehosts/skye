import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    fontFamilyHeading: string;
  }
  interface TypographyVariantsOptions {
    fontFamilyHeading?: string;
  }
  interface Palette {
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
