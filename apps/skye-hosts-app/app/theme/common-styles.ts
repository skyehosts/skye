import { StyleSheet } from "react-native";
import { borderRadius } from "./border-radius";
import { colors } from "./colors";
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
    fontSize: typography.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  subheading: {
    fontSize: typography.md,
    color: colors.textSecondary,
    lineHeight: lineHeight.md,
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },

  sectionSubtext: {
    fontSize: typography.md,
    color: colors.textSecondary,
  },

  bodyText: {
    fontSize: typography.md,
    color: colors.textSecondary,
    lineHeight: lineHeight.md,
  },

  /* ── Feedback states ────────────────────────────── */

  errorText: {
    fontSize: typography.md,
    color: colors.danger,
    textAlign: "center",
  },

  emptyText: {
    fontSize: typography.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },

  emptySubtext: {
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
    borderColor: colors.textPrimary,
    borderWidth: 2,
  },

  cardTitle: {
    fontSize: typography.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },

  cardTitleSelected: {
    color: colors.textPrimary,
  },

  /* ── Chips ──────────────────────────────────────── */

  chip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },

  chipSelected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },

  chipTextSelected: {
    color: colors.background,
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
    fontSize: typography.lg,
    fontWeight: fontWeight.semibold,
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
    fontSize: typography.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  securitySubtitle: {
    fontSize: typography.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
});
