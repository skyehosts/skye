import type { IGetListingResponseDto } from "../../../../packages/skye-hosts-api-client/src";
import { SAFETY_DEVICES_CONFIG } from "../../../../packages/skye-hosts-api-client/src";
import { TriStateListModal } from "./tri-state-list-modal";

interface SafetyDevicesModalProps {
  visible: boolean;
  onDismiss: () => void;
  listing: IGetListingResponseDto;
  onSaved: (updated: IGetListingResponseDto) => void;
}

export function SafetyDevicesModal({
  visible,
  onDismiss,
  listing,
  onSaved,
}: SafetyDevicesModalProps) {
  return (
    <TriStateListModal
      visible={visible}
      onDismiss={onDismiss}
      title="Safety devices"
      items={SAFETY_DEVICES_CONFIG}
      listingId={listing.id}
      currentValues={listing.safetyDevices ?? []}
      updateField="safetyDevices"
      onSaved={onSaved}
    />
  );
}
