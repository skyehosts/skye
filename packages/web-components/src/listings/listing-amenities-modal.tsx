'use client';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type { IListingAmenityCategoryDto } from '@repo/skye-hosts-api-client';
import { AmenityRow } from './amenity-icon';
import { ListingModalHeader } from './listing-modal-styles';

export interface ListingAmenitiesModalProps {
  open: boolean;
  onClose: () => void;
  categories: IListingAmenityCategoryDto[];
  fullScreen?: boolean;
}

export function ListingAmenitiesModal({
  open,
  onClose,
  categories,
  fullScreen,
}: ListingAmenitiesModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      slotProps={{
        paper: { sx: { overflowX: 'hidden' } },
      }}
    >
      <ListingModalHeader title="What this place offers" onClose={onClose} />

      <DialogContent sx={{ pt: 2, flex: '1 1 auto', minHeight: 0 }}>
        {categories.map((category, catIndex) => (
          <Box
            key={category.id}
            sx={{ mb: catIndex < categories.length - 1 ? 4 : 0 }}
          >
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              {category.title}
            </Typography>

            <Grid container spacing={0}>
              {category.amenities.map((amenity) => (
                <Grid
                  key={amenity.id}
                  size={{ xs: 12, sm: 6 }}
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    py: 1.5,
                  }}
                >
                  <AmenityRow icon={amenity.icon} title={amenity.title} />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
}
