import type {
  IGetHostListingsResponseDto,
  IHostListingDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Appbar, Icon } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import {
  borderRadius,
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../theme";

export default function CalendarScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<IHostListingDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchApi<IGetHostListingsResponseDto>("/listing");
      setListings(data.listings);
    } catch {
      setError("Failed to load listings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [loadListings]),
  );

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.Content title="Calendar" />
      </Appbar.Header>

      <Text style={styles.subtitle}>
        Select a listing to manage its bookings & availability.
      </Text>

      {isLoading && (
        <View style={commonStyles.centered}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {error && (
        <View style={commonStyles.centered}>
          <Text style={commonStyles.errorText}>{error}</Text>
        </View>
      )}

      {!isLoading && !error && listings.length === 0 && (
        <View style={commonStyles.centered}>
          <Text style={commonStyles.emptyText}>No listings yet</Text>
          <Text style={commonStyles.emptySubtext}>
            Create a listing to manage its calendar.
          </Text>
        </View>
      )}

      {!isLoading && !error && listings.length > 0 && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {listings.map((listing) => (
            <CalendarListingCard
              key={listing.id}
              listing={listing}
              onPress={() =>
                router.push(
                  `/calendar/${listing.id}?title=${encodeURIComponent(listing.title)}`,
                )
              }
            />
          ))}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

function CalendarListingCard({
  listing,
  onPress,
}: {
  listing: IHostListingDto;
  onPress: () => void;
}) {
  const isListed = listing.status === "active";

  return (
    <Pressable style={[commonStyles.card, styles.cardRow]} onPress={onPress}>
      <View style={styles.imageContainer}>
        {listing.coverImageUrl ? (
          <Image
            source={{ uri: listing.coverImageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={commonStyles.itemTitle} numberOfLines={1}>
          {listing.title}
        </Text>
        <View style={styles.statusChip}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isListed ? colors.success : colors.warning },
            ]}
          />
          <Text style={styles.statusText}>
            {isListed ? "Listed" : "In progress"}
          </Text>
        </View>
        <Text style={styles.location}>{listing.postCode}</Text>
      </View>
      <Icon source="chevron-right" size={24} color={colors.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
  },
  image: {
    width: 64,
    height: 64,
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: colors.placeholder,
  },
  cardContent: {
    flex: 1,
    gap: spacing.xs,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  location: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  subtitle: {
    ...commonStyles.emptySubtext,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    textAlign: "left",
  },
});
