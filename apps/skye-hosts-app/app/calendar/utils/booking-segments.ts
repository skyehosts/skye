import type {
  CalendarSyncPlatform,
  ICalendarBlockDto,
  IListingBookingItemDto,
} from "@repo/skye-hosts-api-client";
import type { MonthData } from "../components/month-grid";
import { formatDateString, parseDateString } from "./format-date-string";

export interface BookingSegment {
  bookingId: number;
  weekIndex: number;
  startDayIndex: number;
  endDayIndex: number;
  isCheckIn: boolean;
  isCheckOut: boolean;
  guestFirstName: string;
  numberOfGuests: number;
  status: string;
}

/**
 * Build a lookup from day number (1-31) to { weekIndex, dayIndex }
 * for a given month's grid.
 */
function buildDayPositionMap(
  monthData: MonthData,
): Map<number, { weekIndex: number; dayIndex: number }> {
  const map = new Map<number, { weekIndex: number; dayIndex: number }>();
  for (let wi = 0; wi < monthData.weeks.length; wi++) {
    const week = monthData.weeks[wi];
    for (let di = 0; di < week.length; di++) {
      const day = week[di];
      if (day !== null) {
        map.set(day, { weekIndex: wi, dayIndex: di });
      }
    }
  }
  return map;
}

/**
 * Given a list of bookings and a month's grid data, compute the
 * booking bar segments that should render in each week row.
 */
export function getBookingSegmentsForMonth(
  bookings: IListingBookingItemDto[],
  monthData: MonthData,
): BookingSegment[] {
  const daysInMonth = new Date(
    monthData.year,
    monthData.month + 1,
    0,
  ).getDate();
  const monthStart = formatDateString(monthData.year, monthData.month, 1);
  const monthEnd = formatDateString(
    monthData.year,
    monthData.month,
    daysInMonth,
  );
  const dayPositions = buildDayPositionMap(monthData);

  const segments: BookingSegment[] = [];

  for (const booking of bookings) {
    // Skip bookings that don't overlap this month
    if (booking.checkOutDate < monthStart || booking.checkInDate > monthEnd) {
      continue;
    }

    // Clamp booking range to this month
    const clampedStart =
      booking.checkInDate < monthStart ? monthStart : booking.checkInDate;
    const clampedEnd =
      booking.checkOutDate > monthEnd ? monthEnd : booking.checkOutDate;

    const startParsed = parseDateString(clampedStart);
    const endParsed = parseDateString(clampedEnd);

    const checkInParsed = parseDateString(booking.checkInDate);
    const checkOutParsed = parseDateString(booking.checkOutDate);
    const startDay = startParsed.day;
    const endDay = endParsed.day;

    const isCheckInInMonth =
      monthData.month === checkInParsed.month &&
      monthData.year === checkInParsed.year;
    const isCheckOutInMonth =
      monthData.month === checkOutParsed.month &&
      monthData.year === checkOutParsed.year;

    const commonFields = {
      bookingId: booking.id,
      guestFirstName: booking.guestFirstName,
      numberOfGuests: booking.numberOfGuests,
      status: booking.status,
    };

    // Group consecutive days by week row
    let currentWeekIndex = -1;
    let segStartDayIndex = 0;
    let segStartDay = 0;

    for (let day = startDay; day <= endDay; day++) {
      const pos = dayPositions.get(day);
      if (!pos) continue;

      if (pos.weekIndex !== currentWeekIndex) {
        // Flush previous segment
        if (currentWeekIndex !== -1) {
          const prevPos = dayPositions.get(day - 1);
          segments.push({
            ...commonFields,
            weekIndex: currentWeekIndex,
            startDayIndex: segStartDayIndex,
            endDayIndex: prevPos?.dayIndex ?? 6,
            isCheckIn: isCheckInInMonth && segStartDay === checkInParsed.day,
            isCheckOut: false,
          });
        }
        currentWeekIndex = pos.weekIndex;
        segStartDayIndex = pos.dayIndex;
        segStartDay = day;
      }
    }

    // Flush final segment
    if (currentWeekIndex !== -1) {
      const lastPos = dayPositions.get(endDay);
      segments.push({
        ...commonFields,
        weekIndex: currentWeekIndex,
        startDayIndex: segStartDayIndex,
        endDayIndex: lastPos?.dayIndex ?? 6,
        isCheckIn: isCheckInInMonth && segStartDay === checkInParsed.day,
        isCheckOut: isCheckOutInMonth && endDay === checkOutParsed.day,
      });
    }
  }

  return segments;
}

/**
 * Determines if an imported calendar block represents an actual guest booking
 * (vs a host-blocked "Not available" period).
 * Airbnb uses "Reserved" for bookings, Booking.com uses "Reserved" or similar.
 */
export function isExternalBooking(summary: string | null): boolean {
  if (!summary) return false;
  const lower = summary.toLowerCase();
  return lower === "reserved" || lower.startsWith("reserved");
}

export interface ExternalBlockSegment {
  blockId: number;
  weekIndex: number;
  startDayIndex: number;
  endDayIndex: number;
  isStart: boolean;
  isEnd: boolean;
  platform: CalendarSyncPlatform | null;
  summary: string | null;
  startDate: string;
  endDate: string;
}

/**
 * Subtract one day from a YYYY-MM-DD string.
 * Used because CalendarBlock.endDate is exclusive (iCal DTEND semantics).
 */
function previousDay(dateStr: string): string {
  const parsed = parseDateString(dateStr);
  const d = new Date(parsed.year, parsed.month, parsed.day - 1);
  return formatDateString(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Build external block bar segments for a given month.
 * Only includes imported blocks (source === 'import'), not manual blocks.
 */
export function getExternalBlockSegmentsForMonth(
  blocks: ICalendarBlockDto[],
  monthData: MonthData,
  platformBySyncId: Map<number, CalendarSyncPlatform>,
): ExternalBlockSegment[] {
  const daysInMonth = new Date(
    monthData.year,
    monthData.month + 1,
    0,
  ).getDate();
  const monthStart = formatDateString(monthData.year, monthData.month, 1);
  const monthEnd = formatDateString(
    monthData.year,
    monthData.month,
    daysInMonth,
  );
  const dayPositions = buildDayPositionMap(monthData);

  const segments: ExternalBlockSegment[] = [];

  for (const block of blocks) {
    if (block.source !== "import") continue;
    if (!isExternalBooking(block.summary)) continue;

    // endDate is exclusive (iCal DTEND), so the last occupied night is
    // endDate - 1.  But for the visual bar we use endDate itself as the
    // checkout date (the bar should penetrate partially into it, just like
    // regular booking bars use checkOutDate).
    const lastOccupiedDay = previousDay(block.endDate);
    const checkoutDay = block.endDate; // the day the guest leaves

    // Skip blocks that don't overlap this month
    if (lastOccupiedDay < monthStart || block.startDate > monthEnd) continue;

    // Clamp to this month — use checkoutDay for the end so the bar
    // visually reaches into the checkout date cell.
    const clampedStart =
      block.startDate < monthStart ? monthStart : block.startDate;
    const clampedEnd = checkoutDay > monthEnd ? monthEnd : checkoutDay;

    const startParsed = parseDateString(clampedStart);
    const endParsed = parseDateString(clampedEnd);

    const blockStartParsed = parseDateString(block.startDate);
    const blockEndParsed = parseDateString(checkoutDay);
    const startDay = startParsed.day;
    const endDay = endParsed.day;

    const isStartInMonth =
      monthData.month === blockStartParsed.month &&
      monthData.year === blockStartParsed.year;
    const isEndInMonth =
      monthData.month === blockEndParsed.month &&
      monthData.year === blockEndParsed.year;

    const platform =
      block.calendarSyncId !== null
        ? (platformBySyncId.get(block.calendarSyncId) ?? null)
        : null;

    const commonFields = {
      blockId: block.id,
      platform,
      summary: block.summary,
      startDate: block.startDate,
      endDate: block.endDate,
    };

    let currentWeekIndex = -1;
    let segStartDayIndex = 0;
    let segStartDay = 0;

    for (let day = startDay; day <= endDay; day++) {
      const pos = dayPositions.get(day);
      if (!pos) continue;

      if (pos.weekIndex !== currentWeekIndex) {
        if (currentWeekIndex !== -1) {
          const prevPos = dayPositions.get(day - 1);
          segments.push({
            ...commonFields,
            weekIndex: currentWeekIndex,
            startDayIndex: segStartDayIndex,
            endDayIndex: prevPos?.dayIndex ?? 6,
            isStart: isStartInMonth && segStartDay === blockStartParsed.day,
            isEnd: false,
          });
        }
        currentWeekIndex = pos.weekIndex;
        segStartDayIndex = pos.dayIndex;
        segStartDay = day;
      }
    }

    if (currentWeekIndex !== -1) {
      const lastPos = dayPositions.get(endDay);
      segments.push({
        ...commonFields,
        weekIndex: currentWeekIndex,
        startDayIndex: segStartDayIndex,
        endDayIndex: lastPos?.dayIndex ?? 6,
        isStart: isStartInMonth && segStartDay === blockStartParsed.day,
        isEnd: isEndInMonth && endDay === blockEndParsed.day,
      });
    }
  }

  return segments;
}
