import { StyleSheet } from "react-native";
import { borderRadius } from "./border-radius";
import { colors } from "./colors";
import { fontFamily } from "./fonts";
import { fontWeight } from "./font-weight";
import { lineHeight } from "./line-height";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const commonStyles = StyleSheet.create({
  /* ── Layout ─────────────────────────────────────── */

  flex: {
    flex: 1,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },

  content: {
    flex: 1,
    padding: spacing.lg,
  },

  contentScroll: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  /* ── Typography ─────────────────────────────────── */

  heading: {
    fontFamily: fontFamily.heading,
    fontSize: typography.xl,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  subheading: {
    fontFamily: fontFamily.body,
    fontSize: typography.md,
    color: colors.textSecondary,
    lineHeight: lineHeight.md,
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: typography.lg,
    color: colors.textPrimary,
  },

  sectionSubtext: {
    fontFamily: fontFamily.body,
    fontSize: typography.md,
    color: colors.textSecondary,
  },

  bodyText: {
    fontFamily: fontFamily.body,
    fontSize: typography.md,
    color: colors.textSecondary,
    lineHeight: lineHeight.md,
  },

  /* ── Feedback states ────────────────────────────── */

  errorText: {
    fontFamily: fontFamily.body,
    fontSize: typography.md,
    color: colors.danger,
    textAlign: "center",
  },

  emptyText: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: typography.lg,
    color: colors.textPrimary,
  },

  emptySubtext: {
    fontFamily: fontFamily.body,
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: "center",
  },

  /* ── Cards ──────────────────────────────────────── */

  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.background,
  },

  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primaryLight,
  },

  cardTitle: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: typography.md,
    color: colors.textSecondary,
  },

  cardTitleSelected: {
    color: colors.textPrimary,
  },

  /* ── Edit-section list cards ─────────────────────── */

  itemTitle: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: typography.md,
    color: colors.textPrimary,
  },

  itemSubtext: {
    fontFamily: fontFamily.body,
    fontSize: typography.sm,
    color: colors.textSecondary,
  },

  cardSubtext: {
    fontFamily: fontFamily.body,
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  editSection: {
    gap: spacing.sm,
  },

  editSectionCards: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },

  sectionLoader: {
    marginTop: spacing.lg,
  },

  /* ── Chips ──────────────────────────────────────── */

  chip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },

  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  chipTextSelected: {
    color: colors.background,
  },

  /* ── Menu sections ─────────────────────────────── */

  menuSection: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  menuItemText: {
    flex: 1,
    gap: spacing.xs,
  },

  menuItemAction: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: typography.sm,
    color: colors.primary,
    textDecorationLine: "underline",
  },

  /* ── Dividers ───────────────────────────────────── */

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  /* ── Modal ──────────────────────────────────────── */

  modal: {
    backgroundColor: colors.background,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },

  modalTitle: {
    fontFamily: fontFamily.headingSemibold,
    fontSize: typography.lg,
    color: colors.textPrimary,
  },

  /* ── Footer (wizard / form) ─────────────────────── */

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  /* ── Switch row ─────────────────────────────────── */

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  switchLabel: {
    fontFamily: fontFamily.body,
    fontSize: typography.md,
    color: colors.textPrimary,
  },

  /* ── Bordered rows (counter / settings) ─────────── */

  borderedRows: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },

  borderedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  borderedRowContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },

  borderedRowText: {
    flex: 1,
    gap: spacing.xs,
  },

  borderedRowDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },

  /* ── Inputs ────────────────────────────────────── */

  multilineInput: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    textAlignVertical: "top",
  },

  /* ── Security screens ───────────────────────────── */

  securityContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },

  securityTitle: {
    fontFamily: fontFamily.heading,
    fontSize: typography.xl,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  securitySubtitle: {
    fontFamily: fontFamily.body,
    fontSize: typography.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },

  /* ── Location / postcode ────────────────────────── */

  postcodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  postcodeInput: {
    flex: 1,
    backgroundColor: colors.background,
  },

  locateButton: {
    marginTop: spacing.xs,
  },

  locationLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  locationLoadingText: {
    fontFamily: fontFamily.body,
    fontSize: typography.sm,
    color: colors.textSecondary,
  },

  locationErrorText: {
    fontFamily: fontFamily.body,
    color: colors.danger,
    fontSize: typography.sm,
    marginTop: spacing.sm,
  },

  mapSection: {
    marginTop: spacing.lg,
  },

  mapLabel: {
    fontFamily: fontFamily.body,
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  coordsText: {
    fontFamily: fontFamily.body,
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },

  /* ── Indicator dot ───────────────────────────────── */

  indicatorDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.background,
  },

  /* ── Coming soon badge ──────────────────────────── */

  comingSoonBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.infoBackground,
  },

  comingSoonBadgeText: {
    fontSize: typography.sm,
    color: colors.heatherPurple,
    fontWeight: fontWeight.medium,
  },

  /* ── Help links ──────────────────────────────────── */

  helpLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "center",
    paddingVertical: spacing.sm,
  },

  helpLinkText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});
