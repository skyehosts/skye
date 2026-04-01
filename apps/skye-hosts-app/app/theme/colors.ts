/* ── Highland-inspired colour palette ──────────────────────────── */

import {
  autumnBracken,
  autumnBrackenLight,
  black,
  brandAirbnb,
  brandBookingCom,
  calendarBlockedPink,
  calendarSelectedBlue,
  calendarSelectedBlueBorder,
  deepSkyeBlue,
  driftwoodSand,
  grey100,
  grey200,
  grey300,
  grey400,
  grey50,
  grey500,
  grey600,
  grey900,
  heatherPurple,
  highlandMossGreen,
  rowanBerryLight,
  rowanBerryPale,
  seaGlassTeal,
  seaGlassTealLight,
  seaGlassTealPale,
  successGreen,
  successGreenLight,
  warmStone,
  whiskyGold,
  white,
} from "@repo/common";

/** Core brand */
export const colors = {
  /** Deep Skye Blue — primary brand colour */
  primary: deepSkyeBlue,
  /** Highland Moss Green — secondary brand colour */
  secondary: highlandMossGreen,

  /** Accent: Heather Purple */
  heatherPurple,
  /** Accent: Warm Stone */
  warmStone,
  /** Accent: Driftwood Sand */
  driftwoodSand,
  /** Accent: Sea Glass Teal */
  seaGlassTeal,

  /** Functional: Success Green */
  success: successGreen,
  /** Functional: Deal Highlight / Whisky Gold */
  dealHighlight: whiskyGold,

  /* ── Existing UI tokens ────────────────────────────────────── */
  background: white,
  textPrimary: grey900,
  textSecondary: grey600,
  border: grey300,
  danger: rowanBerryLight,
  warning: autumnBracken,
  successBackground: successGreenLight,
  inputBackground: grey100,
  messageSent: deepSkyeBlue,
  messageReceived: driftwoodSand,
  messageSentText: white,
  messageSentTimestamp: "rgba(255,255,255,0.7)",
  placeholder: grey200,
  shadow: black,
  calendarCellPast: grey50,
  calendarCellCurrent: white,
  calendarTextPast: grey400,
  calendarBarPast: seaGlassTealPale,
  calendarBar: seaGlassTeal,
  calendarCellBlocked: calendarBlockedPink,
  calendarCellBlockedBorder: rowanBerryLight,
  calendarBarBookingCom: brandBookingCom,
  calendarBarAirbnb: brandAirbnb,
  calendarBarExternal: grey500,
  calendarCellRestricted: autumnBrackenLight,
  calendarCellRestrictedBorder: autumnBracken,
  calendarCellSelected: calendarSelectedBlue,
  calendarCellSelectedBorder: calendarSelectedBlueBorder,
  warningBackground: autumnBrackenLight,
  infoBackground: seaGlassTealLight,
  errorBackground: rowanBerryPale,
} as const;
