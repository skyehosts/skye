import {
  type CancellationPolicyShortTermId,
  type IGetListingResponseDto,
  type IUpdateListingRequestDto,
  CANCELLATION_POLICY_SHORT_TERM_OPTIONS,
} from "../../../../packages/skye-hosts-api-client/src";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Appbar, Button } from "react-native-paper";
import { AppModal } from "../components/app-modal";
import { AppSnackbar } from "../components/app-snackbar";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import {
  colors,
  commonStyles,
  fontWeight,
  lineHeight,
  spacing,
  typography,
} from "../theme";
import { handleApiError } from "../utils/form-error-handler";

export default function CancellationPolicyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<IGetListingResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] =
    useState<CancellationPolicyShortTermId | null>(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [policyModalVisible, setPolicyModalVisible] = useState(false);

  const fetchListing = useCallback(async () => {
    try {
      const data = await fetchApi<IGetListingResponseDto>(
        `/listing/${id}/edit`,
      );
      setListing(data);
      setSelected(data.cancellationPolicyShortTerm);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchListing();
    }, [fetchListing]),
  );

  const handleSave = async () => {
    if (!selected || !listing) return;
    setSaving(true);
    try {
      const updated = await fetchApi<
        IGetListingResponseDto,
        IUpdateListingRequestDto
      >(
        `/listing/${listing.id}`,
        { cancellationPolicyShortTerm: selected },
        { method: "PATCH" },
      );
      setListing(updated);
      router.back();
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  };

  const hasChanged =
    listing !== null && selected !== listing.cancellationPolicyShortTerm;

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Cancellation Policy" />
      </Appbar.Header>

      {loading || !listing ? (
        <ActivityIndicator style={commonStyles.sectionLoader} />
      ) : (
        <>
          <ScrollView
            style={commonStyles.flex}
            contentContainerStyle={styles.scrollContent}
          >
            {/* These options currently apply to all stays. The section is
                separated to allow adding a distinct long-term cancellation
                policy in future. */}
            <View style={styles.section}>
              <Text style={commonStyles.itemTitle}>Standard cancellation</Text>
              <Text style={styles.bodyText}>
                All policies include a 24-hour free cancellation period after
                booking.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.fieldLabel}>Your policy</Text>
              <View style={styles.cards}>
                {CANCELLATION_POLICY_SHORT_TERM_OPTIONS.map((option) => {
                  const isSelected = selected === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      style={[
                        commonStyles.card,
                        { gap: spacing.xs },
                        isSelected && commonStyles.cardSelected,
                      ]}
                      onPress={() => setSelected(option.id)}
                    >
                      <Text
                        style={[
                          commonStyles.cardTitle,
                          isSelected && commonStyles.cardTitleSelected,
                        ]}
                      >
                        {option.title}
                      </Text>
                      {option.refundDetails.map((detail) => (
                        <Text key={detail} style={styles.bodyText}>
                          {detail}
                        </Text>
                      ))}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Text style={styles.bodyText}>
              For a detailed breakdown of each policy, including exact refund
              percentages and cut-off times, review the{" "}
              <Text
                style={styles.link}
                onPress={() => setPolicyModalVisible(true)}
              >
                full cancellation policies
              </Text>
              .
            </Text>
          </ScrollView>

          <View style={commonStyles.footer}>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
              disabled={!hasChanged || saving}
            >
              Save
            </Button>
          </View>
        </>
      )}

      <AppModal
        visible={policyModalVisible}
        onDismiss={() => setPolicyModalVisible(false)}
      >
        <Text style={commonStyles.modalTitle}>Full Cancellation Policies</Text>
        <ScrollView style={{ flexGrow: 0 }}>
          <Text style={styles.bodyText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.{"\n\n"}
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.{"\n\n"}
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo.
          </Text>
        </ScrollView>
      </AppModal>

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  bodyText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: lineHeight.sm,
  },
  link: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    textDecorationLine: "underline",
  },
  section: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: typography.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  cards: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
});
