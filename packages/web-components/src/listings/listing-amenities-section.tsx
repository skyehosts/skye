'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type {
  IListingAmenityCategoryDto,
  IListingAmenityDto,
  ListingAmenityId,
} from '@repo/skye-hosts-api-client';
import { useMemo, useState } from 'react';
import { AmenityRow } from './amenity-icon';
import { ListingAmenitiesModal } from './listing-amenities-modal';

export interface ListingAmenitiesSectionProps {
  amenityIds: ListingAmenityId[];
  categories: IListingAmenityCategoryDto[];
}

const PREVIEW_LIMIT = 5;

export function ListingAmenitiesSection({
  amenityIds,
  categories,
}: ListingAmenitiesSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });

  const { flatAmenities, filteredCategories } = useMemo(() => {
    const idSet = new Set<string>(amenityIds);
    const flat: IListingAmenityDto[] = [];
    const filtered: IListingAmenityCategoryDto[] = [];

    for (const category of categories) {
      const matching = category.amenities.filter((a) => idSet.has(a.id));
      if (matching.length > 0) {
        flat.push(...matching);
        filtered.push({ ...category, amenities: matching });
      }
    }

    return { flatAmenities: flat, filteredCategories: filtered };
  }, [amenityIds, categories]);

  if (flatAmenities.length === 0) return null;

  const previewAmenities = flatAmenities.slice(0, PREVIEW_LIMIT);

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
        sx={{ fontWeight: 600, color: 'custom.grey950', mb: 1, fontSize: 22 }}
      >
        What this place offers
      </Typography>

      <Stack spacing={1.5}>
        {previewAmenities.map((amenity) => (
          <Box
            key={amenity.id}
            sx={{
              justifyContent: { xs: 'center', md: 'flex-start' },
              display: 'flex',
            }}
          >
            <AmenityRow icon={amenity.icon} title={amenity.title} />
          </Box>
        ))}
      </Stack>

      {flatAmenities.length > PREVIEW_LIMIT && (
        <Button
          variant="contained"
          onClick={() => setModalOpen(true)}
          aria-expanded={modalOpen}
          aria-haspopup="dialog"
          sx={{ mt: 1.5 }}
        >
          Show all {flatAmenities.length} amenities
        </Button>
      )}

      {modalOpen && (
        <ListingAmenitiesModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          categories={filteredCategories}
          fullScreen={isMobile}
        />
      )}
    </Box>
  );
}
