'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { ListingMapModal } from './listing-map-modal';

export interface ListingLocationSectionProps {
  approximateLatitude: number | null;
  approximateLongitude: number | null;
  googleMapsStaticApiKey: string;
  mapboxAccessToken: string;
  listingTitle: string;
}

export function ListingLocationSection({
  approximateLatitude,
  approximateLongitude,
  googleMapsStaticApiKey,
  mapboxAccessToken,
  listingTitle,
}: ListingLocationSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);

  if (approximateLatitude == null || approximateLongitude == null) {
    return null;
  }

  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=57.3463150,-6.2155023&zoom=8&size=560x235&scale=2&markers=size:small|color:red|${approximateLatitude},${approximateLongitude}&key=${googleMapsStaticApiKey}`;
  const directionsUrl = `https://www.google.com/maps?q=${approximateLatitude},${approximateLongitude}`;

  return (
    <>
      <Box sx={{ mt: 4 }}>
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: 600, color: 'custom.grey950', fontSize: 22 }}
        >
          Where you&apos;ll be
        </Typography>

        <Card
          sx={{
            cursor: 'pointer',
            overflow: 'hidden',
            borderRadius: 2,
            '&:hover': { boxShadow: 4 },
          }}
          onClick={() => setModalOpen(true)}
        >
          <Box
            component="img"
            src={staticMapUrl}
            alt="Approximate listing location"
            sx={{
              width: '100%',
              height: { xs: 300, md: 336 },
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </Card>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Approximate location shown
          </Typography>
          <Link
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            variant="body2"
          >
            Get directions
          </Link>
        </Box>
      </Box>

      <ListingMapModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        approximateLatitude={approximateLatitude}
        approximateLongitude={approximateLongitude}
        mapboxAccessToken={mapboxAccessToken}
        listingTitle={listingTitle}
      />
    </>
  );
}
