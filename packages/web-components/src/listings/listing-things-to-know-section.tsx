'use client';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  SAFETY_CONSIDERATIONS_CONFIG,
  SAFETY_DEVICES_CONFIG,
  type IGetListingResponseDto,
} from '@repo/skye-hosts-api-client';
import { useState } from 'react';
import { AmenityIcon } from './amenity-icon';
import { ListingHouseRulesModal } from './listing-house-rules-modal';
import { ListingSafetyModal } from './listing-safety-modal';
import { parseTriStateYesItems } from './listing-things-to-know-styles';

export interface ListingThingsToKnowSectionProps {
  listing: IGetListingResponseDto;
}

interface ThingsToKnowCard {
  id: string;
  icon: string;
  title: string;
  lines: string[];
  onOpen: () => void;
}

function buildHouseRulesPreview(listing: IGetListingResponseDto): string[] {
  const lines: string[] = [];

  if (listing.checkInTimeStart) {
    const end = listing.checkInTimeEnd ? ` - ${listing.checkInTimeEnd}` : '';
    lines.push(`Check-in: ${listing.checkInTimeStart}${end}`);
  }

  if (listing.checkOutTime) {
    lines.push(`Checkout before ${listing.checkOutTime}`);
  }

  lines.push(`${listing.maxGuests} guests maximum`);

  return lines.slice(0, 3);
}

function buildSafetyPreview(listing: IGetListingResponseDto): string[] {
  const devices = parseTriStateYesItems(
    listing.safetyDevices,
    SAFETY_DEVICES_CONFIG,
  );
  const considerations = parseTriStateYesItems(
    listing.safetyConsiderations,
    SAFETY_CONSIDERATIONS_CONFIG,
  );
  return [...devices, ...considerations].slice(0, 3).map((i) => i.label);
}

function MobileCard({ card }: { card: ThingsToKnowCard }) {
  return (
    <ButtonBase
      onClick={card.onOpen}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        width: '100%',
        textAlign: 'left',
        py: 2,
        borderBottom: 1,
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 0 },
      }}
    >
      <Box sx={{ mr: 2, mt: 0.5 }}>
        <AmenityIcon name={card.icon} size={24} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {card.title}
        </Typography>
        {card.lines.map((line, i) => (
          <Typography
            key={i}
            variant="body2"
            sx={{ color: 'text.secondary', lineHeight: 1.6 }}
          >
            {line}
          </Typography>
        ))}
      </Box>
      <Box sx={{ ml: 1, mt: 0.5 }}>
        <ChevronRightIcon sx={{ color: 'text.secondary' }} />
      </Box>
    </ButtonBase>
  );
}

function DesktopCard({ card }: { card: ThingsToKnowCard }) {
  return (
    <Box>
      <AmenityIcon name={card.icon} size={28} />
      <Typography variant="body1" sx={{ fontWeight: 600, mt: 1.5, mb: 1 }}>
        {card.title}
      </Typography>
      {card.lines.map((line, i) => (
        <Typography
          key={i}
          variant="body2"
          sx={{ color: 'text.secondary', lineHeight: 1.6 }}
        >
          {line}
        </Typography>
      ))}
      <Link
        component="button"
        onClick={card.onOpen}
        variant="body2"
        sx={{ mt: 1, fontWeight: 600, cursor: 'pointer' }}
        underline="always"
      >
        Learn more
      </Link>
    </Box>
  );
}

export function ListingThingsToKnowSection({
  listing,
}: ListingThingsToKnowSectionProps) {
  const [houseRulesOpen, setHouseRulesOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });

  const houseRulesLines = buildHouseRulesPreview(listing);
  const safetyLines = buildSafetyPreview(listing);

  const cards: ThingsToKnowCard[] = [
    {
      id: 'house-rules',
      icon: 'clipboard-text-outline',
      title: 'House rules',
      lines: houseRulesLines,
      onOpen: () => setHouseRulesOpen(true),
    },
    {
      id: 'safety',
      icon: 'shield-check-outline',
      title: 'Safety',
      lines:
        safetyLines.length > 0
          ? safetyLines
          : ['No safety information provided'],
      onOpen: () => setSafetyOpen(true),
    },
    {
      id: 'placeholder',
      icon: 'information-outline',
      title: 'Lorem ipsum',
      lines: [
        'Dolor sit amet',
        'Consectetur adipiscing',
        'Elit sed do eiusmod',
      ],
      onOpen: () => {},
    },
  ];

  return (
    <Box
      sx={{
        py: 4,
        borderBottom: 1,
        borderColor: 'divider',
        textAlign: { xs: 'center', md: 'left' },
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 600, color: 'custom.grey950', mb: 2, fontSize: 22 }}
      >
        Things to know
      </Typography>

      {isMobile ? (
        <Stack>
          {cards.map((card) => (
            <MobileCard key={card.id} card={card} />
          ))}
        </Stack>
      ) : (
        <Grid container spacing={4}>
          {cards.map((card) => (
            <Grid key={card.id} size={{ xs: 12, md: 4 }}>
              <DesktopCard card={card} />
            </Grid>
          ))}
        </Grid>
      )}

      <ListingHouseRulesModal
        open={houseRulesOpen}
        onClose={() => setHouseRulesOpen(false)}
        listing={listing}
        fullScreen={isMobile}
      />

      <ListingSafetyModal
        open={safetyOpen}
        onClose={() => setSafetyOpen(false)}
        safetyDevices={listing.safetyDevices}
        safetyConsiderations={listing.safetyConsiderations}
        fullScreen={isMobile}
      />
    </Box>
  );
}
