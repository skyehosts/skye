/* ── Highland-inspired colour palette ──────────────────────────── */
/*
 * Colour usage guide (see CLAUDE.md "Icon & colour conventions" for full rules):
 *
 * BRAND / CTA
 *   deepSkyeBlue    — primary buttons, contained CTAs, selected-state icons
 *   highlandMossGreen — secondary brand accent
 *
 * ICONS
 *   deepSkyeBlue    — interactive/clickable icons (chevrons in pressable rows,
 *                     menu icons, add-photo, any icon inside Pressable/TouchableOpacity)
 *   seaGlassTeal    — purely decorative non-clickable icons (rare)
 *   warmStone       — icon colour on dark backgrounds
 *   grey600         — modal close/dismiss buttons only (muted affordance)
 *   grey500 / grey600 — inactive tab bar icons
 *
 * INFO / STATUS
 *   heatherPurple      — info-variant icons (ⓘ info boxes, help icons)
 *   heatherPurpleLight — info-variant background
 *   autumnBracken      — warning icons & backgrounds
 *   rowanBerryLight    — error/danger icons
 *   successGreen       — success icons
 *
 * RESERVED — do NOT use for general icons:
 *   rowanBerry    — favourites / save actions (web)
 */

/** Core brand — CTAs, contained buttons, selected-state icons */
export const deepSkyeBlue = "#1F3F4A";
/** Light variant of deepSkyeBlue — selected card backgrounds */
export const deepSkyeBlueLight = "#E0EDF0";
/** Secondary brand accent */
export const highlandMossGreen = "#5F7F4B";

/** Highlands accent colours */
/** Info-variant icon colour (info boxes, help icons) */
export const heatherPurple = "#8B6FAF";
/** Info-variant background */
export const heatherPurpleLight = "#F3EFF8";
/** Icon colour on dark backgrounds */
export const warmStone = "#C8BFAE";
export const driftwoodSand = "#E7E1D6";
/** Default decorative/navigation icon colour on light backgrounds */
export const seaGlassTeal = "#4F8C8D";
export const seaGlassTealPale = "#7DA9AA";
export const seaGlassTealLight = "#E8F4F4";

/** Functional UI colours */
export const successGreen = "#3F9C5A";
export const successGreenLight = "#EAF7EC";
export const whiskyGold = "#E9B949";
/** Favourites / save actions (web) */
export const rowanBerry = "#B5473A";
/** Error/danger icon colour */
export const rowanBerryLight = "#D4837A";
export const rowanBerryPale = "#FDECEA";
/** Warning icon colour */
export const autumnBracken = "#FF9500";
export const autumnBrackenLight = "#FFF3E0";
export const calendarBlockedPink = "#F5E0DE";
export const calendarSelectedBlue = "#DBEAFE";
export const calendarSelectedBlueBorder = "#93C5FD";

/** Neutral / UI colours */
export const white = "#FFFFFF";
export const black = "#000000";
/** Primary text / section headings */
export const grey950 = "#222222";
/** Secondary text */
export const grey900 = "#333333";
/** Secondary text, modal close/dismiss icons */
export const grey600 = "#666666";
/** Inactive tab bar icons */
export const grey500 = "#888888";
export const grey400 = "#6C6C6C";
export const grey300 = "#DDDDDD";
export const grey200 = "#F0F0F0";
export const grey100 = "#F6F6F6";
export const grey50 = "#F7F7F7";

/** Semantic icon colours (aliases for cross-app consistency) */
export const iconDefault = seaGlassTeal;
export const iconOnDark = warmStone;

/** Third-party brand colours */
export const brandBookingCom = "#003580";
export const brandAirbnb = "#FF5A5F";
