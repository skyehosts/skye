const UK_E164_REGEX = /^\+44\d{10}$/;

/**
 * Normalise a UK phone input to E.164 format (+44XXXXXXXXXX).
 * Returns null if the result is not a valid UK mobile number.
 */
export function toE164(phone: string): string | null {
  const stripped = phone.replace(/[\s\-()]/g, "");
  const formatted = stripped.startsWith("+44")
    ? stripped
    : stripped.startsWith("0")
      ? `+44${stripped.slice(1)}`
      : `+44${stripped}`;
  return UK_E164_REGEX.test(formatted) ? formatted : null;
}

/** react-hook-form validate function for UK phone number fields. */
export function validateUkPhone(value: string): true | string {
  return toE164(value) !== null || "Please enter a valid UK mobile number";
}
