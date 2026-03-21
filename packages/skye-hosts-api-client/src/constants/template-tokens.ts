export interface ITemplateToken {
  key: string;
  label: string;
  available: boolean;
}

export interface ITemplateTokenCategory {
  id: string;
  title: string;
  tokens: ITemplateToken[];
}

export const TEMPLATE_TOKEN_CATEGORIES: ITemplateTokenCategory[] = [
  {
    id: 'most_popular',
    title: 'Most popular',
    tokens: [
      { key: 'guest_first_name', label: 'Guest first name', available: true },
      { key: 'guest_last_name', label: 'Guest last name', available: true },
      { key: 'check_in_date', label: 'Check-in date', available: true },
      { key: 'check_in_time', label: 'Check-in time', available: true },
      { key: 'checkout_date', label: 'Checkout date', available: true },
      { key: 'checkout_time', label: 'Checkout time', available: true },
    ],
  },
  {
    id: 'guest_information',
    title: 'Guest information',
    tokens: [
      { key: 'guest_first_name', label: 'Guest first name', available: true },
      { key: 'guest_last_name', label: 'Guest last name', available: true },
      { key: 'guest_city', label: 'Guest city', available: false },
      { key: 'guest_country', label: 'Guest country', available: false },
    ],
  },
  {
    id: 'trip_information',
    title: 'Trip information',
    tokens: [
      { key: 'check_in_date', label: 'Check-in date', available: true },
      { key: 'checkout_date', label: 'Checkout date', available: true },
      { key: 'check_in_time', label: 'Check-in time', available: true },
      { key: 'checkout_time', label: 'Checkout time', available: true },
      { key: 'number_of_nights', label: 'Number of nights', available: true },
      { key: 'number_of_guests', label: 'Number of guests', available: false },
      {
        key: 'confirmation_code',
        label: 'Confirmation code',
        available: false,
      },
      {
        key: 'average_nightly_price',
        label: 'Average nightly price',
        available: false,
      },
      { key: 'total_trip_price', label: 'Total trip price', available: true },
      { key: 'cleaning_fee', label: 'Cleaning fee', available: false },
    ],
  },
  {
    id: 'listing_information',
    title: 'Listing information',
    tokens: [
      { key: 'listing_name', label: 'Listing name', available: true },
      { key: 'listing_city', label: 'City', available: false },
      { key: 'listing_address', label: 'Address', available: false },
      { key: 'wifi_name', label: 'Wifi name', available: true },
      { key: 'wifi_password', label: 'Wifi password', available: true },
      { key: 'check_in_method', label: 'Check-in method', available: false },
      {
        key: 'number_of_bedrooms',
        label: 'Number of bedrooms',
        available: true,
      },
      { key: 'number_of_beds', label: 'Number of beds', available: true },
      {
        key: 'number_of_bathrooms',
        label: 'Number of bathrooms',
        available: true,
      },
      {
        key: 'primary_host_first_name',
        label: 'Primary host first name',
        available: true,
      },
      {
        key: 'primary_host_last_name',
        label: 'Primary host last name',
        available: true,
      },
      { key: 'directions', label: 'Directions', available: true },
      { key: 'getting_around', label: 'Getting around', available: false },
      { key: 'neighbourhood', label: 'Neighbourhood', available: false },
      {
        key: 'checkout_instructions',
        label: 'Checkout instructions',
        available: true,
      },
      { key: 'house_rules', label: 'House rules', available: true },
      { key: 'house_manual', label: 'House manual', available: true },
      { key: 'guest_access', label: 'Guest access', available: true },
      {
        key: 'guest_interaction',
        label: 'Guest interaction',
        available: false,
      },
      { key: 'guidebook', label: 'Guidebook', available: false },
      {
        key: 'suggested_door_code',
        label: 'Suggested door code',
        available: false,
      },
    ],
  },
];

export const ALL_TEMPLATE_TOKENS: ITemplateToken[] =
  TEMPLATE_TOKEN_CATEGORIES.flatMap((c) => c.tokens);

export const UNIQUE_TEMPLATE_TOKENS: ITemplateToken[] = [
  ...new Map(ALL_TEMPLATE_TOKENS.map((t) => [t.key, t])).values(),
];

export const VALID_TOKEN_KEYS = new Set(
  UNIQUE_TEMPLATE_TOKENS.map((t) => t.key),
);
