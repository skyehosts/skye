'use client';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import {
  CHECKOUT_INSTRUCTION_OPTIONS,
  type IGetListingResponseDto,
} from '@repo/skye-hosts-api-client';
import { ListingModalHeader } from './listing-modal-styles';
import {
  ItemList,
  type LineItem,
  ModalSection,
  thingsToKnowModalStyles,
} from './listing-things-to-know-styles';

export interface ListingHouseRulesModalProps {
  open: boolean;
  onClose: () => void;
  listing: IGetListingResponseDto;
  fullScreen?: boolean;
}

function buildDuringYourStayRules(listing: IGetListingResponseDto): LineItem[] {
  const rules: LineItem[] = [];

  rules.push({
    icon: 'people-outline',
    label: `${listing.maxGuests} guests maximum`,
  });

  if (listing.houseRulePetsAllowed === false) {
    rules.push({ icon: 'paw-outline', label: 'No pets' });
  } else if (listing.houseRulePetsAllowed === true) {
    rules.push({ icon: 'paw-outline', label: 'Pets allowed' });
  }

  if (
    listing.houseRuleQuietHoursEnabled &&
    listing.houseRuleQuietHoursStart &&
    listing.houseRuleQuietHoursEnd
  ) {
    rules.push({
      icon: 'moon-outline',
      label: `Quiet hours: ${listing.houseRuleQuietHoursStart} – ${listing.houseRuleQuietHoursEnd}`,
    });
  }

  if (listing.houseRuleEventsAllowed === false) {
    rules.push({ icon: 'calendar-outline', label: 'No parties or events' });
  } else if (listing.houseRuleEventsAllowed === true) {
    rules.push({ icon: 'calendar-outline', label: 'Events allowed' });
  }

  if (listing.houseRuleSmokingAllowed === false) {
    rules.push({ icon: 'ban-outline', label: 'No smoking' });
  } else if (listing.houseRuleSmokingAllowed === true) {
    rules.push({ icon: 'ban-outline', label: 'Smoking allowed' });
  }

  if (listing.houseRuleVapingAllowed === false) {
    rules.push({
      icon: 'cloud-outline',
      label: 'No vaping / e-cigarettes',
    });
  } else if (listing.houseRuleVapingAllowed === true) {
    rules.push({
      icon: 'cloud-outline',
      label: 'Vaping / e-cigarettes allowed',
    });
  }

  if (listing.houseRuleChildrenAllowed === false) {
    rules.push({
      icon: 'people-outline',
      label: 'Not suitable for children (2–12)',
    });
  }

  if (listing.houseRuleInfantsAllowed === false) {
    rules.push({
      icon: 'happy-outline',
      label: 'Not suitable for infants (under 2)',
    });
  }

  return rules;
}

type CheckoutField = keyof Pick<
  IGetListingResponseDto,
  | 'checkoutInstructionTowels'
  | 'checkoutInstructionRubbish'
  | 'checkoutInstructionTurnThingsOff'
  | 'checkoutInstructionLockUp'
  | 'checkoutInstructionReturnKeys'
  | 'checkoutInstructionAdditions'
>;

function buildCheckoutInstructions(
  listing: IGetListingResponseDto,
): LineItem[] {
  return CHECKOUT_INSTRUCTION_OPTIONS.filter(
    (opt) => listing[opt.field as CheckoutField],
  ).map((opt) => ({
    icon: opt.icon,
    label: opt.title,
  }));
}

export function ListingHouseRulesModal({
  open,
  onClose,
  listing,
  fullScreen,
}: ListingHouseRulesModalProps) {
  const duringYourStay = buildDuringYourStayRules(listing);
  const checkoutInstructions = buildCheckoutInstructions(listing);

  const hasCheckIn = listing.checkInTimeStart || listing.checkOutTime;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      slotProps={{
        paper: { sx: { overflowX: 'hidden' } },
      }}
    >
      <ListingModalHeader title="House rules" onClose={onClose} />

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" sx={thingsToKnowModalStyles.subtitle}>
          You&apos;ll be staying in someone&apos;s home, so please treat it with
          care and respect.
        </Typography>

        {hasCheckIn && (
          <ModalSection title="Checking in and out">
            <ItemList
              items={[
                ...(listing.checkInTimeStart
                  ? [
                      {
                        icon: 'calendar-outline',
                        label: `Check-in: ${listing.checkInTimeStart}${listing.checkInTimeEnd ? ` – ${listing.checkInTimeEnd}` : ''}`,
                      },
                    ]
                  : []),
                ...(listing.checkOutTime
                  ? [
                      {
                        icon: 'calendar-outline',
                        label: `Checkout before ${listing.checkOutTime}`,
                      },
                    ]
                  : []),
              ]}
            />
          </ModalSection>
        )}

        {duringYourStay.length > 0 && (
          <ModalSection title="During your stay">
            <ItemList items={duringYourStay} />
          </ModalSection>
        )}

        {listing.houseRuleOtherRules && (
          <ModalSection title="Additional rules">
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}
            >
              {listing.houseRuleOtherRules}
            </Typography>
          </ModalSection>
        )}

        {checkoutInstructions.length > 0 && (
          <ModalSection title="Before you leave">
            <ItemList items={checkoutInstructions} />
          </ModalSection>
        )}
      </DialogContent>
    </Dialog>
  );
}
