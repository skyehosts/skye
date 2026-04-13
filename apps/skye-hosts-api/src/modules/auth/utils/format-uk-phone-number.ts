import { BadRequestException } from '@nestjs/common';

/**
 * Normalise any UK phone input to E.164 format (+44XXXXXXXXXX).
 * Accepts: 07..., +447..., 7... (with optional spaces/dashes/parens).
 * Throws BadRequestException if the result is not a valid UK number.
 */
export function formatUkPhoneNumber(phoneNumber: string): string {
  const stripped = phoneNumber.replace(/[\s\-()]/g, '');
  let formatted: string;
  if (stripped.startsWith('+44')) {
    formatted = stripped;
  } else if (stripped.startsWith('0')) {
    formatted = `+44${stripped.slice(1)}`;
  } else {
    formatted = `+44${stripped}`;
  }

  // UK numbers must be +44 followed by exactly 10 digits (e.g. +447700900000)
  if (!/^\+44\d{10}$/.test(formatted)) {
    throw new BadRequestException(
      'Please enter a valid UK mobile number (e.g. 07700 900000 or +44 7700 900000)',
    );
  }

  return formatted;
}
