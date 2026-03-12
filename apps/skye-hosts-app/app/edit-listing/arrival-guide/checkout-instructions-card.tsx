import type { IGetListingResponseDto } from "../../../../../packages/skye-hosts-api-client/src";
import { CHECKOUT_INSTRUCTION_OPTIONS } from "../../../../../packages/skye-hosts-api-client/src";
import { router } from "expo-router";
import { Pressable, Text } from "react-native";
import { commonStyles } from "../../theme";

interface CheckoutInstructionsCardProps {
  listingId: string;
  listing: IGetListingResponseDto | null;
}

export function CheckoutInstructionsCard({
  listingId,
  listing,
}: CheckoutInstructionsCardProps) {
  const setInstructions = CHECKOUT_INSTRUCTION_OPTIONS.filter(
    (opt) =>
      listing?.[opt.field as keyof IGetListingResponseDto] !== null &&
      listing?.[opt.field as keyof IGetListingResponseDto] !== undefined,
  );

  const subtext =
    setInstructions.length > 0
      ? setInstructions.map((opt) => opt.title).join(", ")
      : "Add details";

  return (
    <Pressable
      style={commonStyles.card}
      onPress={() =>
        router.push({
          pathname: "/edit-listing/checkout-instructions",
          params: { id: listingId },
        })
      }
    >
      <Text style={commonStyles.itemTitle}>Checkout instructions</Text>
      <Text style={commonStyles.cardSubtext} numberOfLines={3}>
        {subtext}
      </Text>
    </Pressable>
  );
}
