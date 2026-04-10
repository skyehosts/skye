'use client';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import {
  SAFETY_CONSIDERATIONS_CONFIG,
  SAFETY_DEVICES_CONFIG,
} from '@repo/skye-hosts-api-client';
import { ListingModalHeader } from './listing-modal-styles';
import {
  ItemList,
  ModalSection,
  parseTriStateYesItems,
} from './listing-things-to-know-styles';

export interface ListingSafetyModalProps {
  open: boolean;
  onClose: () => void;
  safetyDevices: string[];
  safetyConsiderations: string[];
  fullScreen?: boolean;
}

export function ListingSafetyModal({
  open,
  onClose,
  safetyDevices,
  safetyConsiderations,
  fullScreen,
}: ListingSafetyModalProps) {
  const devices = parseTriStateYesItems(safetyDevices, SAFETY_DEVICES_CONFIG);
  const considerations = parseTriStateYesItems(
    safetyConsiderations,
    SAFETY_CONSIDERATIONS_CONFIG,
  );

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
      <ListingModalHeader title="Safety on the property" onClose={onClose} />

      <DialogContent sx={{ pt: 2 }}>
        {devices.length > 0 && (
          <ModalSection title="Safety devices">
            <ItemList items={devices} />
          </ModalSection>
        )}

        {considerations.length > 0 && (
          <ModalSection title="Safety considerations">
            <ItemList items={considerations} />
          </ModalSection>
        )}

        {devices.length === 0 && considerations.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No safety information has been provided for this property.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
