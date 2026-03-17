import type {
  IGetListingResponseDto,
  IUpdateListingRequestDto,
} from "../../../../packages/skye-hosts-api-client/src";
import {
  ACCESSIBILITY_FEATURES_CONFIG,
  ListingAccessibilityFeatureId,
} from "../../../../packages/skye-hosts-api-client/src";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Appbar, Switch } from "react-native-paper";
import { AppSnackbar } from "../components/app-snackbar";
import { ActionBar } from "../components/action-bar";
import { ScreenContainer } from "../components/screen-container";
import { fetchApi } from "../services/api";
import { colors, commonStyles, spacing } from "../theme";
import { handleApiError } from "../utils/form-error-handler";

export default function AccessibilityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [selected, setSelected] = useState<Set<ListingAccessibilityFeatureId>>(
    new Set(),
  );

  const fetchListing = useCallback(async () => {
    try {
      const data = await fetchApi<IGetListingResponseDto>(`/listing/${id}`);
      setSelected(new Set(data.accessibilityFeatures));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const toggleFeature = (featureId: ListingAccessibilityFeatureId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(featureId)) {
        next.delete(featureId);
      } else {
        next.add(featureId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setServerError("");
    try {
      await fetchApi<IGetListingResponseDto, IUpdateListingRequestDto>(
        `/listing/${id}`,
        { accessibilityFeatures: Array.from(selected) },
        { method: "PATCH" },
      );
      router.back();
    } catch (e) {
      handleApiError(e, setServerError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Accessibility features" />
      </Appbar.Header>

      {loading ? (
        <ActivityIndicator style={commonStyles.sectionLoader} />
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={commonStyles.bodyText}>
              Let guests know about the accessibility features available at your
              listing.
            </Text>

            <View style={commonStyles.borderedRows}>
              {ACCESSIBILITY_FEATURES_CONFIG.map((feature, index) => (
                <View key={feature.id}>
                  {index > 0 && (
                    <View style={commonStyles.borderedRowDivider} />
                  )}
                  <View style={styles.featureItem}>
                    <View style={styles.featureContent}>
                      <Text style={commonStyles.itemTitle}>
                        {feature.title}
                      </Text>
                      <Text
                        style={[
                          commonStyles.itemSubtext,
                          styles.featureDescription,
                        ]}
                      >
                        {feature.description}
                      </Text>
                    </View>
                    <Switch
                      value={selected.has(feature.id)}
                      onValueChange={() => toggleFeature(feature.id)}
                      disabled={saving}
                    />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <ActionBar
            onCancel={() => router.back()}
            onSave={handleSave}
            loading={saving}
            showDivider={false}
            containerStyle={commonStyles.footer}
          />
        </>
      )}

      <AppSnackbar message={serverError} onDismiss={() => setServerError("")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  featureContent: {
    flex: 1,
    gap: spacing.xs,
  },
  featureDescription: {
    maxWidth: "80%",
    color: colors.textSecondary,
  },
});
