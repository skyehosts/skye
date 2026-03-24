/* ── Highland-inspired colour palette ──────────────────────────── */

import {
  deepSkyeBlue,
  driftwoodSand,
  heatherPurple,
  highlandMossGreen,
  seaGlassTeal,
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
  danger: "#FF3B30",
  warning: "#FF9500",
  successBackground: "#EAF7EC",
  inputBackground: "#F6F6F6",
  messageSent: deepSkyeBlue,
  messageReceived: driftwoodSand,
  messageSentText: "#fff",
  messageSentTimestamp: "rgba(255,255,255,0.7)",
  placeholder: "#f0f0f0",
  shadow: "#000",
  calendarCellPast: "#F7F7F7",
  calendarCellCurrent: "#EBEBEB",
  calendarTextPast: "#6c6c6c",
  calendarBarPast: "#8c8c8c",
  calendarBar: "#222222",
} as const;
