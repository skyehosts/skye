import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

export const listingModalStyles: Record<string, SxProps<Theme>> = {
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid',
    borderColor: 'custom.warmStone',
    px: 2,
    py: 1.5,
  },
};

export function ListingModalHeader({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children?: ReactNode;
}) {
  return (
    <Box sx={{ px: 2, pt: 2 }}>
      <Box sx={listingModalStyles.titleRow}>
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon />
        </IconButton>
      </Box>
      {children}
    </Box>
  );
}
