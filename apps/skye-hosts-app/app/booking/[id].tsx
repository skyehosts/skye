import type { IGetBookingResponseDto } from "../../../../packages/skye-hosts-api-client/src";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Appbar, Card, Chip, Divider } from "react-native-paper";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import {
  colors,
  commonStyles,
  fontWeight,
  spacing,
  typography,
} from "../theme";

export default function BookingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [booking, setBooking] = useState<IGetBookingResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBooking = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchApi<IGetBookingResponseDto>(`/booking/${id}`);
      setBooking(data);
    } catch {
      setError("Failed to load booking details.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getNights = (checkIn: string, checkOut: string) => {
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return colors.success;
      case "cancelled":
        return colors.danger;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Booking Details" />
      </Appbar.Header>

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

      {booking && (
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.listingTitle}>{booking.listingTitle}</Text>
              <Chip
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(booking.status) + "20" },
                ]}
                textStyle={[
                  styles.statusText,
                  { color: getStatusColor(booking.status) },
                ]}
              >
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </Chip>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Guest</Text>
              <Text style={styles.value}>{booking.guestName}</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Stay</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateBlock}>
                  <Text style={styles.dateLabel}>Check-in</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(booking.checkInDate)}
                  </Text>
                </View>
                <View style={styles.dateBlock}>
                  <Text style={styles.dateLabel}>Check-out</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(booking.checkOutDate)}
                  </Text>
                </View>
              </View>
              <Divider style={styles.divider} />
              <View style={[commonStyles.row, { paddingVertical: spacing.xs }]}>
                <Text style={styles.label}>Nights</Text>
                <Text style={styles.value}>
                  {getNights(booking.checkInDate, booking.checkOutDate)}
                </Text>
              </View>
              <View style={[commonStyles.row, { paddingVertical: spacing.xs }]}>
                <Text style={styles.label}>Total</Text>
                <Text style={styles.totalValue}>
                  £{booking.totalPrice.toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={[commonStyles.row, { paddingVertical: spacing.xs }]}>
                <Text style={styles.label}>Booked on</Text>
                <Text style={styles.value}>
                  {formatDate(booking.createdAt)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.background,
  },
  listingTitle: {
    fontSize: typography.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statusChip: {
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: typography.sm,
    fontWeight: fontWeight.semibold,
  },
  sectionTitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  dateBlock: {
    flex: 1,
  },
  dateLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dateValue: {
    fontSize: typography.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  divider: {
    marginVertical: spacing.md,
  },
  label: {
    fontSize: typography.md,
    color: colors.textSecondary,
  },
  value: {
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: typography.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
});
