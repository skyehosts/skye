'use client';

import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScienceIcon from '@mui/icons-material/Science';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { Environments, formatGbp, type DiscountType } from '@repo/common';
import {
  fetchApi,
  type IBookingPaymentRequestDto,
  type IBookingPaymentResponseDto,
} from '@repo/skye-hosts-api-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getDisplayError } from '../forms/get-display-error';
import { formatDateParam } from '../listings/listing-guest-types';
import { type Quote } from './use-quote';

export interface BookingPaymentSectionProps {
  quote: Quote | null;
  listingId: number;
  guestId: number;
  dateRange: { from: Date; to: Date } | null;
}

function discountLabel(type: DiscountType): string {
  if (type === 'lastMinute') return 'Last-minute discount';
  if (type === 'weekly') return 'Weekly discount';
  return 'Monthly discount';
}

function PriceLine({
  label,
  amount,
  bold,
}: {
  label: string;
  amount: string;
  bold?: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 0.75,
      }}
    >
      <Typography variant="body2" sx={bold ? { fontWeight: 700 } : undefined}>
        {label}
      </Typography>
      <Typography variant="body2" sx={bold ? { fontWeight: 700 } : undefined}>
        {amount}
      </Typography>
    </Box>
  );
}

function TestBookingPanel({
  listingId,
  guestId,
  dateRange,
  totalPrice,
}: {
  listingId: number;
  guestId: number;
  dateRange: { from: Date; to: Date } | null;
  totalPrice: number | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!dateRange || totalPrice === null) return;
    setLoading(true);
    setError(null);
    const checkin = formatDateParam(dateRange.from);
    const checkout = formatDateParam(dateRange.to);
    try {
      await fetchApi<IBookingPaymentResponseDto, IBookingPaymentRequestDto>(
        '/payment/process-booking-payment',
        {
          listingId,
          guestId,
          checkInDate: checkin,
          checkOutDate: checkout,
          totalPrice,
          isTestBooking: true,
        },
      );
      const qs = new URLSearchParams({
        listingId: String(listingId),
        checkin,
        checkout,
      }).toString();
      router.push(`/booking-confirmed?${qs}`);
    } catch (e) {
      setError(getDisplayError(e));
      setLoading(false);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderStyle: 'dashed',
        borderColor: 'warning.main',
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon color="warning" fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Test booking (dev only)
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Bypass payment and simulate a successful booking. Scheduled messages
          will fire at 0, 1, 2, 3 min offsets.
        </Typography>
        <Button
          variant="contained"
          color="warning"
          onClick={handleClick}
          disabled={!dateRange || totalPrice === null || loading}
        >
          {loading ? 'Creating…' : 'Create test booking'}
        </Button>
        {error && <Alert severity="error">{error}</Alert>}
      </CardContent>
    </Card>
  );
}

export function BookingPaymentSection({
  quote,
  listingId,
  guestId,
  dateRange,
}: BookingPaymentSectionProps) {
  const isDev =
    process.env.NEXT_PUBLIC_SKYE_ENVIRONMENT !== Environments.PRODUCTION;

  const nightsCount = quote?.nights.length ?? 0;
  const avgNightlyPence =
    quote && nightsCount > 0
      ? Math.round(quote.nightlyRateSumPence / nightsCount)
      : 0;
  const serviceFeePence = quote
    ? quote.guestFeePence + quote.stripeFeePence
    : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography
          component="h2"
          sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2 }}
        >
          Pay with
        </Typography>
        <Card
          variant="outlined"
          sx={{
            borderStyle: 'dashed',
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': { borderColor: 'primary.main' },
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 2.5,
            }}
          >
            <AddIcon color="action" />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Add a payment method
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Payment setup coming soon
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {isDev && (
        <TestBookingPanel
          listingId={listingId}
          guestId={guestId}
          dateRange={dateRange}
          totalPrice={quote ? Math.round(quote.totalGuestPence) / 100 : null}
        />
      )}

      <Box>
        <Typography
          component="h2"
          sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 1 }}
        >
          Price details
        </Typography>
        {quote ? (
          <Accordion
            disableGutters
            elevation={0}
            square
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              '&:before': { display: 'none' },
              overflow: 'hidden',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: 2, '& .MuiAccordionSummary-content': { my: 1.5 } }}
            >
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Total ({quote.currency})
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formatGbp(quote.totalGuestPence)}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pt: 0 }}>
              <Divider sx={{ mb: 1 }} />
              <PriceLine
                label={`${formatGbp(avgNightlyPence)} × ${nightsCount} night${
                  nightsCount !== 1 ? 's' : ''
                }`}
                amount={formatGbp(quote.nightlyRateSumPence)}
              />
              {quote.appliedDiscounts.map((d) => (
                <PriceLine
                  key={d.type}
                  label={`${discountLabel(d.type)} (-${d.percent}%)`}
                  amount={`-${formatGbp(d.amountPence)}`}
                />
              ))}
              {quote.cleaningFeePound > 0 && (
                <PriceLine
                  label="Cleaning fee"
                  amount={formatGbp(quote.cleaningFeePound * 100)}
                />
              )}
              {serviceFeePence > 0 && (
                <PriceLine
                  label="Service fee"
                  amount={formatGbp(serviceFeePence)}
                />
              )}
              <Divider sx={{ my: 1 }} />
              <PriceLine
                label="Total"
                amount={formatGbp(quote.totalGuestPence)}
                bold
              />
            </AccordionDetails>
          </Accordion>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>
            Add dates to see price details.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
