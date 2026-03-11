import { format, isSameMonth } from "date-fns";

export function formatShortDateRange(
  checkIn: Date | string,
  checkOut: Date | string,
): string {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);

  if (isSameMonth(inDate, outDate)) {
    return `${format(inDate, "d")}-${format(outDate, "d MMMM")}`;
  }
  return `${format(inDate, "d MMM")} - ${format(outDate, "d MMM")}`;
}
