"use client";

import { ThemeProvider } from "@mui/material/styles";
import type { PaletteOptions } from "@mui/material/styles";
import type { ReactNode } from "react";
import { createAppTheme } from "./create-app-theme";

export function AppThemeProvider({
  fontBody,
  fontHeading,
  palette,
  children,
}: {
  fontBody: string;
  fontHeading: string;
  palette?: PaletteOptions;
  children: ReactNode;
}) {
  const theme = createAppTheme({ fontBody, fontHeading, palette });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
