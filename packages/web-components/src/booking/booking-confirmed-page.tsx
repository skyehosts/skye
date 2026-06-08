'use client';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { formatShortDateRange } from '@repo/common';
import type { IGetListingResponseDto } from '@repo/skye-hosts-api-client';
import Link from 'next/link';

export interface BookingConfirmedPageProps {
  listing: IGetListingResponseDto;
  checkin: Date;
  checkout: Date;
}

export function BookingConfirmedPage({
  listing,
  checkin,
  checkout,
}: BookingConfirmedPageProps) {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            textAlign: 'center',
          }}
        >
          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 56 }} />
          <Typography
            component="h1"
            sx={{ fontSize: { xs: '1.75rem', md: '2rem' }, fontWeight: 600 }}
          >
            Booking confirmed
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your stay is locked in. A confirmation is on its way.
          </Typography>
        </Box>

        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              py: 3,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Your stay
            </Typography>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
              {listing.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatShortDateRange(checkin, checkout)}
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 3 }}
          >
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
              Next step: say hello to your host
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Introduce yourself on the messages page — your host will receive
              scheduled reminders, and you can ask anything about your stay at
              any time.
            </Typography>
            <Button
              component={Link}
              href="/messages"
              variant="contained"
              size="large"
              sx={{ alignSelf: 'flex-start' }}
            >
              Go to messages
            </Button>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button component={Link} href="/" variant="text">
            Back to home
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
