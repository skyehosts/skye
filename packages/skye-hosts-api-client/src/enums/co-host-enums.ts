export type CoHostRole =
  | 'full_access'
  | 'calendar_and_messaging'
  | 'calendar_only';

export type ListingRole = 'owner' | CoHostRole;

export type CoHostInviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export enum ListingPermission {
  VIEW_LISTING = 'view_listing',
  EDIT_LISTING = 'edit_listing',
  VIEW_CALENDAR = 'view_calendar',
  EDIT_CALENDAR = 'edit_calendar',
  MESSAGE_GUESTS = 'message_guests',
  MANAGE_RESERVATIONS = 'manage_reservations',
  VIEW_EARNINGS = 'view_earnings',
  MANAGE_COHOSTS = 'manage_cohosts',
  DELETE_LISTING = 'delete_listing',
}

export const LISTING_ROLE_PERMISSIONS: Record<
  ListingRole,
  ListingPermission[]
> = {
  owner: Object.values(ListingPermission),
  full_access: [
    ListingPermission.VIEW_LISTING,
    ListingPermission.EDIT_LISTING,
    ListingPermission.VIEW_CALENDAR,
    ListingPermission.EDIT_CALENDAR,
    ListingPermission.MESSAGE_GUESTS,
    ListingPermission.MANAGE_RESERVATIONS,
    ListingPermission.VIEW_EARNINGS,
    ListingPermission.MANAGE_COHOSTS,
  ],
  calendar_and_messaging: [
    ListingPermission.VIEW_CALENDAR,
    ListingPermission.MESSAGE_GUESTS,
  ],
  calendar_only: [ListingPermission.VIEW_CALENDAR],
};

/** Roles that a full_access co-host is allowed to invite */
export const FULL_ACCESS_INVITABLE_ROLES: CoHostRole[] = [
  'calendar_and_messaging',
  'calendar_only',
];
