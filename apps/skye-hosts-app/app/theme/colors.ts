/* ── Highland-inspired colour palette ──────────────────────────── */

import {
  autumnBracken,
  cairngormRed,
  deepSkyeBlue,
  driftwoodSand,
  heatherPurple,
  highlandMossGreen,
  rowanBerryLight,
  seaGlassTeal,
  seaGlassTealPale,
  successGreen,
  warmStone,
  whiskyGold,
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
  background: "#fff",
  textPrimary: "#333",
  textSecondary: "#666",
  border: "#ddd",
  danger: cairngormRed,
  warning: autumnBracken,
  successBackground: "#EAF7EC",
  inputBackground: "#F6F6F6",
  messageSent: deepSkyeBlue,
  messageReceived: driftwoodSand,
  messageSentText: "#fff",
  messageSentTimestamp: "rgba(255,255,255,0.7)",
  placeholder: "#f0f0f0",
  shadow: "#000",
  calendarCellPast: "#F7F7F7",
  calendarCellCurrent: "#fff",
  calendarTextPast: "#6c6c6c",
  calendarBarPast: seaGlassTealPale,
  calendarBar: seaGlassTeal,
  calendarCellBlocked: "#F5E0DE",
  calendarCellBlockedBorder: rowanBerryLight,
  calendarBarBookingCom: "#003580",
  calendarBarAirbnb: "#FF5A5F",
  calendarBarExternal: "#888888",
  warningBackground: "#FFF3E0",
} as const;
