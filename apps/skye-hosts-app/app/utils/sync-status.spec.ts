import type { ICalendarSyncDto } from "@repo/skye-hosts-api-client";
import { colors } from "../theme";
import {
  getAggregateSyncHealthColor,
  getSyncHealth,
  getSyncHealthColor,
  isAutoDisabled,
  isExportPendingWarning,
} from "./sync-status";

const NOW = new Date("2026-06-01T12:00:00.000Z").getTime();

beforeAll(() => {
  jest.useFakeTimers({ now: NOW });
});

afterAll(() => {
  jest.useRealTimers();
});

const hoursAgo = (h: number) => new Date(NOW - h * 3_600_000).toISOString();

/** Builder returning an ICalendarSyncDto with sensible defaults. */
const makeSync = (
  overrides: Partial<ICalendarSyncDto> = {},
): ICalendarSyncDto =>
  ({
    id: 1,
    listingId: 1,
    platform: "airbnb",
    label: null,
    importUrl: "https://example.com/cal.ics",
    exportUrl: "https://skye.test/export/tok.ics",
    consecutiveFailures: 0,
    lastImportAt: hoursAgo(1),
    lastImportStatus: "success",
    lastImportError: null,
    lastExportedAt: hoursAgo(1),
    createdAt: hoursAgo(48),
    updatedAt: hoursAgo(1),
    ...overrides,
  }) as ICalendarSyncDto;

describe("sync-status", () => {
  describe("isAutoDisabled", () => {
    it("is true at 10 failures, false below", () => {
      expect(isAutoDisabled(makeSync({ consecutiveFailures: 10 }))).toBe(true);
      expect(isAutoDisabled(makeSync({ consecutiveFailures: 9 }))).toBe(false);
    });
  });

  describe("isExportPendingWarning", () => {
    it("returns false when sync has exported at least once", () => {
      expect(
        isExportPendingWarning(
          makeSync({ lastExportedAt: hoursAgo(1), createdAt: hoursAgo(100) }),
        ),
      ).toBe(false);
    });

    it("returns false inside the 24h grace period", () => {
      expect(
        isExportPendingWarning(
          makeSync({ lastExportedAt: null, createdAt: hoursAgo(23) }),
        ),
      ).toBe(false);
    });

    it("returns true after the 24h grace period", () => {
      expect(
        isExportPendingWarning(
          makeSync({ lastExportedAt: null, createdAt: hoursAgo(25) }),
        ),
      ).toBe(true);
    });
  });

  describe("getSyncHealth — all Import × Export combinations", () => {
    // Build the smallest set of ICalendarSyncDto fragments that exercise each
    // import/export bucket exactly once, then assert the combined dot.

    const importHealthy = {
      lastImportAt: hoursAgo(1),
      lastImportStatus: "success" as const,
    };
    const importStale = {
      lastImportAt: hoursAgo(7),
      lastImportStatus: "success" as const,
    };
    const importNeverRun = { lastImportAt: null, lastImportStatus: null };
    const importError = {
      lastImportStatus: "error" as const,
      lastImportError: "HTTP 404",
    };
    const importAutoDisabled = {
      consecutiveFailures: 10,
      lastImportStatus: "error" as const,
    };

    const exportHealthy = {
      lastExportedAt: hoursAgo(1),
      createdAt: hoursAgo(48),
    };
    const exportPending = { lastExportedAt: null, createdAt: hoursAgo(3) };
    const exportOverdue = { lastExportedAt: null, createdAt: hoursAgo(48) };

    const cases: Array<
      [string, object, "healthy" | "stale" | "warning" | "error"]
    > = [
      // Import healthy row
      ["healthy + healthy", { ...importHealthy, ...exportHealthy }, "healthy"],
      // The reported bug — this should now be healthy, not unknown.
      ["healthy + pending", { ...importHealthy, ...exportPending }, "healthy"],
      ["healthy + overdue", { ...importHealthy, ...exportOverdue }, "warning"],

      // Import stale row
      ["stale + healthy", { ...importStale, ...exportHealthy }, "stale"],
      ["stale + pending", { ...importStale, ...exportPending }, "stale"],
      ["stale + overdue", { ...importStale, ...exportOverdue }, "warning"],

      // Import never-run row (now classified as healthy)
      [
        "never-run + healthy",
        { ...importNeverRun, ...exportHealthy },
        "healthy",
      ],
      [
        "never-run + pending",
        { ...importNeverRun, ...exportPending },
        "healthy",
      ],
      [
        "never-run + overdue",
        { ...importNeverRun, ...exportOverdue },
        "warning",
      ],

      // Import error row — error dominates
      ["error + healthy", { ...importError, ...exportHealthy }, "error"],
      ["error + pending", { ...importError, ...exportPending }, "error"],
      ["error + overdue", { ...importError, ...exportOverdue }, "error"],

      // Auto-disabled collapses to error
      [
        "auto-disabled + healthy",
        { ...importAutoDisabled, ...exportHealthy },
        "error",
      ],
      [
        "auto-disabled + overdue",
        { ...importAutoDisabled, ...exportOverdue },
        "error",
      ],
    ];

    it.each(cases)("%s → %s", (_label, overrides, expected) => {
      expect(getSyncHealth(makeSync(overrides))).toBe(expected);
    });
  });

  describe("getSyncHealthColor", () => {
    it("maps each health bucket to its palette color", () => {
      expect(getSyncHealthColor(makeSync())).toBe(colors.success); // healthy + healthy
      expect(
        getSyncHealthColor(
          makeSync({ lastImportAt: hoursAgo(7), lastExportedAt: hoursAgo(1) }),
        ),
      ).toBe(colors.warning); // stale
      expect(
        getSyncHealthColor(
          makeSync({
            lastExportedAt: null,
            createdAt: hoursAgo(48),
          }),
        ),
      ).toBe(colors.warning); // overdue export
      expect(
        getSyncHealthColor(
          makeSync({ lastImportStatus: "error", lastImportError: "boom" }),
        ),
      ).toBe(colors.danger);
    });

    it("regression: healthy import + pending export is green, not grey", () => {
      const sync = makeSync({
        lastImportAt: hoursAgo(1),
        lastImportStatus: "success",
        lastExportedAt: null,
        createdAt: hoursAgo(3),
      });
      expect(getSyncHealthColor(sync)).toBe(colors.success);
    });
  });

  describe("getAggregateSyncHealthColor", () => {
    it("returns grey when there are no syncs", () => {
      expect(getAggregateSyncHealthColor([])).toBe(colors.textSecondary);
    });

    it("returns the worst color across multiple syncs", () => {
      const healthy = makeSync({ id: 1 });
      const errored = makeSync({
        id: 2,
        lastImportStatus: "error",
        lastImportError: "boom",
      });
      expect(getAggregateSyncHealthColor([healthy, errored])).toBe(
        colors.danger,
      );
    });

    it("returns healthy when every sync is healthy", () => {
      const a = makeSync({ id: 1 });
      const b = makeSync({
        id: 2,
        lastExportedAt: null,
        createdAt: hoursAgo(3),
      });
      expect(getAggregateSyncHealthColor([a, b])).toBe(colors.success);
    });
  });
});
