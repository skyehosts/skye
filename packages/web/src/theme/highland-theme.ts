import { createTheme, type ThemeOptions } from "@mui/material/styles";
import {
  autumnBracken,
  autumnBrackenLight,
  deepSkyeBlue,
  driftwoodSand,
  grey900,
  grey950,
  heatherPurple,
  heatherPurpleLight,
  highlandMossGreen,
  iconDefault,
  iconOnDark,
  rowanBerry,
  rowanBerryLight,
  rowanBerryPale,
  seaGlassTeal,
  successGreen,
  successGreenLight,
  warmStone,
  whiskyGold,
  white,
} from "@repo/theme";
import { createAppTheme } from "./create-app-theme";

const highlandComponents: ThemeOptions["components"] = {
  MuiAlert: {
    styleOverrides: {
      standardInfo: {
        backgroundColor: heatherPurpleLight,
        color: grey900,
        "& .MuiAlert-icon": { color: heatherPurple },
      },
      standardWarning: {
        backgroundColor: autumnBrackenLight,
        color: grey900,
        "& .MuiAlert-icon": { color: autumnBracken },
      },
      standardError: {
        backgroundColor: rowanBerryPale,
        color: grey900,
        "& .MuiAlert-icon": { color: rowanBerryLight },
      },
      standardSuccess: {
        backgroundColor: successGreenLight,
        color: grey900,
        "& .MuiAlert-icon": { color: successGreen },
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        color: deepSkyeBlue,
        textDecorationColor: deepSkyeBlue,
      },
    },
  },
};

export function createHighlandTheme(fonts: { body: string; heading: string }) {
  const base = createAppTheme({
    fontBody: fonts.body,
    fontHeading: fonts.heading,
    palette: {
      primary: { main: deepSkyeBlue },
      secondary: { main: highlandMossGreen },
      success: { main: successGreen },
      error: { main: rowanBerry, light: rowanBerryLight },
      warning: { main: autumnBracken },
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
        grey950,
        iconDefault,
        iconOnDark,
      },
    },
  });

  return createTheme(base, { components: highlandComponents });
}
