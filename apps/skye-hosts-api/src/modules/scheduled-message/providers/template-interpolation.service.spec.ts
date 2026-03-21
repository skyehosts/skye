import { Test, TestingModule } from '@nestjs/testing';
import { Account } from '../../account/entities';
import { Booking } from '../../booking/entities';
import { Listing } from '../../listing/entities';
import { TemplateInterpolationService } from './template-interpolation.service';

const makeGuest = (name: string): Account => ({ name }) as Account;

const makeHost = (name: string): Account => ({ name }) as Account;

const makeBooking = (overrides: Partial<Booking> = {}): Booking =>
  ({
    checkInDate: '2025-06-01',
    checkOutDate: '2025-06-05',
    totalPrice: 400,
    guestId: 1,
    ...overrides,
  }) as Booking;

const makeListing = (overrides: Partial<Listing> = {}): Listing =>
  ({
    title: 'Skye Cottage',
    checkInTimeStart: '15:00',
    checkOutTime: '11:00',
    wifiNetwork: 'SkyeWifi',
    wifiPassword: 'pass123',
    bedrooms: 2,
    beds: 3,
    bathrooms: 1,
    directions: 'Head north on the A87.',
    guestAccess: 'Full access to ground floor.',
    houseManual: 'Manual text here.',
    checkoutInstructionTowels: 'Leave in bathroom.',
    checkoutInstructionRubbish: 'Bin outside.',
    checkoutInstructionTurnThingsOff: 'Turn off all lights.',
    checkoutInstructionLockUp: 'Lock front door.',
    checkoutInstructionReturnKeys: 'Post through letterbox.',
    checkoutInstructionAdditions: 'Please strip the beds.',
    houseRulePetsAllowed: false,
    houseRuleEventsAllowed: false,
    houseRuleSmokingAllowed: false,
    houseRuleVapingAllowed: false,
    houseRuleQuietHoursEnabled: true,
    houseRuleQuietHoursStart: '22:00',
    houseRuleQuietHoursEnd: '08:00',
    houseRuleOtherRules: 'No shoes indoors.',
    ...overrides,
  }) as Listing;

describe('TemplateInterpolationService', () => {
  let service: TemplateInterpolationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateInterpolationService],
    }).compile();

    service = module.get(TemplateInterpolationService);
  });

  describe('interpolate — token substitution', () => {
    it('replaces a simple token', () => {
      const result = service.interpolate('Hello {{listing_name}}!', {
        booking: makeBooking(),
        guest: makeGuest('Jane Doe'),
        listing: makeListing(),
        host: makeHost('Bob Smith'),
      });
      expect(result).toBe('Hello Skye Cottage!');
    });

    it('replaces multiple tokens in one string', () => {
      const result = service.interpolate(
        '{{guest_first_name}} checks in on {{check_in_date}}.',
        {
          booking: makeBooking(),
          guest: makeGuest('Jane Doe'),
          listing: makeListing(),
          host: makeHost('Bob Smith'),
        },
      );
      expect(result).toBe('Jane checks in on 2025-06-01.');
    });

    it('handles tokens with extra whitespace: {{ key }}', () => {
      const result = service.interpolate('Hello {{ listing_name }}!', {
        booking: makeBooking(),
        guest: makeGuest('Jane'),
        listing: makeListing(),
        host: makeHost('Bob'),
      });
      expect(result).toBe('Hello Skye Cottage!');
    });

    it('handles tokens with multiple spaces: {{  key  }}', () => {
      const result = service.interpolate('Hi {{  guest_first_name  }}', {
        booking: makeBooking(),
        guest: makeGuest('Jane'),
        listing: makeListing(),
        host: makeHost('Bob'),
      });
      expect(result).toBe('Hi Jane');
    });

    it('replaces unknown tokens with empty string', () => {
      const result = service.interpolate('Hello {{totally_unknown}}', {
        booking: makeBooking(),
        guest: makeGuest('Jane'),
        listing: makeListing(),
        host: makeHost('Bob'),
      });
      expect(result).toBe('Hello ');
    });

    it('replaces TODO tokens (known but unavailable) with empty string', () => {
      const result = service.interpolate('Code: {{confirmation_code}}', {
        booking: makeBooking(),
        guest: makeGuest('Jane'),
        listing: makeListing(),
        host: makeHost('Bob'),
      });
      expect(result).toBe('Code: ');
    });

    it('leaves non-token text unchanged', () => {
      const result = service.interpolate('No tokens here.', {
        booking: makeBooking(),
        guest: makeGuest('Jane'),
        listing: makeListing(),
        host: makeHost('Bob'),
      });
      expect(result).toBe('No tokens here.');
    });
  });

  describe('interpolate — guest tokens', () => {
    it('splits single-word name: first name is full name, last name is empty', () => {
      const ctx = {
        booking: makeBooking(),
        guest: makeGuest('Cher'),
        listing: makeListing(),
        host: makeHost('Bob'),
      };
      expect(service.interpolate('{{guest_first_name}}', ctx)).toBe('Cher');
      expect(service.interpolate('{{guest_last_name}}', ctx)).toBe('');
    });

    it('splits multi-word name correctly', () => {
      const ctx = {
        booking: makeBooking(),
        guest: makeGuest('Jane Mary Doe'),
        listing: makeListing(),
        host: makeHost('Bob'),
      };
      expect(service.interpolate('{{guest_first_name}}', ctx)).toBe('Jane');
      expect(service.interpolate('{{guest_last_name}}', ctx)).toBe('Mary Doe');
    });
  });

  describe('interpolate — trip tokens', () => {
    it('computes number_of_nights correctly', () => {
      const result = service.interpolate('{{number_of_nights}} nights', {
        booking: makeBooking({
          checkInDate: '2025-06-01',
          checkOutDate: '2025-06-05',
        }),
        guest: makeGuest('Jane'),
        listing: makeListing(),
        host: makeHost('Bob'),
      });
      expect(result).toBe('4 nights');
    });

    it('returns empty for number_of_nights when dates are missing', () => {
      const result = service.interpolate('{{number_of_nights}}', {
        booking: makeBooking({
          checkInDate: undefined as unknown as string,
          checkOutDate: undefined as unknown as string,
        }),
        guest: makeGuest('Jane'),
        listing: makeListing(),
        host: makeHost('Bob'),
      });
      expect(result).toBe('');
    });

    it('renders total_trip_price', () => {
      const result = service.interpolate('Total: {{total_trip_price}}', {
        booking: makeBooking({ totalPrice: 250 }),
        guest: makeGuest('Jane'),
        listing: makeListing(),
        host: makeHost('Bob'),
      });
      expect(result).toBe('Total: 250');
    });
  });

  describe('interpolate — listing tokens', () => {
    it('renders null listing fields as empty string', () => {
      const result = service.interpolate('{{wifi_name}} / {{wifi_password}}', {
        booking: makeBooking(),
        guest: makeGuest('Jane'),
        listing: makeListing({ wifiNetwork: null, wifiPassword: null }),
        host: makeHost('Bob'),
      });
      expect(result).toBe(' / ');
    });

    it('renders numeric listing fields as strings', () => {
      const result = service.interpolate(
        '{{number_of_bedrooms}} bed, {{number_of_bathrooms}} bath',
        {
          booking: makeBooking(),
          guest: makeGuest('Jane'),
          listing: makeListing({ bedrooms: 3, bathrooms: 2 }),
          host: makeHost('Bob'),
        },
      );
      expect(result).toBe('3 bed, 2 bath');
    });
  });

  describe('interpolate — composeCheckoutInstructions', () => {
    it('composes all checkout instruction fields into a newline-joined string', () => {
      const result = service.interpolate('{{checkout_instructions}}', {
        booking: makeBooking(),
        guest: makeGuest('Jane'),
        listing: makeListing(),
        host: makeHost('Bob'),
      });
      expect(result).toContain('Towels: Leave in bathroom.');
      expect(result).toContain('Rubbish: Bin outside.');
      expect(result).toContain('Turn things off: Turn off all lights.');
      expect(result).toContain('Lock up: Lock front door.');
      expect(result).toContain('Return keys: Post through letterbox.');
      expect(result).toContain('Please strip the beds.');
    });

    it('returns empty string when no checkout instruction fields are set', () => {
      const result = service.interpolate('{{checkout_instructions}}', {
        booking: makeBooking(),
        guest: makeGuest('Jane'),
        listing: makeListing({
          checkoutInstructionTowels: null,
          checkoutInstructionRubbish: null,
          checkoutInstructionTurnThingsOff: null,
          checkoutInstructionLockUp: null,
          checkoutInstructionReturnKeys: null,
          checkoutInstructionAdditions: null,
        }),
        host: makeHost('Bob'),
      });
      expect(result).toBe('');
    });
  });

  describe('interpolate — composeHouseRules', () => {
    it('renders "allowed" and "No X" forms for each boolean rule', () => {
      const result = service.interpolate('{{house_rules}}', {
        booking: makeBooking(),
        guest: makeGuest('Jane'),
        listing: makeListing({
          houseRulePetsAllowed: true,
          houseRuleEventsAllowed: false,
          houseRuleSmokingAllowed: null,
          houseRuleVapingAllowed: true,
          houseRuleQuietHoursEnabled: false,
          houseRuleOtherRules: null,
        }),
        host: makeHost('Bob'),
      });
      expect(result).toContain('Pets allowed');
      expect(result).toContain('No events');
      expect(result).not.toContain('Smoking');
      expect(result).toContain('Vaping allowed');
      expect(result).not.toContain('Quiet hours');
    });

    it('includes quiet hours when enabled', () => {
      const result = service.interpolate('{{house_rules}}', {
        booking: makeBooking(),
        guest: makeGuest('Jane'),
        listing: makeListing({
          houseRuleQuietHoursEnabled: true,
          houseRuleQuietHoursStart: '22:00',
          houseRuleQuietHoursEnd: '08:00',
          houseRulePetsAllowed: null,
          houseRuleEventsAllowed: null,
          houseRuleSmokingAllowed: null,
          houseRuleVapingAllowed: null,
          houseRuleOtherRules: null,
        }),
        host: makeHost('Bob'),
      });
      expect(result).toContain('Quiet hours: 22:00 - 08:00');
    });

    it('returns empty string when no rules are set', () => {
      const result = service.interpolate('{{house_rules}}', {
        booking: makeBooking(),
        guest: makeGuest('Jane'),
        listing: makeListing({
          houseRulePetsAllowed: null,
          houseRuleEventsAllowed: null,
          houseRuleSmokingAllowed: null,
          houseRuleVapingAllowed: null,
          houseRuleQuietHoursEnabled: false,
          houseRuleOtherRules: null,
        }),
        host: makeHost('Bob'),
      });
      expect(result).toBe('');
    });
  });

  describe('validateTokens', () => {
    it('returns empty array for a template with no tokens', () => {
      expect(service.validateTokens('No tokens here.')).toEqual([]);
    });

    it('returns empty array when all tokens are valid', () => {
      expect(
        service.validateTokens(
          'Hi {{guest_first_name}}, check in at {{check_in_time}}.',
        ),
      ).toEqual([]);
    });

    it('returns unknown token keys', () => {
      const invalid = service.validateTokens(
        'Hello {{typo_name}} and {{guest_first_name}}',
      );
      expect(invalid).toEqual(['typo_name']);
    });

    it('handles whitespace variants in validation', () => {
      const invalid = service.validateTokens(
        '{{ bad_key }} and {{  another_bad  }}',
      );
      expect(invalid).toEqual(['bad_key', 'another_bad']);
    });

    it('does not flag TODO tokens (they are registered as valid keys)', () => {
      const invalid = service.validateTokens('Code: {{confirmation_code}}');
      expect(invalid).toEqual([]);
    });
  });
});
