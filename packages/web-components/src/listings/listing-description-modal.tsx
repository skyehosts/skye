'use client';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { ListingModalHeader } from './listing-modal-styles';

export interface ListingDescriptionModalProps {
  open: boolean;
  onClose: () => void;
  fields: { heading: string; content: string; hideHeadingInModal?: boolean }[];
  fullScreen?: boolean;
}

export function ListingDescriptionModal({
  open,
  onClose,
  fields,
  fullScreen,
}: ListingDescriptionModalProps) {
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
      <ListingModalHeader title="About this place" onClose={onClose} />
      <DialogContent sx={{ pt: 2, flex: '1 1 auto', minHeight: 0 }}>
        {fields.map((field, index) => (
          <Box
            key={field.heading}
            sx={{ mb: index < fields.length - 1 ? 3 : 0 }}
          >
            {!field.hideHeadingInModal && (
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                {field.heading}
              </Typography>
            )}
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}
            >
              {field.content}
            </Typography>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
}
