import {
  formatGbp,
  PRICING_SEASON_IDS,
  type IGetListingPricingResponseDto,
  type IListingDiscountsDto,
  type IListingSeasonPricingDto,
  type IUpdateDiscountsRequestDto,
  type IUpdateSeasonPricingRequestDto,
  type PricingSeasonId,
} from "@repo/common";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Appbar } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { InfoBox } from "../components/info-box";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import { captureException } from "../services/error-reporting";
import { colors, commonStyles, spacing, typography } from "../theme";
import { handleApiError } from "../utils/form-error-handler";
import { DiscountsSection } from "./pricing/discounts-section";
import { SeasonCard } from "./pricing/season-card";
import { SeasonWizardModal } from "./pricing/season-wizard-modal";

export default function PricingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listingId = id as string;
  const [pricing, setPricing] = useState<IGetListingPricingResponseDto | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [activeSeason, setActiveSeason] = useState<PricingSeasonId | null>(
    null,
  );
  const discountsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPricing = useCallback(async () => {
    if (!listingId) return;
    try {
      const data = await fetchApi<IGetListingPricingResponseDto>(
        `/listing/${listingId}/pricing`,
        undefined,
        { method: "GET" },
      );
      setPricing(data);
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useFocusEffect(
    useCallback(() => {
      fetchPricing();
    }, [fetchPricing]),
  );

  const getSeason = (
    s: PricingSeasonId,
  ): IListingSeasonPricingDto | undefined =>
    pricing?.seasons.find((x) => x.season === s);

  const handleSaveSeason = async (
    season: PricingSeasonId,
    weekdayPence: number,
    weekendPence: number,
  ) => {
    try {
      const body: IUpdateSeasonPricingRequestDto = {
        weekdayPricePence: weekdayPence,
        weekendPricePence: weekendPence,
      };
      await fetchApi(`/listing/${listingId}/pricing/seasons/${season}`, body, {
        method: "PUT",
      });
      setActiveSeason(null);
      await fetchPricing();
    } catch (e) {
      handleApiError(e, setServerError);
    }
  };

  const handleDiscountsChange = (next: IListingDiscountsDto) => {
    if (!pricing) return;
    const nextGlobals = { ...pricing.globals, ...next };
    setPricing({ ...pricing, globals: nextGlobals });
    if (discountsTimerRef.current) clearTimeout(discountsTimerRef.current);
    discountsTimerRef.current = setTimeout(async () => {
      try {
        const body: IUpdateDiscountsRequestDto = next;
        await fetchApi(`/listing/${listingId}/pricing/discounts`, body, {
          method: "PUT",
        });
      } catch (e) {
        captureException(e);
        handleApiError(e, setServerError);
      }
    }, 250);
  };

  if (loading || !pricing) {
    return (
      <ScreenContainer>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Pricing" />
        </Appbar.Header>
        <ActivityIndicator style={styles.loader} />
      </ScreenContainer>
    );
  }

  const activeSeasonData = activeSeason ? getSeason(activeSeason) : undefined;

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Pricing" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scroll}>
        <InfoBox variant="info">
          The price you set is what you receive after fees. Set it ~7% higher
          than your Airbnb net — you earn more, guests still pay less.
        </InfoBox>

        <View style={commonStyles.editSection}>
          <Text style={commonStyles.sectionTitle}>Seasons</Text>
          <Text style={commonStyles.sectionSubtext}>
            Set your weekday and weekend nightly rates for each season.
          </Text>
          <View style={commonStyles.editSectionCards}>
            {PRICING_SEASON_IDS.map((season) => {
              const data = getSeason(season);
              return (
                <SeasonCard
                  key={season}
                  season={season}
                  weekdayPricePence={data?.weekdayPricePence}
                  weekendPricePence={data?.weekendPricePence}
                  onPress={() => setActiveSeason(season)}
                />
              );
            })}
          </View>
        </View>

        <View style={commonStyles.editSection}>
          <Text style={commonStyles.sectionTitle}>Cleaning fee</Text>
          <View style={commonStyles.card}>
            <Text style={commonStyles.itemTitle}>Per stay</Text>
            <Text style={styles.largeValue}>
              {formatGbp(pricing.globals.cleaningFeePence)}
            </Text>
          </View>
        </View>

        <View style={commonStyles.editSection}>
          <Text style={commonStyles.sectionTitle}>Extra guest fee</Text>
          <View style={commonStyles.card}>
            {pricing.globals.extraGuestThreshold > 0 &&
            pricing.globals.extraGuestFeePence > 0 ? (
              <>
                <Text style={commonStyles.itemTitle}>
                  After {pricing.globals.extraGuestThreshold} guests
                </Text>
                <Text style={styles.largeValue}>
                  {formatGbp(pricing.globals.extraGuestFeePence)}{" "}
                  <Text style={styles.perNight}>per guest, per night</Text>
                </Text>
              </>
            ) : (
              <Text style={commonStyles.itemSubtext}>
                No extra guest fee configured
              </Text>
            )}
          </View>
        </View>

        <DiscountsSection
          discounts={{
            lastMinuteEnabled: pricing.globals.lastMinuteEnabled,
            lastMinutePercent: pricing.globals.lastMinutePercent,
            weeklyEnabled: pricing.globals.weeklyEnabled,
            weeklyPercent: pricing.globals.weeklyPercent,
            monthlyEnabled: pricing.globals.monthlyEnabled,
            monthlyPercent: pricing.globals.monthlyPercent,
          }}
          onChange={handleDiscountsChange}
        />

        {!pricing.isComplete && (
          <InfoBox variant="warning">
            Set all three seasons before publishing this listing.
          </InfoBox>
        )}
      </ScrollView>

      {activeSeason && (
        <SeasonWizardModal
          visible={true}
          season={activeSeason}
          initialWeekdayPence={activeSeasonData?.weekdayPricePence ?? 0}
          initialWeekendPence={activeSeasonData?.weekendPricePence ?? 0}
          onCancel={() => setActiveSeason(null)}
          onSave={(wd, we) => handleSaveSeason(activeSeason, wd, we)}
        />
      )}

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  loader: {
    marginTop: spacing.xl,
  },
  largeValue: {
    fontSize: typography.xl,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  perNight: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
});
