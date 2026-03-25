import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Appbar } from "react-native-paper";
import type {
  IGetListingBookingsResponseDto,
  IListingBookingItemDto,
} from "@repo/skye-hosts-api-client";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import { CalendarList } from "./components/calendar-list";

export default function CalendarDetailScreen() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();
  const [bookings, setBookings] = useState<IListingBookingItemDto[]>([]);

  const loadBookings = useCallback(async () => {
    try {
      const data = await fetchApi<IGetListingBookingsResponseDto>(
        `/booking/listing/${id}`,
        undefined,
        { method: "GET" },
      );
      setBookings(data.bookings);
    } catch {
      // silently fail — calendar still usable without bookings
    }
  }, [id]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={title ?? "Calendar"} />
      </Appbar.Header>
      <CalendarList bookings={bookings} />
    </ScreenContainer>
  );
}
