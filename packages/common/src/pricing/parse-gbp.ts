/**
 * Parse a user-typed GBP string (e.g. "£120", "99.50") into integer pence.
 * Strips any non-digit/non-dot characters, so formatted output from
 * `formatGbp` round-trips safely. Empty or unparseable input returns 0.
 */
export function parseGbpToPence(text: string): number {
  const cleaned = text.replace(/[^0-9.]/g, '');
  if (cleaned === '') return 0;
  const asNumber = parseFloat(cleaned);
  if (isNaN(asNumber)) return 0;
  return Math.round(asNumber * 100);
}
