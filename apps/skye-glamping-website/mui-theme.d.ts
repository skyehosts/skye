import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    fontFamilyHeading: string;
  }
  interface TypographyVariantsOptions {
    fontFamilyHeading?: string;
  }
}
