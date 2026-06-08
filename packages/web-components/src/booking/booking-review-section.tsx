'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { formatShortDateRange } from '@repo/common';
import type { CancellationPolicyShortTermId } from '@repo/skye-hosts-api-client';
import {
  formatCancellationDate,
  getCancellationCutoffs,
} from '../listings/cancellation-policy-utils';
import type { GuestCounts } from '../listings/listing-guest-types';
import { formatGuestBreakdown } from '../listings/listing-guest-types';

export interface BookingReviewSectionProps {
  listingTitle: string;
  coverImageUrl: string | null;
  cancellationPolicy: CancellationPolicyShortTermId;
  checkInTimeStart: string | null;
  dateRange: { from: Date; to: Date } | null;
  guests: GuestCounts;
  onChangeDates: () => void;
  onChangeGuests: () => void;
  onOpenCancellationPolicy: () => void;
}

function ChangeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: () => void;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.5,
      }}
    >
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      </Box>
      <Button
        onClick={onChange}
        size="small"
        variant="text"
        sx={{ fontWeight: 600, textDecoration: 'underline' }}
      >
        Change
      </Button>
    </Box>
  );
}

export function BookingReviewSection({
  listingTitle,
  coverImageUrl,
  cancellationPolicy,
  checkInTimeStart,
  dateRange,
  guests,
  onChangeDates,
  onChangeGuests,
  onOpenCancellationPolicy,
}: BookingReviewSectionProps) {
  const freeCancellationLabel = dateRange
    ? `Free cancellation before ${formatCancellationDate(
        getCancellationCutoffs(
          cancellationPolicy,
          dateRange.from,
          checkInTimeStart,
        ).freeCancellationDate,
      )}.`
    : null;

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: 'custom.driftwoodSand',
              flexShrink: 0,
            }}
          >
            {coverImageUrl && (
              <Box
                component="img"
                src={coverImageUrl}
                alt={listingTitle}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            )}
          </Box>
          <Typography
            component="h2"
            sx={{
              fontSize: '1.125rem',
              fontWeight: 600,
              lineHeight: 1.3,
              flex: 1,
              minWidth: 0,
            }}
          >
            {listingTitle}
          </Typography>
        </Box>

        {freeCancellationLabel && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ py: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {freeCancellationLabel}
              </Typography>
              <Typography
                component="button"
                onClick={onOpenCancellationPolicy}
                variant="body2"
                sx={{
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: 'text.primary',
                  fontFamily: 'inherit',
                }}
              >
                View cancellation policy
              </Typography>
            </Box>
          </>
        )}

        <Divider sx={{ my: 1 }} />
        <ChangeRow
          label="Dates"
          value={
            dateRange
              ? formatShortDateRange(dateRange.from, dateRange.to)
              : 'Add dates'
          }
          onChange={onChangeDates}
        />
        <Divider sx={{ my: 1 }} />
        <ChangeRow
          label="Guests"
          value={formatGuestBreakdown(guests)}
          onChange={onChangeGuests}
        />
      </CardContent>
    </Card>
  );
}
