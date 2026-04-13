import type {
  IGetHostListingsResponseDto,
  IHostListingDto,
} from "../../../../packages/skye-hosts-api-client/src";
import { LISTING_TYPE_LABELS } from "../../../../packages/skye-hosts-api-client/src";
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
import { Appbar, Button } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import {
  borderRadius,
  colors,
  commonStyles,
  fontFamily,
  fontWeight,
  spacing,
  typography,
} from "../theme";

export default function ListingsScreen() {
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
        <Appbar.Content title="Your listings" />
        <Appbar.Action
          icon="plus"
          onPress={() => router.push("/create-listing")}
        />
      </Appbar.Header>

      {isLoading && (
        <View style={commonStyles.centered}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {error && (
        <View style={commonStyles.centered}>
          <Text style={commonStyles.errorText}>{error}</Text>
          <Button mode="outlined" onPress={loadListings}>
            Retry
          </Button>
        </View>
      )}

      {!isLoading && !error && listings.length === 0 && (
        <View style={commonStyles.centered}>
          <Text style={commonStyles.emptyText}>No listings yet</Text>
          <Text style={commonStyles.emptySubtext}>
            Create your first listing to start hosting.
          </Text>
          <Button
            mode="contained"
            style={styles.ctaButton}
            onPress={() => router.push("/create-listing")}
          >
            Create listing
          </Button>
        </View>
      )}

      {!isLoading && !error && listings.length > 0 && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onPress={() => router.push(`/edit-listing/${listing.id}`)}
            />
          ))}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

function ListingCard({
  listing,
  onPress,
}: {
  listing: IHostListingDto;
  onPress: () => void;
}) {
  const isListed = listing.status === "active";
  const typeLabel = LISTING_TYPE_LABELS[listing.typeId];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.photoContainer}>
        <View style={styles.photoPlaceholder}>
          {listing.coverImageUrl && (
            <Image
              source={{ uri: listing.coverImageUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          )}
        </View>
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
      </View>
      {listing.role !== "owner" && (
        <View style={styles.roleChip}>
          <Text style={styles.roleChipText}>Co-host</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {listing.title}
        </Text>
        <Text style={styles.cardSubtitle}>{typeLabel} in Portree</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ctaButton: {
    marginTop: spacing.sm,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    borderRadius: borderRadius.md,
    overflow: "hidden",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoContainer: {
    position: "relative",
  },
  photoPlaceholder: {
    height: 200,
    backgroundColor: colors.placeholder,
    overflow: "hidden",
  },
  statusChip: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
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
  roleChip: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    zIndex: 1,
  },
  roleChipText: {
    fontSize: typography.sm,
    color: colors.background,
    fontWeight: fontWeight.medium,
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardTitle: {
    fontFamily: fontFamily.heading,
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
});
