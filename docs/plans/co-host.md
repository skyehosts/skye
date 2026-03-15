Revised Plan

Current Airbnb Co-Host Permission Levels

Full Access

Message guests

Edit the calendar

Manage pricing and listing details

Accept/decline reservations and cancellations

Handle damage or reimbursement requests

View earnings dashboards and payouts

Add or remove other co-hosts (but cannot add another full-access co-host)

Calendar and Messaging Access

Message guests

View the calendar

Cannot edit the calendar or listing details

Calendar Access

View booking dates and availability only

No messaging or listing management permissions

Permission System

Granular permissions mapped to roles, not hardcoded per-role checks:

// enums/co-host-enums.ts
export type CoHostRole = 'full_access' | 'calendar_and_messaging' | 'calendar_only';
export type ListingRole = 'owner' | CoHostRole;

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

Role → Permission mapping:

┌─────────────────────┬───────┬─────────────┬────────────────────────┬───────────────┐
│ Permission │ owner │ full_access │ calendar_and_messaging │ calendar_only │
├─────────────────────┼───────┼─────────────┼────────────────────────┼───────────────┤
│ view_listing │ Y │ Y │ - │ - │
├─────────────────────┼───────┼─────────────┼────────────────────────┼───────────────┤
│ edit_listing │ Y │ Y │ - │ - │
├─────────────────────┼───────┼─────────────┼────────────────────────┼───────────────┤
│ view_calendar │ Y │ Y │ Y │ Y │
├─────────────────────┼───────┼─────────────┼────────────────────────┼───────────────┤
│ edit_calendar │ Y │ Y │ - │ - │
├─────────────────────┼───────┼─────────────┼────────────────────────┼───────────────┤
│ message_guests │ Y │ Y │ Y │ - │
├─────────────────────┼───────┼─────────────┼────────────────────────┼───────────────┤
│ manage_reservations │ Y │ Y │ - │ - │
├─────────────────────┼───────┼─────────────┼────────────────────────┼───────────────┤
│ view_earnings │ Y │ Y │ - │ - │
├─────────────────────┼───────┼─────────────┼────────────────────────┼───────────────┤
│ manage_cohosts │ Y │ Y\* │ - │ - │
├─────────────────────┼───────┼─────────────┼────────────────────────┼───────────────┤
│ delete_listing │ Y │ - │ - │ - │
└─────────────────────┴───────┴─────────────┴────────────────────────┴───────────────┘

- full_access can invite calendar_and_messaging or calendar_only only — cannot invite another full_access. Only owner can invite full_access.

This lives as a constant map in the api-client package so both API and app can reference it:

export const LISTING_ROLE_PERMISSIONS: Record<ListingRole, ListingPermission[]> = {
owner: [/* all */],
full_access: [/* all except DELETE_LISTING */],
calendar_and_messaging: [ListingPermission.VIEW_CALENDAR, ListingPermission.MESSAGE_GUESTS],
calendar_only: [ListingPermission.VIEW_CALENDAR],
};

API enforcement — ListingAccessService:

- hasPermission(accountId, listingId, permission): Promise<boolean> — resolves role from listing.hostId or ListingUserRole row, then checks the map
- Used by the co-host controller, listing controller, and future booking/message controllers
- Existing PATCH /listing/:id changes from hostId === authenticatedUser.sub to hasPermission(user, listing, EDIT_LISTING)

Invite permission rule:

- owner can invite any role
- full_access can invite calendar_and_messaging or calendar_only only
- Others cannot invite
- Enforced in CoHostInviteService.create() — not a separate permission enum value, just a business rule on the manage_cohosts permission + role hierarchy
  check

---

Invite Flow (Deep Linking + Account Handling)

Deep link: skyehosts://co-host-invite/{token}

The owner gets back an invite link after creating the invite. They share it manually (text, WhatsApp, etc.) — we don't send emails/SMS in this phase.

Flow diagram:

Owner creates invite
→ API returns { inviteLink: "skyehosts://co-host-invite/{token}", ... }
→ Owner shares link manually

Invitee taps link
→ App opens (or store redirect — handled by Expo linking config)
→ App reads token from deep link
→ App calls GET /co-host-invite/details/{token} (public endpoint)
→ Shows invite details: listing name, inviter name, role offered

    ┌─ If authenticated & email matches invitee_email:
    │    → Show "Accept Invite" screen with listing preview
    │    → POST /co-host-invite/accept { token }
    │    → Done — listing appears in their dashboard
    │
    ├─ If authenticated but email doesn't match:
    │    → Show error: "This invite was sent to {email}"
    │
    ├─ If not authenticated, invitee HAS an account:
    │    → Show login form (or redirect to login with token preserved)
    │    → After login → same accept flow
    │
    └─ If not authenticated, invitee has NO account (most common):
         → Show sign-up form on the invite screen itself:
           - Name
           - Phone number → OTP verification
           - (email pre-filled from invite, read-only)
         → On successful sign-up, token is auto-accepted in the same flow
         → POST /co-host-invite/accept { token } (now authenticated)
         → User lands in app with listing in dashboard

Key implementation details:

1. Token persistence during sign-up: Store the invite token in React state / async storage when the deep link is opened. The sign-up flow is embedded in
   the invite screen, so it stays in memory. After sign-up completes and tokens are stored, the screen immediately calls the accept endpoint.
2. GET /co-host-invite/details/:token — public endpoint (no auth required) that returns:
   {
   "listingTitle": "Highland Cabin",
   "inviterName": "John",
   "role": "full_access",
   "inviteeEmail": "jane@example.com",
   "status": "pending",
   "expiresAt": "2026-03-20T..."
   }
3. This lets us render the invite screen before the user is authenticated.
4. POST /co-host-invite/accept — protected endpoint. The service verifies:
   - Token is valid (hash matches)
   - Status is pending
   - Not expired
   - Authenticated user's email matches inviteeEmail
   - Creates ListingUserRole row
   - Marks invite as accepted

5. Sign-up on invite screen: Collects same data as regular sign-up (name, phone, OTP) but also requires setting the email to the invite's inviteeEmail.
   After phoneVerifyOtp succeeds, we update the new account's email, then call accept. This may need a small addition to the auth flow — either a param on
   the OTP verify endpoint or a follow-up PATCH /account call to set email.

---

Questions for You

1. Email requirement: Currently phone-based sign-ups don't require an email. For co-host invites, the invitee is identified by email. Should the
   sign-up-via-invite flow require the invitee to set their email (matching the invite email)? I'd say yes — it's the identity link. This means after phone
   OTP verification, we set the account email to the invite email.
2. Can an invitee use a different email than what was invited? I'd say no — the invite is tied to a specific email for security. If they want a different
   email, the owner needs to create a new invite.
3. full_access co-host adding other co-hosts: The Airbnb model says they can add/remove co-hosts but not add another full_access. Should full_access also
   be able to remove co-hosts they didn't invite? Or only the ones they invited? I'd lean toward: full_access can remove any non-owner co-host, owner can
   remove anyone.
4. Deep link config: Does your Expo app already have deep linking / universal links configured? I'll need to add the co-host-invite route to the linking
   config.

---

Updated File Plan

Everything else from the original plan stays the same. Key changes:

App screens restructured:
apps/skye-hosts-app/app/
co-host/
invite-landing.tsx → Deep link target: shows invite details + accept/sign-up
invite-create.tsx → Owner form to create invite
manage.tsx → List co-hosts & pending invites for a listing

API endpoints updated:

┌────────────────────────────────────────────────┬───────────┬───────────────────────────────────────┬─────────────┐
│ Method │ Path │ Auth │ Description │
├────────────────────────────────────────────────┼───────────┼───────────────────────────────────────┼─────────────┤
│ POST /co-host-invite │ Protected │ Create invite (owner or full_access) │ │
├────────────────────────────────────────────────┼───────────┼───────────────────────────────────────┼─────────────┤
│ GET /co-host-invite/listing/:listingId │ Protected │ Get invites for a listing │ │
├────────────────────────────────────────────────┼───────────┼───────────────────────────────────────┼─────────────┤
│ GET /co-host-invite/details/:token │ Public │ Get invite details for landing screen │ │
├────────────────────────────────────────────────┼───────────┼───────────────────────────────────────┼─────────────┤
│ POST /co-host-invite/accept │ Protected │ Accept invite │ │
├────────────────────────────────────────────────┼───────────┼───────────────────────────────────────┼─────────────┤
│ POST /co-host-invite/revoke │ Protected │ Revoke pending invite │ │
├────────────────────────────────────────────────┼───────────┼───────────────────────────────────────┼─────────────┤
│ DELETE /co-host-invite/role/:listingUserRoleId │ Protected │ Remove a co-host │ │
└────────────────────────────────────────────────┴───────────┴───────────────────────────────────────┴─────────────┘

---

Want me to proceed with implementation once you've answered the questions above?
