import type { IGetListingResponseDto } from "../../../../packages/skye-hosts-api-client/src";
import { SAFETY_CONSIDERATIONS_CONFIG } from "../../../../packages/skye-hosts-api-client/src";
import { TriStateListModal } from "./tri-state-list-modal";

interface SafetyConsiderationsModalProps {
  visible: boolean;
  onDismiss: () => void;
  listing: IGetListingResponseDto;
  onSaved: (updated: IGetListingResponseDto) => void;
}

export function SafetyConsiderationsModal({
  visible,
  onDismiss,
  listing,
  onSaved,
}: SafetyConsiderationsModalProps) {
  return (
    <TriStateListModal
      visible={visible}
      onDismiss={onDismiss}
      title="Safety considerations"
      items={SAFETY_CONSIDERATIONS_CONFIG}
      listingId={listing.id}
      currentValues={listing.safetyConsiderations ?? []}
      updateField="safetyConsiderations"
      onSaved={onSaved}
    />
  );
}
