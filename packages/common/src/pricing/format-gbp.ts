/**
 * Format an integer pence amount as a GBP-style string. Whole pounds are
 * rendered without decimals (£120), fractional amounts use two decimals (£119.50).
 */
export function formatGbp(pence: number): string {
  const pounds = pence / 100;
  if (pence % 100 === 0) {
    return `£${pounds.toLocaleString('en-GB')}`;
  }
  return `£${pounds.toFixed(2)}`;
}
