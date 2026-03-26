import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { ListingModalHeader } from './listing-modal-styles';

interface ListingConfirmPayModalProps {
  open: boolean;
  onClose: () => void;
}

export function ListingConfirmPayModal({
  open,
  onClose,
}: ListingConfirmPayModalProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <ListingModalHeader title="Confirm and pay" onClose={onClose} />
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
