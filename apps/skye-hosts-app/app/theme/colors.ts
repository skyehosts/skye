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
  deepSkyeBlueLight,
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
  heatherPurpleLight,
  highlandMossGreen,
  iconOnDark,
  rowanBerry,
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
} from "@repo/theme";

/** Core brand */
export const colors = {
  /** CTAs, contained buttons, selected-state icons in selection cards */
  primary: deepSkyeBlue,
  /** Light background for selected states (e.g. selected listing journey cards) */
  primaryLight: deepSkyeBlueLight,
  /** Secondary brand accent */
  secondary: highlandMossGreen,

  /** Info-variant icons (ⓘ info boxes, help-circle icons) */
  heatherPurple,
  /** Icon colour on dark backgrounds */
  warmStone,
  /** Accent: Driftwood Sand */
  driftwoodSand,
  /** Default decorative/nav icon colour — chevrons, menu icons, empty states, unselected cards */
  seaGlassTeal,

  /** Functional: Success Green */
  success: successGreen,
  /** Functional: Deal Highlight / Whisky Gold */
  dealHighlight: whiskyGold,

  /** Interactive/clickable icons on light backgrounds (= deepSkyeBlue) */
  icon: deepSkyeBlue,
  /** Purely decorative, non-clickable icons (= seaGlassTeal) */
  iconDecorative: seaGlassTeal,
  /** Icons on dark backgrounds (= warmStone) */
  iconOnDark: iconOnDark,
  /** Modal close/dismiss buttons only — intentionally muted */
  iconMuted: grey600,
  /** Inactive bottom tab bar icons */
  iconInactive: grey600,

  /* ── Existing UI tokens ────────────────────────────────────── */
  background: white,
  textPrimary: grey900,
  textSecondary: grey600,
  border: grey300,
  danger: rowanBerry,
  /** Background fill for danger surfaces (e.g. error snackbar). Foreground text/icons/borders/dots should use `danger`. */
  dangerBackground: rowanBerryLight,
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
  calendarBar: deepSkyeBlue,
  calendarCellBlocked: calendarBlockedPink,
  calendarCellBlockedBorder: rowanBerry,
  calendarBarBookingCom: brandBookingCom,
  calendarBarAirbnb: brandAirbnb,
  calendarBarExternal: grey500,
  calendarCellRestricted: autumnBrackenLight,
  calendarCellRestrictedBorder: autumnBracken,
  calendarCellSelected: calendarSelectedBlue,
  calendarCellSelectedBorder: calendarSelectedBlueBorder,
  warningBackground: autumnBrackenLight,
  infoBackground: heatherPurpleLight,
  errorBackground: rowanBerryPale,
} as const;
