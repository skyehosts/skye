export function formatDateString(
  year: number,
  month: number,
  day: number,
): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

/**
 * Parse a YYYY-MM-DD string into { year, month (0-based), day }.
 */
export function parseDateString(s: string): {
  year: number;
  month: number;
  day: number;
} {
  const [y, m, d] = s.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}
