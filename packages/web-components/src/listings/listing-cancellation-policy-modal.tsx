'use client';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import type { CancellationPolicyShortTermId } from '@repo/skye-hosts-api-client';
import {
  formatCancellationDate,
  getCancellationCutoffs,
} from './cancellation-policy-utils';
import { ListingModalHeader } from './listing-modal-styles';
import { thingsToKnowModalStyles } from './listing-things-to-know-styles';

export interface ListingCancellationPolicyModalProps {
  open: boolean;
  onClose: () => void;
  policy: CancellationPolicyShortTermId;
  checkInDate: Date;
  checkInTimeStart: string | null;
  fullScreen?: boolean;
}

function RefundRow({
  dateLabel,
  timeLabel,
  refundTitle,
  refundDescription,
}: {
  dateLabel: string;
  timeLabel: string;
  refundTitle: string;
  refundDescription: string;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        py: 2,
      }}
    >
      <Box sx={{ flex: '0 0 35%' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Before
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {dateLabel}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {timeLabel}
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {refundTitle}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {refundDescription}
        </Typography>
      </Box>
    </Box>
  );
}

export function ListingCancellationPolicyModal({
  open,
  onClose,
  policy,
  checkInDate,
  checkInTimeStart,
  fullScreen,
}: ListingCancellationPolicyModalProps) {
  const cutoffs = getCancellationCutoffs(policy, checkInDate, checkInTimeStart);

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
      <ListingModalHeader title="Cancellation policy" onClose={onClose} />

      <DialogContent sx={{ pt: 2 }}>
        <Box
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 3,
          }}
        >
          <Box sx={{ px: 2 }}>
            <RefundRow
              dateLabel={formatCancellationDate(cutoffs.freeCancellationDate)}
              timeLabel={cutoffs.cutoffTime}
              refundTitle="Full refund"
              refundDescription="Get back 100% of what you paid."
            />
          </Box>
          <Divider />
          <Box sx={{ px: 2 }}>
            <RefundRow
              dateLabel={formatCancellationDate(cutoffs.partialRefundDate)}
              timeLabel={cutoffs.cutoffTime}
              refundTitle="Partial refund"
              refundDescription="Get back every night but the first one. No refund of the first night or the service fee."
            />
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Time shown is based on the location of the listing.
        </Typography>

        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
          Refund eligibility
        </Typography>

        <Typography variant="body2" sx={thingsToKnowModalStyles.subtitle}>
          <Link href="/cancellation-policies" underline="always">
            View full policy
          </Link>
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
