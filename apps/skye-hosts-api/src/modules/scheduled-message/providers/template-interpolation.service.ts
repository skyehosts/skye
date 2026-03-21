import { Injectable } from '@nestjs/common';
import { VALID_TOKEN_KEYS } from '@repo/skye-hosts-api-client';
import { Account } from '../../account/entities';
import { Booking } from '../../booking/entities';
import { Listing } from '../../listing/entities';

interface InterpolationContext {
  booking: Booking;
  guest: Account;
  listing: Listing;
  host: Account;
}

@Injectable()
export class TemplateInterpolationService {
  /**
   * Resilient regex that matches `{{key}}`, `{{ key }}`, `{{  key  }}`, etc.
   * Also tolerates a single opening/closing brace typo like `{ key }}` is NOT
   * matched — we only match double braces so we don't false-positive.
   */
  private static readonly TOKEN_REGEX = /\{\{\s*(\w+)\s*\}\}/g;

  interpolate(template: string, context: InterpolationContext): string {
    return template.replace(
      TemplateInterpolationService.TOKEN_REGEX,
      (_match, rawKey: string) => {
        const key = rawKey.toLowerCase();
        const value = this.resolveToken(key, context);
        return value ?? '';
      },
    );
  }

  /**
   * Validates that all `{{ ... }}` tokens in a template string are known keys.
   * Returns an array of unrecognised keys (empty if all valid).
   */
  validateTokens(template: string): string[] {
    const invalid: string[] = [];
    let match: RegExpExecArray | null;
    const regex = new RegExp(TemplateInterpolationService.TOKEN_REGEX);

    while ((match = regex.exec(template)) !== null) {
      const key = match[1].trim().toLowerCase();
      if (!VALID_TOKEN_KEYS.has(key)) {
        invalid.push(key);
      }
    }

    return invalid;
  }

  private resolveToken(key: string, ctx: InterpolationContext): string | null {
    const { booking, guest, listing, host } = ctx;

    switch (key) {
      // Guest information
      case 'guest_first_name':
        return this.firstName(guest.name);
      case 'guest_last_name':
        return this.lastName(guest.name);

      // Trip information
      case 'check_in_date':
        return booking.checkInDate ?? null;
      case 'checkout_date':
        return booking.checkOutDate ?? null;
      case 'check_in_time':
        return listing.checkInTimeStart ?? null;
      case 'checkout_time':
        return listing.checkOutTime ?? null;
      case 'number_of_nights':
        return this.computeNights(booking);
      case 'total_trip_price':
        return booking.totalPrice != null ? String(booking.totalPrice) : null;

      // Listing information
      case 'listing_name':
        return listing.title ?? null;
      case 'wifi_name':
        return listing.wifiNetwork ?? null;
      case 'wifi_password':
        return listing.wifiPassword ?? null;
      case 'number_of_bedrooms':
        return listing.bedrooms != null ? String(listing.bedrooms) : null;
      case 'number_of_beds':
        return listing.beds != null ? String(listing.beds) : null;
      case 'number_of_bathrooms':
        return listing.bathrooms != null ? String(listing.bathrooms) : null;
      case 'directions':
        return listing.directions ?? null;
      case 'guest_access':
        return listing.guestAccess || null;
      case 'house_manual':
        return listing.houseManual ?? null;
      case 'checkout_instructions':
        return this.composeCheckoutInstructions(listing);
      case 'house_rules':
        return this.composeHouseRules(listing);

      // Host information
      case 'primary_host_first_name':
        return this.firstName(host.name);
      case 'primary_host_last_name':
        return this.lastName(host.name);

      // TODO: tokens that need new entity fields
      case 'guest_city':
      case 'guest_country':
      case 'number_of_guests':
      case 'confirmation_code':
      case 'average_nightly_price':
      case 'cleaning_fee':
      case 'listing_city':
      case 'listing_address':
      case 'check_in_method':
      case 'getting_around':
      case 'neighbourhood':
      case 'guest_interaction':
      case 'guidebook':
      case 'suggested_door_code':
        return null;

      default:
        return null;
    }
  }

  private firstName(fullName: string | null): string | null {
    if (!fullName) return null;
    const spaceIdx = fullName.indexOf(' ');
    return spaceIdx === -1 ? fullName : fullName.slice(0, spaceIdx);
  }

  private lastName(fullName: string | null): string | null {
    if (!fullName) return null;
    const spaceIdx = fullName.indexOf(' ');
    return spaceIdx === -1 ? '' : fullName.slice(spaceIdx + 1);
  }

  private computeNights(booking: Booking): string | null {
    if (!booking.checkInDate || !booking.checkOutDate) return null;
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return String(nights);
  }

  private static readonly CHECKOUT_FIELDS: [keyof Listing, string | null][] = [
    ['checkoutInstructionTowels', 'Towels'],
    ['checkoutInstructionRubbish', 'Rubbish'],
    ['checkoutInstructionTurnThingsOff', 'Turn things off'],
    ['checkoutInstructionLockUp', 'Lock up'],
    ['checkoutInstructionReturnKeys', 'Return keys'],
    ['checkoutInstructionAdditions', null],
  ];

  private composeCheckoutInstructions(listing: Listing): string | null {
    const parts = TemplateInterpolationService.CHECKOUT_FIELDS.reduce<string[]>(
      (acc, [field, label]) => {
        const value = listing[field];
        if (value) acc.push(label ? `${label}: ${value}` : String(value));
        return acc;
      },
      [],
    );
    return parts.length > 0 ? parts.join('\n') : null;
  }

  private static readonly BOOLEAN_RULES: [keyof Listing, string][] = [
    ['houseRulePetsAllowed', 'Pets'],
    ['houseRuleEventsAllowed', 'Events'],
    ['houseRuleSmokingAllowed', 'Smoking'],
    ['houseRuleVapingAllowed', 'Vaping'],
  ];

  private composeHouseRules(listing: Listing): string | null {
    const rules: string[] = [];
    for (const [field, noun] of TemplateInterpolationService.BOOLEAN_RULES) {
      if (listing[field] === true) rules.push(`${noun} allowed`);
      if (listing[field] === false) rules.push(`No ${noun.toLowerCase()}`);
    }
    if (listing.houseRuleQuietHoursEnabled) {
      const start = listing.houseRuleQuietHoursStart ?? '';
      const end = listing.houseRuleQuietHoursEnd ?? '';
      rules.push(`Quiet hours: ${start} - ${end}`);
    }
    if (listing.houseRuleOtherRules) rules.push(listing.houseRuleOtherRules);
    return rules.length > 0 ? rules.join('\n') : null;
  }
}
