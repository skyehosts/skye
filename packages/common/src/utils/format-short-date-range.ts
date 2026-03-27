import { format, isSameMonth } from 'date-fns';

function ordinal(day: number): string {
  const v = day % 100;
  const suffix =
    v >= 11 && v <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][day % 10] ?? 'th');
  return `${day}${suffix}`;
}

export function formatShortDateRange(
  checkIn: Date | string,
  checkOut: Date | string,
): string {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);

  if (isSameMonth(inDate, outDate)) {
    return `${ordinal(inDate.getDate())} - ${ordinal(outDate.getDate())} ${format(outDate, 'MMMM')}`;
  }
  return `${ordinal(inDate.getDate())} ${format(inDate, 'MMM')} - ${ordinal(outDate.getDate())} ${format(outDate, 'MMM')}`;
}
